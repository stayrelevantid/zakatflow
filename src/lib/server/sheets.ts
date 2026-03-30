import { google } from 'googleapis';
import type { TransaksiZakat, ReferensiHarga } from '../types/zakat';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function getGoogleAuth() {
	// Support both formats:
	// 1. GOOGLE_PRIVATE_KEY + GOOGLE_CLIENT_EMAIL (recommended)
	// 2. GOOGLE_CREDENTIALS_BASE64 (legacy)
	
	const privateKey = process.env.GOOGLE_PRIVATE_KEY;
	const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
	const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;

	if (privateKey && clientEmail) {
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

	if (credentialsBase64) {
		const credentials = JSON.parse(Buffer.from(credentialsBase64, 'base64').toString('utf-8'));
		return new google.auth.GoogleAuth({
			credentials,
			scopes: SCOPES
		});
	}

	throw new Error('Either GOOGLE_PRIVATE_KEY + GOOGLE_CLIENT_EMAIL or GOOGLE_CREDENTIALS_BASE64 must be set');
}

function getSpreadsheetId(): string {
	const spreadsheetId = process.env.SPREADSHEET_ID;
	if (!spreadsheetId) {
		throw new Error('SPREADSHEET_ID environment variable is not set');
	}
	return spreadsheetId;
}

// ========== TRANSAKSI ZAKAT ==========

const TRANSAKSI_SHEET = 'Transaksi_Zakat';

export async function getAllTransaksi(): Promise<TransaksiZakat[]> {
	const auth = getGoogleAuth();
	const sheets = google.sheets({ version: 'v4', auth });

	const response = await sheets.spreadsheets.values.get({
		spreadsheetId: getSpreadsheetId(),
		range: `${TRANSAKSI_SHEET}!A2:H`
	});

	const rows = response.data.values || [];
	
	return rows.map((row) => ({
		id: row[0] as string,
		tanggal: row[1] as string,
		kategori: row[2] as TransaksiZakat['kategori'],
		nilaiHarta: parseFloat(row[3]) || 0,
		zakatWajib: parseFloat(row[4]) || 0,
		metode: row[5] as string,
		status: row[6] as TransaksiZakat['status'],
		catatan: row[7] as string | undefined
	}));
}

export async function getTransaksiById(id: string): Promise<TransaksiZakat | null> {
	const transaksiList = await getAllTransaksi();
	return transaksiList.find((t) => t.id === id) || null;
}

export async function createTransaksi(transaksi: Omit<TransaksiZakat, 'id' | 'tanggal'>): Promise<TransaksiZakat> {
	const auth = getGoogleAuth();
	const sheets = google.sheets({ version: 'v4', auth });

	const { v4: uuidv4 } = await import('uuid');
	const id = uuidv4();
	const tanggal = new Date().toISOString();

	await sheets.spreadsheets.values.append({
		spreadsheetId: getSpreadsheetId(),
		range: `${TRANSAKSI_SHEET}!A:H`,
		valueInputOption: 'USER_ENTERED',
		requestBody: {
			values: [[id, tanggal, transaksi.kategori, transaksi.nilaiHarta, transaksi.zakatWajib, transaksi.metode, transaksi.status, transaksi.catatan || '']]
		}
	});

	return {
		id,
		tanggal,
		...transaksi
	};
}

export async function updateTransaksi(id: string, updates: Partial<TransaksiZakat>): Promise<boolean> {
	const auth = getGoogleAuth();
	const sheets = google.sheets({ version: 'v4', auth });

	// Find the row index
	const transaksiList = await getAllTransaksi();
	const rowIndex = transaksiList.findIndex((t) => t.id === id);
	
	if (rowIndex === -1) return false;

	const updatedTransaksi = { ...transaksiList[rowIndex], ...updates };
	const rowNumber = rowIndex + 2; // +2 because header is row 1, and 0-indexed

	await sheets.spreadsheets.values.update({
		spreadsheetId: getSpreadsheetId(),
		range: `${TRANSAKSI_SHEET}!A${rowNumber}:H${rowNumber}`,
		valueInputOption: 'USER_ENTERED',
		requestBody: {
			values: [[
				updatedTransaksi.id,
				updatedTransaksi.tanggal,
				updatedTransaksi.kategori,
				updatedTransaksi.nilaiHarta,
				updatedTransaksi.zakatWajib,
				updatedTransaksi.metode,
				updatedTransaksi.status,
				updatedTransaksi.catatan || ''
			]]
		}
	});

	return true;
}

export async function deleteTransaksi(id: string): Promise<boolean> {
	const auth = getGoogleAuth();
	const sheets = google.sheets({ version: 'v4', auth });

	const transaksiList = await getAllTransaksi();
	const rowIndex = transaksiList.findIndex((t) => t.id === id);
	
	if (rowIndex === -1) return false;

	const rowNumber = rowIndex + 2;

	await sheets.spreadsheets.values.clear({
		spreadsheetId: getSpreadsheetId(),
		range: `${TRANSAKSI_SHEET}!A${rowNumber}:H${rowNumber}`
	});

	return true;
}

// ========== REFERENSI HARGA ==========

const REFERENSI_SHEET = 'Referensi_Harga';

export async function getAllReferensi(): Promise<ReferensiHarga[]> {
	const auth = getGoogleAuth();
	const sheets = google.sheets({ version: 'v4', auth });

	const response = await sheets.spreadsheets.values.get({
		spreadsheetId: getSpreadsheetId(),
		range: `${REFERENSI_SHEET}!A2:D`
	});

	const rows = response.data.values || [];
	
	return rows.map((row) => ({
		jenis: row[0] as string,
		hargaPerUnit: parseFloat(row[1]) || 0,
		satuan: row[2] as string,
		terakhirUpdate: row[3] as string
	}));
}

export async function getReferensiByJenis(jenis: string): Promise<ReferensiHarga | null> {
	const referensiList = await getAllReferensi();
	return referensiList.find((r) => r.jenis.toLowerCase() === jenis.toLowerCase()) || null;
}

export async function updateReferensi(jenis: string, hargaPerUnit: number): Promise<boolean> {
	const auth = getGoogleAuth();
	const sheets = google.sheets({ version: 'v4', auth });

	const referensiList = await getAllReferensi();
	const rowIndex = referensiList.findIndex((r) => r.jenis.toLowerCase() === jenis.toLowerCase());
	
	if (rowIndex === -1) return false;

	const rowNumber = rowIndex + 2;
	const terakhirUpdate = new Date().toISOString().split('T')[0];

	await sheets.spreadsheets.values.update({
		spreadsheetId: getSpreadsheetId(),
		range: `${REFERENSI_SHEET}!B${rowNumber}:D${rowNumber}`,
		valueInputOption: 'USER_ENTERED',
		requestBody: {
			values: [[hargaPerUnit, referensiList[rowIndex].satuan, terakhirUpdate]]
		}
	});

	return true;
}

// ========== INITIALIZE SHEETS ==========

export async function initializeSheets(): Promise<void> {
	const auth = getGoogleAuth();
	const sheets = google.sheets({ version: 'v4', auth });
	const spreadsheetId = getSpreadsheetId();

	// Check if sheets exist
	const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
	const existingSheets = spreadsheet.data.sheets?.map((s) => s.properties?.title) || [];

	// Create Transaksi_Zakat sheet if not exists
	if (!existingSheets.includes(TRANSAKSI_SHEET)) {
		await sheets.spreadsheets.batchUpdate({
			spreadsheetId,
			requestBody: {
				requests: [
					{
						addSheet: {
							properties: { title: TRANSAKSI_SHEET }
						}
					}
				]
			}
		});

		// Add headers
		await sheets.spreadsheets.values.update({
			spreadsheetId,
			range: `${TRANSAKSI_SHEET}!A1:H1`,
			valueInputOption: 'USER_ENTERED',
			requestBody: {
				values: [['ID', 'Tanggal', 'Kategori', 'Nilai_Harta', 'Zakat_Wajib', 'Metode', 'Status', 'Catatan']]
			}
		});
	}

	// Create Referensi_Harga sheet if not exists
	if (!existingSheets.includes(REFERENSI_SHEET)) {
		await sheets.spreadsheets.batchUpdate({
			spreadsheetId,
			requestBody: {
				requests: [
					{
						addSheet: {
							properties: { title: REFERENSI_SHEET }
						}
					}
				]
			}
		});

		// Add headers and default data
		await sheets.spreadsheets.values.update({
			spreadsheetId,
			range: `${REFERENSI_SHEET}!A1:D5`,
			valueInputOption: 'USER_ENTERED',
			requestBody: {
				values: [
					['Jenis', 'Harga_Per_Unit', 'Satuan', 'Terakhir_Update'],
					['Emas', 1100000, 'gram', new Date().toISOString().split('T')[0]],
					['Perak', 15000, 'gram', new Date().toISOString().split('T')[0]],
					['Beras', 15000, 'kg', new Date().toISOString().split('T')[0]]
				]
			}
		});
	}
}