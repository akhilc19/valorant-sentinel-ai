
import os
import sys
import json
import requests

def main():
    try:
        # Configuration
        ollama_host = os.environ.get('OLLAMA_HOST', 'https://ollama.com')
        model = os.environ.get('OLLAMA_MODEL', 'gpt-oss:120b-cloud')
        api_key = os.environ.get('OLLAMA_API_KEY')
        
        # Read prompt
        try:
            with open('prompt.txt', 'r') as f:
                prompt = f.read()
            with open('minified_match.json', 'r') as f:
                context_data = json.load(f)
        except FileNotFoundError:
            prompt = "Hello, testing Ollama linkage."
            context_data = {}

        print(f"Connecting to AI at {ollama_host} with model {model}...")

        # Payload
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False
        }
        
        headers = {}
        if api_key:
            headers['Authorization'] = f"Bearer {api_key}"

        try:
            response = requests.post(f"{ollama_host}/api/generate", json=payload, headers=headers, timeout=120)
            response.raise_for_status()
            result = response.json()
            output_text = result.get('response', '')
            
            if not output_text:
                 output_text = "Ollama returned empty response."

        except requests.exceptions.ConnectionError:
            output_text = f"Failed to connect to Ollama at {ollama_host}. Ensure it is running and accessible."
        except Exception as api_err:
             output_text = f"Ollama API Error: {str(api_err)}"

        # Output as JSON
        
        # Extract the user-facing stats from the prompt file to show them above the AI analysis
        # The prompt builder saves it as: STATS \n<!-- SPLIT_HERE -->\n INSTRUCTIONS
        keys_stats = ""
        try:
            if "<!-- SPLIT_HERE -->" in prompt:
                keys_stats = prompt.split("<!-- SPLIT_HERE -->")[0].strip()
        except:
            pass
            
        final_markdown = f"{keys_stats}\n\n---\n\n{output_text}" if keys_stats else output_text
        
        output_obj = {
            "text": final_markdown,
            "context": context_data
        }
        
        with open('analysis.json', 'w') as f:
            json.dump(output_obj, f)

    except Exception as e:
        err_msg = f"Script Critical Error: {str(e)}"
        print(err_msg)
        with open('analysis.json', 'w') as f:
            json.dump({"text": err_msg}, f)

if __name__ == "__main__":
    main()
