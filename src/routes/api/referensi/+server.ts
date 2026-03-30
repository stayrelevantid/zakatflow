import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllReferensi, getReferensiByJenis, updateReferensi } from '$lib/server/sheets';

// GET: Get all referensi harga
export const GET: RequestHandler = async ({ url }) => {
	try {
		const jenis = url.searchParams.get('jenis');
		
		if (jenis) {
			const referensi = await getReferensiByJenis(jenis);
			if (!referensi) {
				return json({ error: 'Referensi harga tidak ditemukan' }, { status: 404 });
			}
			return json(referensi);
		}
		
		const referensiList = await getAllReferensi();
		return json(referensiList);
	} catch (error) {
		console.error('Error fetching referensi:', error);
		return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
	}
};

// PUT: Update referensi harga
export const PUT: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const { jenis, hargaPerUnit } = data;
		
		if (!jenis || !hargaPerUnit) {
			return json({ error: 'Jenis dan hargaPerUnit diperlukan' }, { status: 400 });
		}
		
		const updated = await updateReferensi(jenis, hargaPerUnit);
		
		if (!updated) {
			return json({ error: 'Referensi harga tidak ditemukan' }, { status: 404 });
		}
		
		return json({ success: true, message: 'Referensi harga berhasil diperbarui' });
	} catch (error) {
		console.error('Error updating referensi:', error);
		return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
	}
};