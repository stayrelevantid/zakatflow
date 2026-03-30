import 'dotenv/config';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function getGoogleAuth() {
	const privateKey = process.env.GOOGLE_PRIVATE_KEY;
	const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

	if (!privateKey || !clientEmail) {
		throw new Error('GOOGLE_PRIVATE_KEY and GOOGLE_CLIENT_EMAIL environment variables must be set');
	}

	// Handle escaped newlines
	const formattedKey = privateKey.replace(/\\n/g, '\n');

	const credentials = {
		type: 'service_account' as const,
		client_email: clientEmail,
		private_key: formattedKey
	};

	return new google.auth.GoogleAuth({
		credentials,
		scopes: SCOPES
	});
}

async function test() {
	console.log('Testing Google Auth...');
	console.log('Client Email:', process.env.GOOGLE_CLIENT_EMAIL);
	console.log('Private Key length:', process.env.GOOGLE_PRIVATE_KEY?.length);

	try {
		const auth = getGoogleAuth();
		const client = await auth.getClient();
		console.log('✓ Authentication successful!');
		console.log('Client type:', client.constructor.name);
	} catch (e: any) {
		console.log('✗ Authentication failed:', e.message);
	}
}

test().catch(console.error);