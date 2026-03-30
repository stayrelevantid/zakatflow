#!/bin/bash

# Decode the base64 and show the issue
echo "=== Current decoded credentials (INVALID JSON) ==="
cat .env | grep GOOGLE_CREDENTIALS_BASE64 | cut -d'=' -f2- | base64 -d

echo ""
echo ""
echo "=== The JSON needs to have quoted property names like this: ==="
echo '{"type": "service_account", "project_id": "stayrelevantid", ...}'

echo ""
echo "=== Please follow these steps: ==="
echo "1. Go to Google Cloud Console > IAM & Admin > Service Accounts"
echo "2. Find the service account 'zakatflow@stayrelevantid.iam.gserviceaccount.com'"
echo "3. Click the 3 dots > Manage keys > Add key > Create new key > JSON"
echo "4. Download the JSON file"
echo "5. Run: cat YOUR_DOWNLOADED_FILE.json | base64 > credentials_base64.txt"
echo "6. Update your .env file with: GOOGLE_CREDENTIALS_BASE64=\$(cat credentials_base64.txt)"
echo ""
echo "Or use this one-liner (replace PATH_TO_KEY.json):"
echo "  echo \"GOOGLE_CREDENTIALS_BASE64=\$(cat PATH_TO_KEY.json | base64 -w 0)\" >> .env"