import json
import sys

def main():
    try:
        with open('match_detail.json', 'r') as f:
            match_data = json.load(f)


        import os
        target_name = os.environ.get('TARGET_NAME')
        target_tag = os.environ.get('TARGET_TAG')
        
        if not target_name:

            pass

        data = match_data.get('data', {})
        players = data.get('players', {}).get('all_players', [])
        
        player_stats = None
        
        if target_name and target_tag:
            for p in players:
                if p.get('name').lower() == target_name.lower() and p.get('tag').lower() == target_tag.lower():
                    player_stats = p
                    break
        else:
      
            print(json.dumps({"error": "TARGET_NAME and TARGET_TAG env vars required"}))
            sys.exit(0) 
            pass

        if not player_stats:
             print(json.dumps({"error": "Player not found in match"}))
             sys.exit(0)

        stats = player_stats.get('stats', {})
        
        # Metrics Calculation
        
        # 1. HS%
        head = stats.get('headshots', 0)
        body = stats.get('bodyshots', 0)
        leg = stats.get('legshots', 0)
        total_hits = head + body + leg
        hs_percent = (head / total_hits * 100) if total_hits > 0 else 0
        
        # 2. ACS
        rounds_played = data.get('metadata', {}).get('rounds_played', 0)
        if rounds_played == 0: rounds_played = 1 # Avoid div/0
        acs = stats.get('score', 0) / rounds_played
        
        # 3. ADR (Average Damage per Round)
        damage = stats.get('damage_made') or stats.get('damage', 0)
        if damage == 0:
             rounds = data.get('rounds', [])
             for rnd in rounds:
                for ps in rnd.get('player_stats', []):
                    if ps.get('player_puuid') == player_stats.get('puuid'):
                        damage += ps.get('damage', 0)
        adr = damage / rounds_played

        # 4. KDR (Kill/Death Ratio)
        kills = stats.get('kills', 0)
        deaths = stats.get('deaths', 0)
        kdr = round(kills / deaths, 2) if deaths > 0 else kills

        # 5. First Bloods (Keep existing logic or simplify)
        first_bloods = 0
        rounds = data.get('rounds', [])
        puuid = player_stats.get('puuid')
        
        for rnd in rounds:
            earliest_kill_time = 9999999
            first_killer_puuid = None
            for p_stat in rnd.get('player_stats', []):
                 # Checks kill lists inside player stats if events missing
                 for k in p_stat.get('kill_events', []):
                    kt = k.get('kill_time_in_round', 99999)
                    if kt < earliest_kill_time:
                        earliest_kill_time = kt
                        first_killer_puuid = k.get('killer_puuid')
            
            if first_killer_puuid == puuid:
                first_bloods += 1

        output = {
            "headshot_percent": round(hs_percent, 1),
            "acs": round(acs, 0),
            "first_bloods": first_bloods,
            "adr": round(adr, 0),
            "kdr": kdr
        }

        print(json.dumps(output))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
