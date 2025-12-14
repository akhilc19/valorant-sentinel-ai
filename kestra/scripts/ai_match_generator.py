import os
import sys
import json
import requests
import argparse

def main():
    try:
        # 1. Argument Parsing
        parser = argparse.ArgumentParser()
        parser.add_argument('--prompt', required=True, help='Path to full prompt file')
        args = parser.parse_args()
        prompt_file = args.prompt

        # 2. Configuration
        ollama_host = os.environ.get('OLLAMA_HOST', 'https://ollama.com')
        model = os.environ.get('OLLAMA_MODEL', 'gpt-oss:120b-cloud')
        api_key = os.environ.get('OLLAMA_API_KEY')
        
        # 3. Read Prompt
        if not os.path.exists(prompt_file):
            raise FileNotFoundError(f"Prompt file not found: {prompt_file}")
            
        with open(prompt_file, 'r') as f:
            prompt_content = f.read()

        print(f"Connecting to AI at {ollama_host} with model {model}...")

        # 4. Payload
        payload = {
            "model": model,
            "prompt": prompt_content,
            "stream": False
        }
        
        headers = {}
        if api_key:
            headers['Authorization'] = f"Bearer {api_key}"

        # 5. Send Request
        response = requests.post(f"{ollama_host}/api/generate", json=payload, headers=headers, timeout=120)
        response.raise_for_status()
        
        # 6. Parse Response
        result = response.json()
        output_text = result.get('response', 'No response from AI.')
        
        # 7. Output
        # We wrap it in a JSON object as expected by the frontend/next steps
        output_obj = {
            "text": output_text
        }
        
        with open('analysis.json', 'w') as f:
            json.dump(output_obj, f)
            
        print("Analysis generated successfully.")

    except Exception as e:
        err_msg = f"AI Generation Failed: {str(e)}"
        print(err_msg)
        with open('analysis.json', 'w') as f:
            json.dump({"text": err_msg}, f)
            
if __name__ == "__main__":
    main()
