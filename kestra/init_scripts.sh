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


echo -e "\nDone."
