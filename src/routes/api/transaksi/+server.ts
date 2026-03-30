import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllTransaksi, createTransaksi, getTransaksiById, updateTransaksi, deleteTransaksi } from '$lib/server/sheets';
import type { TransaksiZakat } from '$lib/types/zakat';
import { v4 as uuidv4 } from 'uuid';

// GET: Get all transaksi or by ID
export const GET: RequestHandler = async ({ url }) => {
	try {
		const id = url.searchParams.get('id');
		
		if (id) {
			const transaksi = await getTransaksiById(id);
			if (!transaksi) {
				return json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
			}
			return json(transaksi);
		}
		
		const transaksiList = await getAllTransaksi();
		return json(transaksiList);
	} catch (error) {
		console.error('Error fetching transaksi:', error);
		return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
	}
};

// POST: Create new transaksi
export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		
		const transaksiData: Omit<TransaksiZakat, 'id' | 'tanggal'> = {
			kategori: data.kategori,
			nilaiHarta: data.nilaiHarta,
			zakatWajib: data.zakatWajib,
			metode: data.metode,
			status: data.status || 'Belum Bayar',
			catatan: data.catatan
		};
		
		const newTransaksi = await createTransaksi(transaksiData);
		
		return json({ success: true, data: newTransaksi }, { status: 201 });
	} catch (error) {
		console.error('Error creating transaksi:', error);
		return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
	}
};

// PUT: Update transaksi
export const PUT: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const { id, ...updates } = data;
		
		if (!id) {
			return json({ error: 'ID transaksi diperlukan' }, { status: 400 });
		}
		
		const updated = await updateTransaksi(id, updates);
		
		if (!updated) {
			return json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
		}
		
		return json({ success: true, message: 'Transaksi berhasil diperbarui' });
	} catch (error) {
		console.error('Error updating transaksi:', error);
		return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
	}
};

// DELETE: Delete transaksi
export const DELETE: RequestHandler = async ({ url }) => {
	try {
		const id = url.searchParams.get('id');
		
		if (!id) {
			return json({ error: 'ID transaksi diperlukan' }, { status: 400 });
		}
		
		const deleted = await deleteTransaksi(id);
		
		if (!deleted) {
			return json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
		}
		
		return json({ success: true, message: 'Transaksi berhasil dihapus' });
	} catch (error) {
		console.error('Error deleting transaksi:', error);
		return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
	}
};