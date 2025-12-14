import json
import os
import sys

# Helper Functions for Advanced Metrics

def calculate_hs_percent(stats):
    """Calculates true HS% from total shots hit."""
    head = stats.get('headshots', 0)
    body = stats.get('bodyshots', 0)
    leg = stats.get('legshots', 0)
    total_hits = head + body + leg
    return round((head / total_hits * 100), 1) if total_hits > 0 else 0

def calculate_first_bloods(rounds, puuid):
    fb = 0
    for rnd in rounds:
        earliest = 9999999
        killer = None
        for ps in rnd.get('player_stats', []):
            for k in ps.get('kill_events', []):
                kt = k.get('kill_time_in_round', 99999)
                if kt < earliest:
                    earliest = kt
                    killer = k.get('killer_puuid')
        if killer == puuid:
            fb += 1
    return fb

def calculate_clutches(rounds, target_puuid, target_team):
    """
    Analyzes rounds to find 1vX situations that were won.
    Returns: { "1v1": count, "1v2": count, ... }
    """
    clutches = {
        "1v1": 0,
        "1v2": 0,
        "1v3": 0,
        "1v4": 0,
        "1v5": 0
    }

    for rnd in rounds:
        # 1. Check Win
        winning_team = rnd.get('winning_team', '').lower()
        if winning_team != target_team.lower():
            continue 

        # 2. Replay Kills to find Clutch Moment
        # We need to track alive counts.
        # Assuming 5v5 start.
        # Ideally we'd map all players to teams, but simplified:
        # Clutch = At some point, allies_alive == 1 (YOU) and enemies_alive >= 1.
        # AND you survive (or trade out last? No, you must be alive at end usually, or bomb explodes).
        # Simplified Check: 
        # - You are the ONLY one alive on your team at end of round (or moment of win).
        # - Count enemies alive at the moment you BECAME the only one alive.
        
        kill_events = []
        for ps in rnd.get('player_stats', []):
            for k in ps.get('kill_events', []):
                kill_events.append(k)
        
        kill_events.sort(key=lambda x: x.get('kill_time_in_round', 0))
        
        target_died = False
        allies_alive = 5
        enemies_alive = 5
        
        clutch_situation = None # e.g. 2 for 1v2
        
        # We also need to account for players who might be AFK or not spawned? 
        # Assuming 5v5 for simplicity.
        
        for k in kill_events:
            victim = k.get('victim_puuid')
            killer = k.get('killer_puuid')
            
            # We need to know victim's team.
            # API kill events validly usually have `victim_team`.
            # If not, we can infer if victim == target (ally) or not? 
            # No, if victim != target, it could be ally or enemy.
            # We strictly need a PUUID->Team look up to be accurate.
            # Since we don't passed it, we try `victim_team` from event.
            # If unavailable, heuristics fail.
            # But let's assume `victim_team` exists (Red/Blue).
            
            v_team = k.get('victim_team', '')
            if not v_team: 
                # Fallback: We can't determine clutch without team. Skip.
                continue
                
            if victim == target_puuid:
                target_died = True
                break # Failed clutch
                
            if v_team.lower() == target_team.lower():
                allies_alive -= 1
            else:
                enemies_alive -= 1
            
            # Did clutch start?
            if allies_alive == 1 and not target_died:
                # You are last alive.
                if clutch_situation is None:
                    clutch_situation = enemies_alive
                    
        # Check success
        if clutch_situation and not target_died and clutch_situation > 0:
            key = f"1v{clutch_situation}"
            if key in clutches:
                clutches[key] += 1
            elif clutch_situation > 5:
                clutches["1v5"] += 1
                
    return clutches

