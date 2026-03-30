import { writable } from 'svelte/store';

export interface TransaksiZakat {
	id: string;
	tanggal: string;
	kategori: string;
	nilaiHarta: number;
	zakatWajib: number;
	metode: string;
	status: string;
	catatan?: string;
}

export interface ReferensiHarga {
	jenis: string;
	hargaPerUnit: number;
	satuan: string;
	terakhirUpdate: string;
}

// Transaksi Store
function createTransaksiStore() {
	const { subscribe, set, update } = writable<TransaksiZakat[]>([]);
	
	return {
		subscribe,
		set,
		add: (transaksi: TransaksiZakat) => update((list) => [...list, transaksi]),
		update: (id: string, updates: Partial<TransaksiZakat>) =>
			update((list) => list.map((t) => (t.id === id ? { ...t, ...updates } : t))),
		remove: (id: string) => update((list) => list.filter((t) => t.id !== id)),
		reset: () => set([])
	};
}

export const transaksiStore = createTransaksiStore();

// Referensi Store
function createReferensiStore() {
	const { subscribe, set, update } = writable<ReferensiHarga[]>([]);
	
	return {
		subscribe,
		set,
		updateHarga: (jenis: string, hargaBaru: number) =>
			update((list) =>
				list.map((r) =>
					r.jenis.toLowerCase() === jenis.toLowerCase()
						? { ...r, hargaPerUnit: hargaBaru, terakhirUpdate: new Date().toISOString().split('T')[0] }
						: r
				)
			),
		reset: () => set([])
	};
}

export const referensiStore = createReferensiStore();

// Loading State
export const isLoading = writable(false);

// Error State
export const errorStore = writable<string | null>(null);