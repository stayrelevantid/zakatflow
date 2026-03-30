import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { calculateZakatFitrah, calculateZakatEmas, calculateZakatPenghasilan, calculateZakatPerdagangan, calculateZakatPertanian, calculateZakatKebun } from '$lib/server/calculations';

// POST: Calculate zakat based on category
export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const { kategori, ...inputData } = data;
		
		let result;
		
		switch (kategori) {
			case 'Zakat Fitrah':
				result = calculateZakatFitrah(inputData);
				break;
			
			case 'Zakat Emas':
			case 'Zakat Perak':
				result = calculateZakatEmas(inputData);
				break;
			
			case 'Zakat Penghasilan':
				result = calculateZakatPenghasilan(inputData);
				break;
			
			case 'Zakat Perdagangan':
				result = calculateZakatPerdagangan(inputData);
				break;
			
			case 'Zakat Pertanian':
				result = calculateZakatPertanian(inputData);
				break;
			
			case 'Zakat Hasil Kebun/Ikan':
				result = calculateZakatKebun(inputData);
				break;
			
			default:
				return json({ error: 'Kategori zakat tidak valid' }, { status: 400 });
		}
		
		return json(result);
	} catch (error) {
		console.error('Error calculating zakat:', error);
		return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
	}
};