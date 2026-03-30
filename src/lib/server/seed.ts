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

// Sample transaction data
const sampleTransaksi = [
	{
		kategori: 'Zakat Fitrah' as const,
		nilaiHarta: 750000,
		zakatWajib: 750000,
		metode: '5 jiwa × 2.5 kg × Rp 15.000',
		status: 'Sudah Bayar' as const,
		catatan: 'Ramadan 1445 H'
	},
	{
		kategori: 'Zakat Fitrah' as const,
		nilaiHarta: 450000,
		zakatWajib: 450000,
		metode: '3 jiwa × 2.5 kg × Rp 15.000',
		status: 'Sudah Bayar' as const,
		catatan: 'Ramadan 1445 H'
	},
	{
		kategori: 'Zakat Penghasilan' as const,
		nilaiHarta: 120000000,
		zakatWajib: 3000000,
		metode: '2.5% dari penghasilan tahunan',
		status: 'Belum Bayar' as const,
		catatan: 'Penghasilan bulanan Rp 10.000.000'
	},
	{
		kategori: 'Zakat Emas' as const,
		nilaiHarta: 105000000,
		zakatWajib: 2625000,
		metode: '100 gram × Rp 1.050.000 × 2.5%',
		status: 'Sudah Bayar' as const,
		catatan: 'Emas perhiasan'
	},
	{
		kategori: 'Zakat Perdagangan' as const,
		nilaiHarta: 500000000,
		zakatWajib: 12500000,
		metode: '2.5% dari modal usaha bersih',
		status: 'Belum Bayar' as const,
		catatan: 'Usaha toko kelontong'
	},
	{
		kategori: 'Zakat Pertanian' as const,
		nilaiHarta: 26000000,
		zakatWajib: 2600000,
		metode: '10% dari hasil panen (tadah hujan)',
		status: 'Sudah Bayar' as const,
		catatan: 'Panen padi 2000 kg × Rp 13.000'
	},
	{
		kategori: 'Zakat Peternakan' as const,
		nilaiHarta: 150000000,
		zakatWajib: 2500000,
		metode: '50 ekor sapi - 1 musinn (sapi 2 tahun)',
		status: 'Belum Bayar' as const,
		catatan: 'Nisab tercapai: 50 ekor sapi'
	},
	{
		kategori: 'Zakat Peternakan' as const,
		nilaiHarta: 84000000,
		zakatWajib: 2100000,
		metode: '120 ekor kambing - 2 ekor kambing',
		status: 'Sudah Bayar' as const,
		catatan: 'Nisab tercapai: 120 ekor kambing'
	},
	{
		kategori: 'Zakat Perikanan' as const,
		nilaiHarta: 50000000,
		zakatWajib: 1250000,
		metode: '2.5% dari pendapatan bersih perikanan',
		status: 'Sudah Bayar' as const,
		catatan: 'Budidaya ikan nila'
	},
	{
		kategori: 'Zakat Perikanan' as const,
		nilaiHarta: 120000000,
		zakatWajib: 3000000,
		metode: '2.5% dari pendapatan bersih perikanan',
		status: 'Belum Bayar' as const,
		catatan: 'Tambak udang'
	}
];

// Reference price data
const referensiHarga = [
	{ jenis: 'Emas', hargaPerUnit: 1100000, satuan: 'gram' },
	{ jenis: 'Perak', hargaPerUnit: 18000, satuan: 'gram' },
	{ jenis: 'Beras', hargaPerUnit: 15000, satuan: 'kg' },
	{ jenis: 'Sapi', hargaPerUnit: 25000000, satuan: 'ekor' },
	{ jenis: 'Kambing', hargaPerUnit: 2100000, satuan: 'ekor' },
	{ jenis: 'Unta', hargaPerUnit: 50000000, satuan: 'ekor' },
	{ jenis: 'Gandum', hargaPerUnit: 12000, satuan: 'kg' },
	{ jenis: 'Kurma', hargaPerUnit: 35000, satuan: 'kg' }
];

function generateRandomDate(daysBack: number): string {
	const date = new Date();
	date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
	return date.toISOString();
}

export async function seedDatabase(): Promise<void> {
	const auth = getGoogleAuth();
	const sheets = google.sheets({ version: 'v4', auth });
	const spreadsheetId = getSpreadsheetId();

	console.log('Starting database seed...');

	// Create sheets if not exist
	const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
	const existingSheets = spreadsheet.data.sheets?.map((s) => s.properties?.title) || [];

	// Create Transaksi_Zakat sheet
	if (!existingSheets.includes('Transaksi_Zakat')) {
		await sheets.spreadsheets.batchUpdate({
			spreadsheetId,
			requestBody: {
				requests: [{ addSheet: { properties: { title: 'Transaksi_Zakat' } } }]
			}
		});
		console.log('Created Transaksi_Zakat sheet');
	}

	// Create Referensi_Harga sheet
	if (!existingSheets.includes('Referensi_Harga')) {
		await sheets.spreadsheets.batchUpdate({
			spreadsheetId,
			requestBody: {
				requests: [{ addSheet: { properties: { title: 'Referensi_Harga' } } }]
			}
		});
		console.log('Created Referensi_Harga sheet');
	}

	// Seed Transaksi_Zakat
	const transaksiValues = [
		['ID', 'Tanggal', 'Kategori', 'Nilai_Harta', 'Zakat_Wajib', 'Metode', 'Status', 'Catatan']
	];

	for (const transaksi of sampleTransaksi) {
		const id = uuidv4();
		const tanggal = generateRandomDate(90); // Random date within last 90 days
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

	await sheets.spreadsheets.values.update({
		spreadsheetId,
		range: 'Transaksi_Zakat!A1:H' + transaksiValues.length,
		valueInputOption: 'USER_ENTERED',
		requestBody: { values: transaksiValues }
	});
	console.log(`Seeded ${sampleTransaksi.length} transaksi`);

	// Seed Referensi_Harga
	const referensiValues = [
		['Jenis', 'Harga_Per_Unit', 'Satuan', 'Terakhir_Update']
	];

	const today = new Date().toISOString().split('T')[0];
	for (const ref of referensiHarga) {
		referensiValues.push([ref.jenis, ref.hargaPerUnit.toString(), ref.satuan, today]);
	}

	await sheets.spreadsheets.values.update({
		spreadsheetId,
		range: 'Referensi_Harga!A1:D' + referensiValues.length,
		valueInputOption: 'USER_ENTERED',
		requestBody: { values: referensiValues }
	});
	console.log(`Seeded ${referensiHarga.length} referensi harga`);

	console.log('Database seed completed!');
}

export async function clearDatabase(): Promise<void> {
	const auth = getGoogleAuth();
	const sheets = google.sheets({ version: 'v4', auth });
	const spreadsheetId = getSpreadsheetId();

	// Clear Transaksi_Zakat (keep header)
	await sheets.spreadsheets.values.clear({
		spreadsheetId,
		range: 'Transaksi_Zakat!A2:H'
	});
	console.log('Cleared Transaksi_Zakat data');

	// Clear Referensi_Harga (keep header)
	await sheets.spreadsheets.values.clear({
		spreadsheetId,
		range: 'Referensi_Harga!A2:D'
	});
	console.log('Cleared Referensi_Harga data');
}