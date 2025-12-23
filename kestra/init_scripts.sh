#!/bin/bash

# Configuration
KESTRA_URL="http://localhost:8080"
USER="admin@kestra.io:Kestra1!"
NAMESPACE="valorant"

echo "Creating Namespace '$NAMESPACE'..."
curl -X POST "$KESTRA_URL/api/v1/namespaces" \
  -H "Content-Type: application/json" \
  -d "{\"id\": \"$NAMESPACE\"}" \
  --user "$USER"

echo -e "\nUploading dashboard_parser.py..."
curl -X POST "$KESTRA_URL/api/v1/namespaces/$NAMESPACE/files?path=scripts/dashboard_parser.py" \
  -H "Content-Type: multipart/form-data" \
  -F "fileContent=@scripts/dashboard_parser.py" \
  --user "$USER"

echo -e "\nUploading match_analyzer.py..."
curl -X POST "$KESTRA_URL/api/v1/namespaces/$NAMESPACE/files?path=scripts/match_analyzer.py" \
  -H "Content-Type: multipart/form-data" \
  -F "fileContent=@scripts/match_analyzer.py" \
  --user "$USER"

echo -e "\nUploading ai_prompt_builder.py..."
curl -X POST "$KESTRA_URL/api/v1/namespaces/$NAMESPACE/files?path=scripts/ai_prompt_builder.py" \
  -H "Content-Type: multipart/form-data" \
  -F "fileContent=@scripts/ai_prompt_builder.py" \
  --user "$USER"

echo -e "\nUploading ai_match_generator.py..."
curl -X POST "$KESTRA_URL/api/v1/namespaces/$NAMESPACE/files?path=scripts/ai_match_generator.py" \
  -H "Content-Type: multipart/form-data" \
  -F "fileContent=@scripts/ai_match_generator.py" \
  --user "$USER"

echo -e "\nUploading analyze_context.py..."
curl -X POST "$KESTRA_URL/api/v1/namespaces/$NAMESPACE/files?path=scripts/analyze_context.py" \
  -H "Content-Type: multipart/form-data" \
  -F "fileContent=@scripts/analyze_context.py" \
  --user "$USER"

# Upload Prompts
PROMPTS=("standard.txt" "tactical.txt" "mental.txt" "validator.txt" "backpack.txt")
mkdir -p prompts # Ensure dir exists locally just in case, though it should be mapped
for prompt in "${PROMPTS[@]}"; do
  echo -e "\nUploading prompts/$prompt..."
  curl -X POST "$KESTRA_URL/api/v1/namespaces/$NAMESPACE/files?path=prompts/$prompt" \
    -H "Content-Type: multipart/form-data" \
    -F "fileContent=@prompts/$prompt" \
    --user "$USER"
done


echo -e "\nDone."
