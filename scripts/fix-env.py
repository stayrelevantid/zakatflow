#!/usr/bin/env python3
import json
import base64
import re

# Read current .env
with open('.env', 'r') as f:
    content = f.read()

# Extract base64
lines = content.split('\n')
base64_line = [l for l in lines if l.startswith('GOOGLE_CREDENTIALS_BASE64=')]
if not base64_line:
    print('GOOGLE_CREDENTIALS_BASE64 not found')
    exit(1)

base64_value = base64_line[0].split('=', 1)[1]

# Decode
decoded = base64.b64decode(base64_value).decode('utf-8')

# Parse the unquoted JSON
# The format is: property: value (without quotes)
def fix_json(text):
    lines = []
    for line in text.split('\n'):
        if not line.strip():
            lines.append(line)
            continue
        
        # Handle opening brace
        if line.strip() == '{':
            lines.append('{')
            continue
        
        # Handle closing brace
        if line.strip() == '}':
            lines.append('}')
            continue
        
        # Parse property: value
        match = re.match(r'^(\s*)(\w+):\s*(.+?),?\s*$', line)
        if match:
            indent = match.group(1)
            key = match.group(2)
            value = match.group(3)
            
            # Remove trailing comma
            value = value.rstrip(',').strip()
            
            # Quote key
            key = f'"{key}"'
            
            # Quote value if not already quoted, not a number, and not already boolean/null
            if not value.startswith('"') and not re.match(r'^\d+$', value):
                value = f'"{value}"'
            
            lines.append(f'{indent}{key}: {value},')
        else:
            lines.append(line)
    
    result = '\n'.join(lines)
    
    # Fix private key newlines (literal n should be \n)
    result = re.sub(r'-----BEGIN PRIVATE KEY-----n', r'-----BEGIN PRIVATE KEY-----\\n', result)
    result = re.sub(r'n-----END PRIVATE KEY-----', r'\\n-----END PRIVATE KEY-----', result)
    
    # Remove trailing commas before closing braces/brackets
    result = re.sub(r',(\s*[}\]])', r'\1', result)
    
    return result

fixed_json = fix_json(decoded)

try:
    data = json.loads(fixed_json)
    print('JSON is valid!')
    print(f'Project ID: {data.get("project_id")}')
    print(f'Client email: {data.get("client_email")}')
    
    # Re-encode properly
    new_json = json.dumps(data, indent=2)
    new_base64 = base64.b64encode(new_json.encode()).decode()
    
    # Get spreadsheet ID
    spreadsheet_line = [l for l in lines if l.startswith('SPREADSHEET_ID=')]
    spreadsheet_id = spreadsheet_line[0].split('=', 1)[1] if spreadsheet_line else ''
    
    # Write new .env
    with open('.env', 'w') as f:
        f.write('# Google Sheets API Configuration\n')
        f.write(f'SPREADSHEET_ID={spreadsheet_id}\n')
        f.write(f'GOOGLE_CREDENTIALS_BASE64={new_base64}\n')
    
    print('\n.env file updated successfully!')
    print('Run: npm run seed')
    
except json.JSONDecodeError as e:
    print(f'JSON parse error: {e}')
    print('\nFixed JSON:')
    print(fixed_json[:1000])