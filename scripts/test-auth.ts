import 'dotenv/config';
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function test() {
	const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;
	if (!credentialsBase64) {
		throw new Error('GOOGLE_CREDENTIALS_BASE64 environment variable is not set');
	}

	console.log('Credentials base64 length:', credentialsBase64.length);

	const credentials = JSON.parse(Buffer.from(credentialsBase64, 'base64').toString('utf-8'));
	console.log('Credentials parsed, project_id:', credentials.project_id);
	console.log('Private key starts:', credentials.private_key?.substring(0, 30));

	// Try both methods
	console.log('\n--- Method 1: google.auth.GoogleAuth ---');
	try {
		const auth1 = new google.auth.GoogleAuth({
			credentials,
			scopes: SCOPES
		});
		const client1 = await auth1.getClient();
		console.log('Method 1 success:', client1.constructor.name);
	} catch (e: any) {
		console.log('Method 1 error:', e.message);
	}

	console.log('\n--- Method 2: GoogleAuth from google-auth-library ---');
	try {
		const auth2 = new GoogleAuth({
			credentials,
			scopes: SCOPES
		});
		const client2 = await auth2.getClient();
		console.log('Method 2 success:', client2.constructor.name);
	} catch (e: any) {
		console.log('Method 2 error:', e.message);
	}
}

test().catch(console.error);