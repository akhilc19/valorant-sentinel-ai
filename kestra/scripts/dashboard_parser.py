
import json
import sys
import os

def load_json(filename):
    with open(filename, 'r') as f:
        data = json.load(f)
    if isinstance(data, str):
        data = json.loads(data)
    return data

# Check if files exist
files = ['account.json', 'mmr.json', 'matches.json']
for filename in files:
    if not os.path.exists(filename):
        print(f"CRITICAL ERROR: {filename} was not found!")
        sys.exit(1)

account_data = load_json('account.json')
mmr_data = load_json('mmr.json')
matches_data = load_json('matches.json')

# Extract Account Info
account = account_data.get('data', {})
name = account.get('name', 'Unknown')
tag = account.get('tag', 'Unknown')
level = account.get('account_level', 0)

# Extract Rank Info
mmr = mmr_data.get('data', {})
# v1 structure: data.currenttierpatched
rank = mmr.get('currenttierpatched', 'Unrated')

# Process Matches
matches_list = matches_data.get('data', [])
processed_matches = []

if matches_list:
    for match in matches_list[:10]:
        meta = match.get('metadata', {})
        match_id = meta.get('matchid')
        map_name = meta.get('map')
        
        # Find player stats
        result = "Unknown"
        kda = "0/0/0"
        agent_image = None
        
        players = match.get('players', {}).get('all_players', [])
        for p in players:
            if p.get('name').lower() == name.lower() and p.get('tag').lower() == tag.lower():
                # Stats
                stats = p.get('stats', {})
                k = stats.get('kills', 0)
                d = stats.get('deaths', 0)
                a = stats.get('assists', 0)
                kda = f"{k}/{d}/{a}"
                
                # Agent
                assets = p.get('assets', {})
                agent_image = assets.get('agent', {}).get('small')
                
                # Result
                team = p.get('team', '').lower()
                teams = match.get('teams', {})
                team_data = teams.get(team, {})
                has_won = team_data.get('has_won', None)
                
                if has_won is True:
                    result = "Victory"
                elif has_won is False:
                    result = "Defeat"
                else:
                    result = "Draw"
                break
        
        match_details = {
            "match_id": match_id,
            "map": map_name,
            "result": result,
            "kda": kda,
            "agent_image": agent_image
        }
        processed_matches.append(match_details)

output = {
    "name": name,
    "tag": tag,
    "level": level,
    "rank": rank,
    "matches": processed_matches
}

with open('output.json', 'w') as f:
    json.dump(output, f)
