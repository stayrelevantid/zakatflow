import 'dotenv/config';
import { writeFileSync } from 'fs';

// Read the current base64 value
const base64Value = process.env.GOOGLE_CREDENTIALS_BASE64;
if (!base64Value) {
	console.error('GOOGLE_CREDENTIALS_BASE64 not found in .env');
	process.exit(1);
}

// Decode
const decoded = Buffer.from(base64Value, 'base64').toString('utf-8');
console.log('Decoded (first 200 chars):', decoded.substring(0, 200));

// Try to parse
try {
	const json = JSON.parse(decoded);
	console.log('JSON is valid!');
	console.log('Project ID:', json.project_id);
	console.log('Client Email:', json.client_email);
} catch (e) {
	console.log('JSON is invalid, attempting to fix...');
	
	// Fix common issues
	let fixed = decoded
		// Quote unquoted property names
		.replace(/(\w+):/g, '"$1":')
		// Quote unquoted string values (simple cases)
		.replace(/: ([a-zA-Z][a-zA-Z0-9_]*)/g, ': "$1"')
		// Fix private key - it should be a single string with \n
		.replace(/"private_key": "([^"]+)"/s, (match, p1) => {
			// The private key should have actual newlines escaped as \n
			const fixed = p1.replace(/\n/g, '\\n');
			return `"private_key": "${fixed}"`;
		});
	
	console.log('Fixed JSON (first 500 chars):', fixed.substring(0, 500)	);
	
	try {
		const json = JSON.parse(fixed);
		console.log('Fixed JSON is valid!');
		console.log('Project ID:', json.project_id);
		console.log('Client Email:', json.client_email);
		
		// Re-encode
		const fixedBase64 = Buffer.from(JSON.stringify(json, null, 2)).toString('base64');
		console.log('\n--- NEW BASE64 ---');
		console.log(fixedBase64);
		console.log('--- END ---\n');
		
		// Write new .env content
		const spreadsheetId = process.env.SPREADSHEET_ID;
		const newEnv = `# Google Sheets API Configuration
SPREADSHEET_ID=${spreadsheetId}
GOOGLE_CREDENTIALS_BASE64=${fixedBase64}`;
		
		writeFileSync('.env', newEnv);
		console.log('Updated .env file with fixed credentials');
	} catch (e2) {
		console.error('Still invalid JSON:', e2);
		console.log('\nPlease manually fix your .env file. The credentials should be valid JSON with quoted property names.');
	}
}