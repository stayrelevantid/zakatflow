// Zakat types and interfaces

export type ZakatCategory =
	| 'Zakat Fitrah'
	| 'Zakat Emas'
	| 'Zakat Perak'
	| 'Zakat Penghasilan'
	| 'Zakat Perdagangan'
	| 'Zakat Pertanian'
	| 'Zakat Peternakan'
	| 'Zakat Perikanan';

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
	jenisHewan: 'sapi' | 'kambing' | 'unta';
	jumlahHewan: number;
	// Nilai hewan untuk informasi saja, tidak digunakan dalam perhitungan nisab syariah
	nilaiPerHewan?: number;
}

export interface ZakatPerikananInput {
	pendapatanBersih: number;
	hargaEmasPerGram: number;
}

// Zakat Peternakan result dengan detail hewan
export interface ZakatPeternakanResult {
	nisab: number; // jumlah minimum hewan
	jumlahHewan: number;
	jenisHewan: 'sapi' | 'kambing' | 'unta';
	wajibZakat: boolean;
	zakatHewan: number; // jumlah hewan yang wajib dizakatkan
	zakatUang?: number; // nilai dalam uang jika dikonversi
	kadar: string;
	keterangan: string;
}

export interface ZakatCalculationResult {
	nisab: number;
	nilaiHarta: number;
	wajibZakat: boolean;
	zakatWajib: number;
	kadar: string;
	keterangan: string;
}