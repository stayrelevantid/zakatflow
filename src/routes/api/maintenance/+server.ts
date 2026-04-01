import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TRANSAKSI_SHEET = 'Transaksi_Zakat';

function getGoogleAuth() {
	const privateKey = process.env.GOOGLE_PRIVATE_KEY;
	const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

	if (!privateKey || !clientEmail) {
		throw new Error('GOOGLE_PRIVATE_KEY and GOOGLE_CLIENT_EMAIL environment variables must be set');
	}

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

// GET: Check data status
export const GET: RequestHandler = async () => {
	try {
		const auth = getGoogleAuth();
		const sheets = google.sheets({ version: 'v4', auth });

		const response = await sheets.spreadsheets.values.get({
			spreadsheetId: getSpreadsheetId(),
			range: `${TRANSAKSI_SHEET}!A2:H`
		});

		const rows = response.data.values || [];

		const analysis = {
			totalRows: rows.length,
			validRows: 0,
			emptyRows: 0,
			duplicateIds: [] as string[],
			sampleData: [] as any[]
		};

		const idMap = new Map<string, number>();

		rows.forEach((row, index) => {
			const id = row[0] ? String(row[0]).trim() : '';
			const isValidUUID = id.length === 36 && id.includes('-');
			const kategori = row[2] ? String(row[2]).trim() : '';

			if (!id && !kategori) {
				analysis.emptyRows++;
			} else if (isValidUUID && kategori) {
				analysis.validRows++;
				if (idMap.has(id)) {
					analysis.duplicateIds.push(id);
				} else {
					idMap.set(id, index);
				}

				// Simpan 5 sample data
				if (analysis.sampleData.length < 5) {
					analysis.sampleData.push({
						row: index + 2,
						id,
						kategori,
						status: row[6] || 'N/A'
					});
				}
			}
		});

		return json({
			success: true,
			analysis,
			needsCleanup: analysis.duplicateIds.length > 0 || analysis.emptyRows > 0
		});
	} catch (error) {
		console.error('Error analyzing data:', error);
		return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
	}
};

// POST: Clean up data
export const POST: RequestHandler = async () => {
	try {
		const auth = getGoogleAuth();
		const sheets = google.sheets({ version: 'v4', auth });
		const spreadsheetId = getSpreadsheetId();

		// Get all data
		const response = await sheets.spreadsheets.values.get({
			spreadsheetId,
			range: `${TRANSAKSI_SHEET}!A2:H`
		});

		const rows = response.data.values || [];

		// Keep only valid and unique rows
		const validRows: any[][] = [];
		const seenIds = new Set<string>();
		const removedRows: number[] = [];

		rows.forEach((row, index) => {
			const id = row[0] ? String(row[0]).trim() : '';
			const isValidUUID = id.length === 36 && id.includes('-');
			const kategori = row[2] ? String(row[2]).trim() : '';

			// Skip empty rows
			if (!id && !kategori) {
				removedRows.push(index + 2);
				return;
			}

			// Skip invalid UUID
			if (!isValidUUID) {
				removedRows.push(index + 2);
				return;
			}

			// Skip duplicates (keep first occurrence)
			if (seenIds.has(id)) {
				removedRows.push(index + 2);
				return;
			}

			seenIds.add(id);
			validRows.push([
				id,
				row[1] || '',
				row[2] || '',
				row[3] || 0,
				row[4] || 0,
				row[5] || '',
				row[6] || 'Belum Bayar',
				row[7] || ''
			]);
		});

		// Clear all data first
		await sheets.spreadsheets.values.clear({
			spreadsheetId,
			range: `${TRANSAKSI_SHEET}!A2:H`
		});

		// Write back clean data
		if (validRows.length > 0) {
			await sheets.spreadsheets.values.update({
				spreadsheetId,
				range: `${TRANSAKSI_SHEET}!A2:H${validRows.length + 1}`,
				valueInputOption: 'USER_ENTERED',
				requestBody: {
					values: validRows
				}
			});
		}

		return json({
			success: true,
			message: `Data berhasil dibersihkan. ${validRows.length} baris valid disimpan, ${removedRows.length} baris dihapus.`,
			removedRows,
			remainingRows: validRows.length
		});
	} catch (error) {
		console.error('Error cleaning up data:', error);
		return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
	}
};

// DELETE: Clear all data (with confirmation)
export const DELETE: RequestHandler = async ({ url }) => {
	const confirm = url.searchParams.get('confirm');

	if (confirm !== 'yes') {
		return json(
			{
				error: 'Konfirmasi diperlukan. Tambahkan ?confirm=yes untuk menghapus semua data.'
			},
			{ status: 400 }
		);
	}

	try {
		const auth = getGoogleAuth();
		const sheets = google.sheets({ version: 'v4', auth });

		await sheets.spreadsheets.values.clear({
			spreadsheetId: getSpreadsheetId(),
			range: `${TRANSAKSI_SHEET}!A2:H`
		});

		return json({
			success: true,
			message: 'Semua data berhasil dihapus'
		});
	} catch (error) {
		console.error('Error clearing data:', error);
		return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
	}
};
