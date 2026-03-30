// Zakat types and interfaces

export type ZakatCategory =
	| 'Zakat Fitrah'
	| 'Zakat Emas'
	| 'Zakat Perak'
	| 'Zakat Penghasilan'
	| 'Zakat Perdagangan'
	| 'Zakat Pertanian'
	| 'Zakat Peternakan/Perikanan';

export type PaymentStatus = 'Belum Bayar' | 'Sudah Bayar';

export interface TransaksiZakat {
	id: string;
	tanggal: string;
	kategori: ZakatCategory;
	nilaiHarta: number;
	zakatWajib: number;
	metode: string;
	status: PaymentStatus;
	catatan?: string;
}

export interface ReferensiHarga {
	jenis: string;
	hargaPerUnit: number;
	satuan: string;
	terakhirUpdate: string;
}

export interface ZakatFitrahInput {
	jumlahJiwa: number;
	hargaBerasPerKg: number;
}

export interface ZakatEmasInput {
	beratEmasGram: number;
	hargaEmasPerGram: number;
	beratPerakGram?: number;
	hargaPerakPerGram?: number;
}

export interface ZakatPenghasilanInput {
	gajiBulanan: number;
	hargaEmasPerGram: number;
}

export interface ZakatPerdaganganInput {
	modalUsaha: number;
	kas: number;
	piutangLancar: number;
	hutangJatuhTempo: number;
	hargaEmasPerGram: number;
}

export interface ZakatPertanianInput {
	hasilPanenKg: number;
	hargaPerKg: number;
	metodeIrigasi: boolean;
}

export interface ZakatPeternakanInput {
	pendapatanBersih: number;
	hargaEmasPerGram: number;
}

export interface ZakatCalculationResult {
	nisab: number;
	nilaiHarta: number;
	wajibZakat: boolean;
	zakatWajib: number;
	kadar: string;
	keterangan: string;
}