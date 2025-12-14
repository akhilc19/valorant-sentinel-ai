import json
import sys
import os

def main():
    try:
        # 1. Load Data
        with open('minified_match.json', 'r') as f:
            data = json.load(f)
            
        print("DEBUG: analyze_context.py v3 Loaded")
        
        metadata = data.get('metadata', {})
        combat = data.get('combat', {})
        
        print(f"DEBUG INPUT: metadata={metadata}, combat={combat}")
        
        result = metadata.get('result', 'Defeat') # Victory / Defeat
        score_str = metadata.get('score_string', '0 - 0') # "13 - 11"
        rounds_played = metadata.get('rounds_played', 0)
        
        kda_str = combat.get('kda', '0/0/0') # "5/18/3"
        try:
            k, d, a = map(int, kda_str.split('/'))
        except:
            k, d, a = 0, 1, 0
            
        # 2. Calculate Metrics
        try:
            s1, s2 = map(int, score_str.split(' - '))
            score_diff = abs(s1 - s2)
        except:
            score_diff = 0
            
        kda_ratio = k / d if d > 0 else k
        acs = float(combat.get('acs', 0))
        
        # 3. Determine State (Heuristics)
        decision = "STANDARD" # Default
        
        # Heuristics provided by Architect:
        
        # 1. Team Diff / "Smurfing but Lost" (High KDA + Defeat)
        # Needs to be before Close Match to override "Close Loss" if you carried hard.
        if kda_ratio > 1.5 and result == "Defeat":
            decision = "TEAM_DIFF"
            
        # 2. Carried Win (Low ACS + Victory). "The Backpack"
        elif acs < 160 and result == "Victory":
            decision = "CARRIED_WIN"

        # 3. Close Match (Score diff <= 3 e.g., 13-10, 13-11, Overtime)
        elif score_diff <= 3:
            decision = "CLOSE_MATCH"
            
        # 3. Stomp Win (Fast match <= 18 rounds and Victory. 13-5 or better)
        elif rounds_played <= 18 and result == "Victory":
            decision = "STOMP_WIN"
            
        # 4. Tilt Detected (Bad KDA < 0.6 and Defeat)
        elif kda_ratio < 0.6 and result == "Defeat":
            decision = "TILT_DETECTED"
            
        # 5. Standard (Everything else)
        else:
            decision = "STANDARD"

        print(f"Analysis: {result} ({score_str}), Rounds: {rounds_played}, KDA: {kda_ratio:.2f} -> Decision: {decision}")
        
        # 4. Kestra Output
        print(f"::set-output name=decision::{decision}", flush=True)

        # 5. Debug Output File
        with open('decision.txt', 'w') as f:
            f.write(decision)

    except Exception as e:
        print(f"Error analyzing context: {e}")
        # Fallback
        print("::set-output name=decision::STANDARD")

if __name__ == "__main__":
    main()