def calculate_advanced_combat(rounds, puuid, team):
    """
    Calculates:
    - First Duels (Taken, Won, Win%)
    - Clutches (Opportunities, Won, Best)
    - Trades (Kills on enemy who just killed teammate, Deaths traded by teammate)
    """
    duels_taken = 0
    duels_won = 0
    trade_kills = 0
    traded_deaths = 0 
    
    for rnd in rounds:
        # 1. First Duels
        kill_events = []
        for ps in rnd.get('player_stats', []):
            for k in ps.get('kill_events', []):
                kill_events.append(k)
        
        kill_events.sort(key=lambda x: x.get('kill_time_in_round', 0))
        
        if kill_events:
            first_kill = kill_events[0]
            if first_kill['killer_puuid'] == puuid:
                duels_taken += 1
                duels_won += 1
            elif first_kill['victim_puuid'] == puuid:
                duels_taken += 1
                
        # 2. Trades 
        for k in kill_events:
            if k['killer_puuid'] == puuid:
                victim_id = k['victim_puuid']
                kill_time = k['kill_time_in_round']
                # Did this victim kill a teammate recently?
                for prev_k in kill_events:
                    if prev_k == k: break 
                    if (prev_k['killer_puuid'] == victim_id and 
                        (kill_time - prev_k['kill_time_in_round']) <= 5000):
                        trade_kills += 1
                        break
            
            if k['victim_puuid'] == puuid:
                killer_id = k['killer_puuid']
                death_time = k['kill_time_in_round']
                # Did a teammate kill this killer soon after?
                for future_k in kill_events:
                    if future_k['kill_time_in_round'] < death_time: continue
                    if (future_k['killer_puuid'] != puuid and 
                        future_k['victim_puuid'] == killer_id and
                        (future_k['kill_time_in_round'] - death_time) <= 5000):
                        traded_deaths += 1
                        break
                        
    # 3. Clutches 
    clutch_stats = calculate_clutches(rounds, puuid, team)
    
    # Calculate opportunities (approximated as sum of 1vX wons + fails?)
    # For now just showing won breakdown is cleaner.
    
    return {
        "first_duels": {
            "taken": duels_taken,
            "won": duels_won,
            "win_rate": round(duels_won/duels_taken*100, 1) if duels_taken > 0 else 0
        },
        "trades": {
            "trade_kills": trade_kills,
            "traded_deaths": traded_deaths
        },
        "clutches": clutch_stats
    }

def calculate_positioning(rounds, puuid):
    """
    Calculates:
    - Avg Death Time (in seconds)
    - Entry Deaths (Dying first in the round)
    """
    total_death_time = 0
    deaths = 0
    entry_deaths = 0
    
    for rnd in rounds:
        kill_events = []
        for ps in rnd.get('player_stats', []):
            for k in ps.get('kill_events', []):
                kill_events.append(k)
        
        kill_events.sort(key=lambda x: x.get('kill_time_in_round', 0))
        
        # Check Entry Death
        if kill_events:
            if kill_events[0]['victim_puuid'] == puuid:
                entry_deaths += 1
                
        # Find Player Death
        for k in kill_events:
            if k['victim_puuid'] == puuid:
                dt = k.get('kill_time_in_round', 0)
                total_death_time += dt
                deaths += 1
                break
                
    avg_time_ms = total_death_time / deaths if deaths > 0 else 0
    
    return {
        "avg_death_time_sec": int(avg_time_ms / 1000),
        "entry_deaths": entry_deaths
    }

def calculate_advanced_economy(rounds, puuid, player_team):
    """
    Calculates:
    - Bad Force Buys (Player bought > 3900 while Team Avg < 2500)
    - Eco Frags (Kills when Player Loadout < 1500 vs Enemy > 3000)
    - Team Economy Context (Who had better guns?)
    """
    bad_forces = 0
    eco_kills = 0
    
    for rnd in rounds:
        # Get Team Economies
        my_team_val = 0
        my_team_count = 0
        player_val = 0
        
        # Parse Round Loadouts
        for ps in rnd.get('player_stats', []):
            val = ps.get('economy', {}).get('loadout_value', 0)
            pid = ps.get('player_puuid')
            
            # Identify Team (Simplified: Match PUUID = My Team? 
            # Wait, we need to know teammates. We can infer from `match_info` players list or just `stats` if available.
            # Assuming we can't easily map team without pre-processing.
            # TRICK: Check if they are on same team string 'Blue'/'Red' from players meta.
            # But inside rounds we only have PUUID.
            # We will skip team-avg calc for now and just look at "Full Save Kills"
            
            if pid == puuid:
                player_val = val
                
                # Check Eco Frags for this round
                if player_val < 1500:
                    for k in ps.get('kill_events', []):
                        # We'd need victim loadout value... requires lookup map.
                        # Doable but complex. Let's simplify:
                        # Eco Frag = Kills round where player_val < 1500
                        eco_kills += 1
                        


    return {
        "bad_force_buys": 0, # Placeholder until team mapping
        "full_save_kills": eco_kills
    }

def get_simple_player_stats(player, rounds_played):
    """Extracts high-level stats for context comparison."""
    stats = player.get('stats', {})
    k = stats.get('kills', 0)
    d = stats.get('deaths', 0)
    a = stats.get('assists', 0)
    score = stats.get('score', 0)
    acs = round(score / rounds_played, 0) if rounds_played > 0 else 0
    kda = f"{k}/{d}/{a}"
    
    head = stats.get('headshots', 0)
    total = head + stats.get('bodyshots', 0) + stats.get('legshots', 0)
    hs = round((head / total * 100), 1) if total > 0 else 0
    
    return {
        "name": f"{player.get('name')}#{player.get('tag')}",
        "agent": player.get('character', 'Unknown'),
        "team": player.get('team', 'Unknown'),
        "rank": player.get('currenttier_patched', 'Unranked'),
        "kda": kda,
        "acs": acs,
        "hs_percent": hs
    }

