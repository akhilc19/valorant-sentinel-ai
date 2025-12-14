
def test():
    data = {
      "metadata": {
        "result": "Defeat",
        "score_string": "3 - 13",
        "rounds_played": 16
      },
      "combat": {
        "kda": "8/15/0",
        "acs": 153.0
      }
    }
    
    metadata = data.get('metadata', {})
    combat = data.get('combat', {})
    
    result = metadata.get('result', 'Defeat')
    score_str = metadata.get('score_string', '0 - 0')
    rounds_played = metadata.get('rounds_played', 0)
    
    kda_str = combat.get('kda', '0/0/0')
    k, d, a = map(int, kda_str.split('/'))
    
    try:
        s1, s2 = map(int, score_str.split(' - '))
        score_diff = abs(s1 - s2)
    except:
        score_diff = 0
        
    kda_ratio = k / d if d > 0 else k
    acs = float(combat.get('acs', 0))
    
    decision = "STANDARD"
    
    if kda_ratio > 1.5 and result == "Defeat":
        decision = "TEAM_DIFF"
    elif acs < 160 and result == "Victory":
        decision = "CARRIED_WIN"
    elif score_diff <= 3:
        decision = "CLOSE_MATCH"
    elif rounds_played <= 18 and result == "Victory":
        decision = "STOMP_WIN"
    elif kda_ratio < 0.6 and result == "Defeat":
        decision = "TILT_DETECTED"
    else:
        decision = "STANDARD"
        
    print(f"KDA Ratio: {kda_ratio}")
    print(f"Diff: {score_diff}")
    print(f"Result: {result}")
    print(f"Decision: {decision}")

if __name__ == "__main__":
    test()
