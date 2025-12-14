import requests
import os

def deploy_flow():
    kestra_url = "http://localhost:8080"
    user = os.environ.get("KESTRA_USER")
    password = os.environ.get("KESTRA_PASSWORD")
    
    flow_path = "flows/ai_match_analysis.yaml"
    
    with open(flow_path, 'r') as f:
        flow_content = f.read()
        
    print(f"Deploying flow from {flow_path}...")
    
    # 1. Try Create (POST)
    print("Attempting to CREATE flow...")
    response = requests.post(
        f"{kestra_url}/api/v1/flows",
        data=flow_content,
        headers={"Content-Type": "application/x-yaml"},
        auth=(user, password)
    )
    
    if response.status_code == 200:
        print("Success! Flow created.")
        print(response.json())
        return

    # 2. If Exists, Update (PUT)
    if response.status_code == 422 and "already exists" in response.text:
        print("Flow exists. Attempting to UPDATE (PUT)...")
        # Extract namespace/id - hardcoded for now as we know it
        # PUT /api/v1/flows/{namespace}/{id}
        response = requests.put(
            f"{kestra_url}/api/v1/flows/valorant/ai_match_analysis_v3",
            data=flow_content,
            headers={"Content-Type": "application/x-yaml"},
            auth=(user, password)
        )
        if response.status_code == 200:
             print("Success! Flow updated.")
             print(response.json())
             return
        else:
             print(f"Update failed: {response.status_code} {response.text}")
             return

    print(f"Create failed with unexpected error: {response.status_code} {response.text}")

if __name__ == "__main__":
    deploy_flow()
