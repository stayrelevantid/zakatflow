import { browser } from '$app/environment';
import { isLoading, errorStore } from '../stores/zakat';
import type { TransaksiZakat, ReferensiHarga } from '../types/zakat';

const API_BASE = '/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
	isLoading.set(true);
	errorStore.set(null);

	try {
		const response = await fetch(`${API_BASE}${endpoint}`, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...options?.headers
			}
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Terjadi kesalahan');
		}

		const data = await response.json();
		return data;
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Terjadi kesalahan';
		errorStore.set(message);
		throw error;
	} finally {
		isLoading.set(false);
	}
}

// ========== TRANSAKSI ==========

export async function fetchAllTransaksi(): Promise<TransaksiZakat[]> {
	if (!browser) return [];
	return fetchApi<TransaksiZakat[]>('/transaksi');
}

export async function fetchTransaksiById(id: string): Promise<TransaksiZakat | null> {
	if (!browser) return null;
	return fetchApi<TransaksiZakat>(`/transaksi?id=${id}`);
}

export async function createTransaksi(data: Omit<TransaksiZakat, 'id' | 'tanggal'>): Promise<TransaksiZakat> {
	return fetchApi<TransaksiZakat>('/transaksi', {
		method: 'POST',
		body: JSON.stringify(data)
	});
}

export async function updateTransaksi(id: string, updates: Partial<TransaksiZakat>): Promise<{ success: boolean }> {
	return fetchApi<{ success: boolean }>('/transaksi', {
		method: 'PUT',
		body: JSON.stringify({ id, ...updates })
	});
}

export async function deleteTransaksi(id: string): Promise<{ success: boolean }> {
	return fetchApi<{ success: boolean }>(`/transaksi?id=${id}`, {
		method: 'DELETE'
	});
}

// ========== REFERENSI ==========

export async function fetchAllReferensi(): Promise<ReferensiHarga[]> {
	if (!browser) return [];
	return fetchApi<ReferensiHarga[]>('/referensi');
}

export async function fetchReferensiByJenis(jenis: string): Promise<ReferensiHarga | null> {
	if (!browser) return null;
	return fetchApi<ReferensiHarga>(`/referensi?jenis=${jenis}`);
}

export async function updateReferensi(jenis: string, hargaPerUnit: number): Promise<{ success: boolean }> {
	return fetchApi<{ success: boolean }>('/referensi', {
		method: 'PUT',
		body: JSON.stringify({ jenis, hargaPerUnit })
	});
}

// ========== KALKULATOR ==========

export interface KalkulatorInput {
	kategori: string;
	jumlahJiwa?: number;
	hargaBerasPerKg?: number;
	beratEmasGram?: number;
	hargaEmasPerGram?: number;
	beratPerakGram?: number;
	hargaPerakPerGram?: number;
	gajiBulanan?: number;
	modalUsaha?: number;
	kas?: number;
	piutangLancar?: number;
	hutangJatuhTempo?: number;
	hasilPanenKg?: number;
	hargaPerKg?: number;
	metodeIrigasi?: boolean;
	pendapatanBersih?: number;
	[key: string]: string | number | boolean | undefined;
}

export interface KalkulatorResult {
	nisab: number;
	nilaiHarta: number;
	wajibZakat: boolean;
	zakatWajib: number;
	kadar: string;
	keterangan: string;
}

export async function calculateZakat(input: KalkulatorInput): Promise<KalkulatorResult> {
	return fetchApi<KalkulatorResult>('/kalkulator', {
		method: 'POST',
		body: JSON.stringify(input)
	});
}