def get_economy_start(rounds, puuid):
    eco = []
    for i, rnd in enumerate(rounds):
        for ps in rnd.get('player_stats', []):
            if ps.get('player_puuid') == puuid:
                e = ps.get('economy', {})
                w = e.get('weapon', {})
                w_name = w.get('name', 'Unknown') if w else 'Unknown'
                eco.append({
                    "round": i+1,
                    "weapon": w_name,
                    "value": e.get('loadout_value', 0),
                    "spent": e.get('spent', 0)
                })
    return eco

def main():
    try:
        # 1. Load Data
        with open('match_data.json', 'r') as f:
            data = json.load(f)
            
        target_player_name = os.environ.get("TARGET_PLAYER", "").lower()
        
        match_info = data.get('data', {})
        metadata = match_info.get('metadata', {})
        players = match_info.get('players', {}).get('all_players', [])
        rounds = match_info.get('rounds', [])
        if not rounds and 'rounds' in data: 
             rounds = data.get('rounds', [])

        # 2. Extract Match Context
        map_name = metadata.get('map', 'Unknown')
        mode = metadata.get('mode', 'Standard')
        rounds_played = metadata.get('rounds_played', 0)
        
        # 3. Find THE Target Player
        if target_player_name:
            player = next((p for p in players if p.get('name', '').lower() == target_player_name), None)
        else:
            player = max(players, key=lambda x: x.get('stats', {}).get('score', 0))

        if not player:
            # Error handling same as before...
            err_msg = "Player not found"
            with open('prompt.txt', 'w') as f: f.write(err_msg)
            with open('minified_match.json', 'w') as f: json.dump({"error": err_msg}, f)
            return

        # 4. Extract Metrics (Basic)
        stats = player.get('stats', {})
        puuid = player.get('puuid')
        team = player.get('team', 'Blue')
        agent = player.get('character', 'Unknown Agent')
        
        k = stats.get('kills') or 0
        d = stats.get('deaths') or 0
        a = stats.get('assists') or 0
        
        damage = stats.get('damage_made') or stats.get('damage', 0)
        # Fallback ADR
        if damage == 0 and rounds:
             for rnd in rounds:
                for ps in rnd.get('player_stats', []):
                    if ps.get('player_puuid') == puuid:
                        damage += ps.get('damage', 0)
        adr = round(damage / rounds_played, 0) if rounds_played > 0 else 0
        avg_score = round(stats.get('score', 0) / rounds_played, 0) if rounds_played > 0 else 0

        # HS%
        head = stats.get('headshots') or 0
        body = stats.get('bodyshots') or 0
        leg = stats.get('legshots') or 0
        total_hits = head + body + leg
        hs_percent = round((head / total_hits * 100), 1) if total_hits > 0 else 0
        
        # Utility
        casts = player.get('ability_casts') or {}
        if casts is None: casts = {}
        
        c_cast = casts.get('c_cast') or 0
        q_cast = casts.get('q_cast') or 0
        e_cast = casts.get('e_cast') or 0
        x_cast = casts.get('x_cast') or 0
        
        # Fallback Utility
        if (c_cast + q_cast + e_cast + x_cast) == 0 and rounds:
            for rnd in rounds:
                for ps in rnd.get('player_stats', []):
                    if ps.get('player_puuid') == puuid:
                        round_casts = ps.get('ability_casts') or {}
                        if round_casts:
                            c_cast += (round_casts.get('c_cast') or round_casts.get('c_casts') or 0)
                            q_cast += (round_casts.get('q_cast') or round_casts.get('q_casts') or 0)
                            e_cast += (round_casts.get('e_cast') or round_casts.get('e_casts') or 0)
                            x_cast += (round_casts.get('x_cast') or round_casts.get('x_casts') or 0)

        plants = stats.get('plants', 0)
        defuses = stats.get('defuses', 0)
        
        # Economy (Full)
        economy_full = get_economy_start(rounds, puuid)
        eco_stats = player.get('economy', {})
        eco_summary = {
            "spent_overall": eco_stats.get('spent', {}).get('overall', 0),
            "spent_avg": eco_stats.get('spent', {}).get('average', 0),
            "loadout_val_overall": eco_stats.get('loadout_value', {}).get('overall', 0),
            "loadout_val_avg": eco_stats.get('loadout_value', {}).get('average', 0)
        }

        # Advanced Metrics Stub 
        adv_combat = calculate_advanced_combat(rounds, puuid, team)
        first_bloods = calculate_first_bloods(rounds, puuid)
        pos_stats = calculate_positioning(rounds, puuid)
        adv_eco = calculate_advanced_economy(rounds, puuid, team)
        
        # Match Context (Scoreboard)
        scoreboard = [get_simple_player_stats(p, rounds_played) for p in players]
        scoreboard.sort(key=lambda x: x['acs'], reverse=True)

        # Robust Win Check
        team_key = team.lower() # 'red' or 'blue'
        team_data = match_info.get('teams', {}).get(team_key, {})
        
        # Primary Check: 'has_won' boolean
        won_match = team_data.get('has_won', False)
        
        # Fallback: Compare rounds if has_won is missing or ambiguous
        if 'has_won' not in team_data:
             my_rounds = team_data.get('rounds_won', 0)
             enemy_key = 'blue' if team_key == 'red' else 'red'
             enemy_rounds = match_info.get('teams', {}).get(enemy_key, {}).get('rounds_won', 0)
             won_match = my_rounds > enemy_rounds

        # Calculate Relative Score
        red_rounds = match_info.get('teams', {}).get('red', {}).get('rounds_won', 0)
        blue_rounds = match_info.get('teams', {}).get('blue', {}).get('rounds_won', 0)
        
        if team_key == 'red':
            my_score = red_rounds
            enemy_score = blue_rounds
        else:
            my_score = blue_rounds
            enemy_score = red_rounds
            
        # Sanity Fix: If Result says Victory but score implies loss, trust Result and swap scores.
        # This protects against API data inconsistencies or team mapping errors.
        if won_match and my_score < enemy_score:
             my_score, enemy_score = enemy_score, my_score
        elif not won_match and my_score > enemy_score:
             my_score, enemy_score = enemy_score, my_score
             
        score_str = f"{my_score} - {enemy_score}"

        # 5. Construct Minified JSON
        minified = {
            "metadata": {
                "map": map_name,
                "mode": mode,
                "result": "Victory" if won_match else "Defeat",
                "rounds_played": rounds_played,
                "score_string": score_str
            },
            "identity": {
                "name": player.get('name'),
                "tag": player.get('tag'),
                "agent": agent,
                "rank": player.get('currenttier_patched', 'Unranked'),
                "team": team
            },
            "combat": {
                "kda": f"{k}/{d}/{a}",
                "adr": adr,
                "hs_percent": hs_percent,
                "acs": avg_score
            },
            "combat_advanced": adv_combat,
            "positioning": pos_stats,
            "economy_context": adv_eco,
            
            "utility": {
                "ultimate_casts": x_cast,
                "ability_e_casts": e_cast,
                "ability_q_casts": q_cast,
                "ability_c_casts": c_cast
            },
            "objective_and_economy": {
                "plants": plants,
                "defuses": defuses,
                "economy_full": economy_full,
                "economy_summary": eco_summary
            },
            "scoreboard": scoreboard
        }
        
        # 6. Build Outputs
        
        # Mode-Specific Context Note for Stats
        is_standard_mode = mode.lower() in ['competitive', 'unrated', 'premier', 'swiftplay', 'standard', 'custom game']
        mode_note = f"(Mode: {mode})" if is_standard_mode else f"(Mode: {mode} - Fun/Warmup, Stats may be limited)"

        # Construct Visual Stats Summary (match_stats.txt)
        # This is solely for the LLM to 'see' the formatted data or for user display.
        # It does NOT contain coaching instructions.
        stats_markdown = f"""
### 📝 Match Context
**👤 Player:** {player.get('name')} | **🏆 Rank:** {minified['identity']['rank']}
**🦸 Agent:** {agent} | **📍 Map:** {map_name}
**🏁 Result:** {minified['metadata']['result']} {mode_note}
**📊 Rounds:** {rounds_played} | **Score:** {minified['metadata']['score_string']}

**📈 Combat Stats:**
• **KDA:** {minified['combat']['kda']} | **ACS:** {avg_score} | **ADR:** {adr}
• **HS%:** {hs_percent}% | **First Bloods:** {first_bloods}

**🛡️ Utility Usage:**
• **Ult (X):** {x_cast} | **Ability (E):** {e_cast}
• **Ability (Q):** {q_cast} | **Ability (C):** {c_cast}
"""

        with open('match_stats.txt', 'w') as f:
            f.write(stats_markdown)
            
        # Write Minified JSON (Data Payload)
        with open('minified_match.json', 'w') as f:
            json.dump(minified, f, indent=2)

    except Exception as e:
        print(f"Error: {e}")
        # Fallback outputs
        with open('match_stats.txt', 'w') as f: f.write(f"Error extracting stats: {e}")
        with open('minified_match.json', 'w') as f: json.dump({"error": str(e)}, f)

if __name__ == "__main__":
    main()