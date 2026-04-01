import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';

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

function generateRandomDate(daysBack: number): string {
	const date = new Date();
	date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
	return date.toISOString();
}

// Sample transaction data
const sampleTransaksi = [
	{
		kategori: 'Zakat Fitrah',
		nilaiHarta: 750000,
		zakatWajib: 750000,
		metode: '5 jiwa × 2.5 kg × Rp 15.000',
		status: 'Sudah Bayar',
		catatan: 'Ramadan 1445 H'
	},
	{
		kategori: 'Zakat Fitrah',
		nilaiHarta: 450000,
		zakatWajib: 450000,
		metode: '3 jiwa × 2.5 kg × Rp 15.000',
		status: 'Sudah Bayar',
		catatan: 'Ramadan 1445 H'
	},
	{
		kategori: 'Zakat Penghasilan',
		nilaiHarta: 120000000,
		zakatWajib: 3000000,
		metode: '2.5% dari penghasilan tahunan',
		status: 'Belum Bayar',
		catatan: 'Penghasilan bulanan Rp 10.000.000'
	},
	{
		kategori: 'Zakat Emas',
		nilaiHarta: 105000000,
		zakatWajib: 2625000,
		metode: '100 gram × Rp 1.050.000 × 2.5%',
		status: 'Sudah Bayar',
		catatan: 'Emas perhiasan'
	},
	{
		kategori: 'Zakat Perdagangan',
		nilaiHarta: 500000000,
		zakatWajib: 12500000,
		metode: '2.5% dari modal usaha bersih',
		status: 'Belum Bayar',
		catatan: 'Usaha toko kelontong'
	},
	{
		kategori: 'Zakat Pertanian',
		nilaiHarta: 26000000,
		zakatWajib: 2600000,
		metode: '10% dari hasil panen (tadah hujan)',
		status: 'Sudah Bayar',
		catatan: 'Panen padi 2000 kg × Rp 13.000'
	},
	{
		kategori: 'Zakat Peternakan',
		nilaiHarta: 1250000000,
		zakatWajib: 25000000,
		metode: '50 ekor sapi - 1 musinn (sapi 2 tahun)',
		status: 'Belum Bayar',
		catatan: 'Nisab tercapai: 50 ekor sapi'
	},
	{
		kategori: 'Zakat Peternakan',
		nilaiHarta: 252000000,
		zakatWajib: 4200000,
		metode: '120 ekor kambing - 2 ekor kambing',
		status: 'Sudah Bayar',
		catatan: 'Nisab tercapai: 120 ekor kambing'
	},
	{
		kategori: 'Zakat Perikanan',
		nilaiHarta: 50000000,
		zakatWajib: 1250000,
		metode: '2.5% dari pendapatan bersih perikanan',
		status: 'Sudah Bayar',
		catatan: 'Budidaya ikan nila'
	},
	{
		kategori: 'Zakat Perikanan',
		nilaiHarta: 120000000,
		zakatWajib: 3000000,
		metode: '2.5% dari pendapatan bersih perikanan',
		status: 'Belum Bayar',
		catatan: 'Tambak udang'
	},
	{
		kategori: 'Zakat Fitrah',
		nilaiHarta: 150000,
		zakatWajib: 150000,
		metode: '1 jiwa × 2.5 kg × Rp 15.000',
		status: 'Sudah Bayar',
		catatan: 'Ramadan 1445 H'
	},
	{
		kategori: 'Zakat Emas',
		nilaiHarta: 26250000,
		zakatWajib: 656250,
		metode: '25 gram × Rp 1.050.000 × 2.5%',
		status: 'Sudah Bayar',
		catatan: 'Emas perhiasan'
	},
	{
		kategori: 'Zakat Penghasilan',
		nilaiHarta: 240000000,
		zakatWajib: 6000000,
		metode: '2.5% dari penghasilan tahunan',
		status: 'Sudah Bayar',
		catatan: 'Penghasilan bulanan Rp 20.000.000'
	},
	{
		kategori: 'Zakat Pertanian',
		nilaiHarta: 45500000,
		zakatWajib: 2275000,
		metode: '5% dari hasil panen (irigasi)',
		status: 'Belum Bayar',
		catatan: 'Panen padi 3500 kg × Rp 13.000'
	},
	{
		kategori: 'Zakat Perdagangan',
		nilaiHarta: 200000000,
		zakatWajib: 5000000,
		metode: '2.5% dari modal usaha bersih',
		status: 'Sudah Bayar',
		catatan: 'Usaha online shop'
	}
];

// POST: Reset with sample data
export const POST: RequestHandler = async ({ request }) => {
	const { confirm } = await request.json();

	if (confirm !== 'RESET_ALL_DATA') {
		return json(
			{
				error: 'Konfirmasi tidak valid. Gunakan "RESET_ALL_DATA" untuk mengkonfirmasi.'
			},
			{ status: 400 }
		);
	}

	try {
		const auth = getGoogleAuth();
		const sheets = google.sheets({ version: 'v4', auth });
		const spreadsheetId = getSpreadsheetId();

		// Clear all data first
		await sheets.spreadsheets.values.clear({
			spreadsheetId,
			range: `${TRANSAKSI_SHEET}!A2:H`
		});

		// Prepare new data
		const transaksiValues: any[][] = [];

		for (const transaksi of sampleTransaksi) {
			const id = uuidv4();
			const tanggal = generateRandomDate(90);
			transaksiValues.push([
				id,
				tanggal,
				transaksi.kategori,
				transaksi.nilaiHarta.toString(),
				transaksi.zakatWajib.toString(),
				transaksi.metode,
				transaksi.status,
				transaksi.catatan || ''
			]);
		}

		// Write new data
		if (transaksiValues.length > 0) {
			await sheets.spreadsheets.values.update({
				spreadsheetId,
				range: `${TRANSAKSI_SHEET}!A2:H${transaksiValues.length + 1}`,
				valueInputOption: 'USER_ENTERED',
				requestBody: {
					values: transaksiValues
				}
			});
		}

		return json({
			success: true,
			message: `Data berhasil direset! ${sampleTransaksi.length} transaksi contoh telah ditambahkan.`,
			count: sampleTransaksi.length
		});
	} catch (error) {
		console.error('Error resetting data:', error);
		return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
	}
};
