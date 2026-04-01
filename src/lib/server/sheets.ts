import { google } from 'googleapis';
import type { TransaksiZakat, ReferensiHarga } from '../types/zakat';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function getGoogleAuth() {
	let privateKey = process.env.GOOGLE_PRIVATE_KEY;
	const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

	if (!privateKey || !clientEmail) {
		throw new Error('GOOGLE_PRIVATE_KEY and GOOGLE_CLIENT_EMAIL environment variables must be set');
	}

	// Remove surrounding quotes if present (from .env file)
	privateKey = privateKey.replace(/^["']|["']$/g, '');

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

	const transaksiMap = new Map<string, TransaksiZakat>();

	rows
		.filter((row) => {
			// Pastikan row memiliki ID yang valid (UUID format)
			const id = row[0] ? String(row[0]).trim() : '';
			const isValidUUID = id.length === 36 && id.includes('-');
			const kategori = row[2] ? String(row[2]).trim() : '';
			return isValidUUID && kategori.length > 0;
		})
		.forEach((row) => {
			const id = String(row[0]).trim();
			// Jika ID sudah ada, overwrite dengan data terbaru (baris terakhir)
			transaksiMap.set(id, {
				id,
				tanggal: String(row[1]).trim(),
				kategori: String(row[2]).trim() as TransaksiZakat['kategori'],
				nilaiHarta: parseFloat(row[3]) || 0,
				zakatWajib: parseFloat(row[4]) || 0,
				metode: row[5] ? String(row[5]).trim() : '',
				status: row[6] ? (String(row[6]).trim() as TransaksiZakat['status']) : 'Belum Bayar',
				catatan: row[7] ? String(row[7]).trim() : undefined
			});
		});

	// Convert map ke array dan urutkan berdasarkan tanggal terbaru
	return Array.from(transaksiMap.values()).sort(
		(a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
	);
}

export async function getTransaksiById(id: string): Promise<TransaksiZakat | null> {
	const transaksiList = await getAllTransaksi();
	return transaksiList.find((t) => t.id === id) || null;
}

export async function createTransaksi(
	transaksi: Omit<TransaksiZakat, 'id' | 'tanggal'>
): Promise<TransaksiZakat> {
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
			values: [
				[
					id,
					tanggal,
					transaksi.kategori,
					transaksi.nilaiHarta,
					transaksi.zakatWajib,
					transaksi.metode,
					transaksi.status,
					transaksi.catatan || ''
				]
			]
		}
	});

	return {
		id,
		tanggal,
		...transaksi
	};
}

export async function updateTransaksi(
	id: string,
	updates: Partial<TransaksiZakat>
): Promise<boolean> {
	const auth = getGoogleAuth();
	const sheets = google.sheets({ version: 'v4', auth });

	// Trim the ID to ensure proper matching
	const trimmedId = id.trim();

	// Get raw data from sheets to find correct row number
	const response = await sheets.spreadsheets.values.get({
		spreadsheetId: getSpreadsheetId(),
		range: `${TRANSAKSI_SHEET}!A2:H`
	});

	const rows = response.data.values || [];
	console.log('Updating transaction with ID:', trimmedId);

	// Find the actual row number in spreadsheet (not filtered index)
	let rowNumber = -1;
	for (let i = 0; i < rows.length; i++) {
		const rowId = rows[i][0] ? String(rows[i][0]).trim() : '';
		if (rowId === trimmedId) {
			rowNumber = i + 2; // +2 because data starts at row 2
			break;
		}
	}

	if (rowNumber === -1) {
		console.error('Transaction not found with ID:', trimmedId);
		return false;
	}

	console.log('Found at row number:', rowNumber);

	// Get current data for this transaction
	const transaksiList = await getAllTransaksi();
	const transaksi = transaksiList.find((t) => t.id === trimmedId);
	if (!transaksi) {
		console.error('Transaction data not found in filtered list');
		return false;
	}

	const updatedTransaksi = { ...transaksi, ...updates };

	await sheets.spreadsheets.values.update({
		spreadsheetId: getSpreadsheetId(),
		range: `${TRANSAKSI_SHEET}!A${rowNumber}:H${rowNumber}`,
		valueInputOption: 'USER_ENTERED',
		requestBody: {
			values: [
				[
					updatedTransaksi.id,
					updatedTransaksi.tanggal,
					updatedTransaksi.kategori,
					updatedTransaksi.nilaiHarta,
					updatedTransaksi.zakatWajib,
					updatedTransaksi.metode,
					updatedTransaksi.status,
					updatedTransaksi.catatan || ''
				]
			]
		}
	});

	return true;
}

export async function deleteTransaksi(id: string): Promise<boolean> {
	const auth = getGoogleAuth();
	const sheets = google.sheets({ version: 'v4', auth });

	// Trim the ID to ensure proper matching
	const trimmedId = id.trim();

	// Get raw data from sheets to find correct row number
	const response = await sheets.spreadsheets.values.get({
		spreadsheetId: getSpreadsheetId(),
		range: `${TRANSAKSI_SHEET}!A2:H`
	});

	const rows = response.data.values || [];

	// Find the actual row number in spreadsheet
	let rowNumber = -1;
	for (let i = 0; i < rows.length; i++) {
		const rowId = rows[i][0] ? String(rows[i][0]).trim() : '';
		if (rowId === trimmedId) {
			rowNumber = i + 2; // +2 because data starts at row 2
			break;
		}
	}

	if (rowNumber === -1) return false;

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
				values: [
					['ID', 'Tanggal', 'Kategori', 'Nilai_Harta', 'Zakat_Wajib', 'Metode', 'Status', 'Catatan']
				]
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
