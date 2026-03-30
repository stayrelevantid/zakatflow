import 'dotenv/config';
import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';

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

function getSpreadsheetId(): string {
	const spreadsheetId = process.env.SPREADSHEET_ID;
	if (!spreadsheetId) {
		throw new Error('SPREADSHEET_ID environment variable is not set');
	}
	return spreadsheetId;
}

async function testConnection() {
	console.log('Testing Google Sheets connection...');
	
	const auth = getGoogleAuth();
	console.log('Auth created');
	
	const sheets = google.sheets({ version: 'v4', auth });
	console.log('Sheets client created');
	
	const spreadsheetId = getSpreadsheetId();
	console.log('Spreadsheet ID:', spreadsheetId);
	
	try {
		const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
		console.log('✓ Spreadsheet found:', spreadsheet.data.properties?.title);
		console.log('Existing sheets:', spreadsheet.data.sheets?.map(s => s.properties?.title));
		return true;
	} catch (e: any) {
		console.log('✗ Error accessing spreadsheet:', e.message);
		return false;
	}
}

testConnection().then((success) => {
	console.log(success ? '\n✓ Connection successful!' : '\n✗ Connection failed!');
	process.exit(success ? 0 : 1);
}).catch(console.error);