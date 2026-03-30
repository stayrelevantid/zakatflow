import type {
	ZakatFitrahInput,
	ZakatEmasInput,
	ZakatPenghasilanInput,
	ZakatPerdaganganInput,
	ZakatPertanianInput,
	ZakatPeternakanInput,
	ZakatPerikananInput,
	ZakatCalculationResult,
	ZakatPeternakanResult
} from '../types/zakat';

// Constants for Nisab values
const NISAB_EMAS_GRAM = 85;
const NISAB_PERAK_GRAM = 595;
const NISAB_PERTANIAN_KG = 653;
const ZAKAT_KADAR = 0.025; // 2.5%

// ========== ZAKAT FITRAH ==========

export function calculateZakatFitrah(input: ZakatFitrahInput): ZakatCalculationResult {
	const { jumlahJiwa, hargaBerasPerKg } = input;
	
	const nilaiHarta = jumlahJiwa * hargaBerasPerKg * 2.5;
	const zakatWajib = jumlahJiwa * 2.5 * hargaBerasPerKg;

	return {
		nisab: 0,
		nilaiHarta,
		wajibZakat: jumlahJiwa > 0,
		zakatWajib,
		kadar: '2.5 kg beras per jiwa',
		keterangan: `Zakat fitrah untuk ${jumlahJiwa} jiwa`
	};
}

// ========== ZAKAT EMAS & PERAK ==========

export function calculateZakatEmas(input: ZakatEmasInput): ZakatCalculationResult {
	const { beratEmasGram, hargaEmasPerGram, beratPerakGram, hargaPerakPerGram } = input;
	
	const nisabEmas = NISAB_EMAS_GRAM * hargaEmasPerGram;
	const nisabPerak = NISAB_PERAK_GRAM * (hargaPerakPerGram || 0);
	
	let totalZakat = 0;
	let ketentuan: string[] = [];

	if (beratEmasGram >= NISAB_EMAS_GRAM) {
		const zakatEmas = beratEmasGram * hargaEmasPerGram * ZAKAT_KADAR;
		totalZakat += zakatEmas;
		ketentuan.push(`Emas: ${beratEmasGram}g × Rp ${hargaEmasPerGram.toLocaleString()} × 2.5% = Rp ${zakatEmas.toLocaleString()}`);
	}

	if (beratPerakGram && beratPerakGram >= NISAB_PERAK_GRAM && hargaPerakPerGram) {
		const zakatPerak = beratPerakGram * hargaPerakPerGram * ZAKAT_KADAR;
		totalZakat += zakatPerak;
		ketentuan.push(`Perak: ${beratPerakGram}g × Rp ${hargaPerakPerGram.toLocaleString()} × 2.5% = Rp ${zakatPerak.toLocaleString()}`);
	}

	const nilaiHarta = (beratEmasGram * hargaEmasPerGram) + ((beratPerakGram || 0) * (hargaPerakPerGram || 0));
	const wajibZakat = (beratEmasGram >= NISAB_EMAS_GRAM) || ((beratPerakGram || 0) >= NISAB_PERAK_GRAM);

	return {
		nisab: nisabEmas,
		nilaiHarta,
		wajibZakat,
		zakatWajib: totalZakat,
		kadar: '2.5%',
		keterangan: ketentuan.join(' | ') || 'Belum mencapai nisab'
	};
}

// ========== ZAKAT PENGHASILAN ==========

export function calculateZakatPenghasilan(input: ZakatPenghasilanInput): ZakatCalculationResult {
	const { gajiBulanan, hargaEmasPerGram } = input;
	
	const nisabTahunan = NISAB_EMAS_GRAM * hargaEmasPerGram;
	const penghasilanTahunan = gajiBulanan * 12;
	
	const wajibZakat = penghasilanTahunan >= nisabTahunan;
	const zakatWajib = wajibZakat ? penghasilanTahunan * ZAKAT_KADAR : 0;

	return {
		nisab: nisabTahunan,
		nilaiHarta: penghasilanTahunan,
		wajibZakat,
		zakatWajib,
		kadar: '2.5%',
		keterangan: wajibZakat 
			? `Penghasilan tahunan Rp ${penghasilanTahunan.toLocaleString()} melebihi nisab Rp ${nisabTahunan.toLocaleString()}`
			: `Penghasilan tahunan Rp ${penghasilanTahunan.toLocaleString()} belum mencapai nisab Rp ${nisabTahunan.toLocaleString()}`
	};
}

// ========== ZAKAT PERDAGANGAN ==========

export function calculateZakatPerdagangan(input: ZakatPerdaganganInput): ZakatCalculationResult {
	const { modalUsaha, kas, piutangLancar, hutangJatuhTempo, hargaEmasPerGram } = input;
	
	const nisab = NISAB_EMAS_GRAM * hargaEmasPerGram;
	const totalHartaDagang = modalUsaha + kas + piutangLancar - hutangJatuhTempo;
	
	const wajibZakat = totalHartaDagang >= nisab;
	const zakatWajib = wajibZakat ? totalHartaDagang * ZAKAT_KADAR : 0;

	return {
		nisab,
		nilaiHarta: totalHartaDagang,
		wajibZakat,
		zakatWajib,
		kadar: '2.5%',
		keterangan: wajibZakat
			? `Total harta dagang Rp ${totalHartaDagang.toLocaleString()} melebihi nisab`
			: `Total harta dagang Rp ${totalHartaDagang.toLocaleString()} belum mencapai nisab`
	};
}

// ========== ZAKAT PERTANIAN ==========

export function calculateZakatPertanian(input: ZakatPertanianInput): ZakatCalculationResult {
	const { hasilPanenKg, hargaPerKg, metodeIrigasi } = input;
	
	const kadar = metodeIrigasi ? 0.05 : 0.10;
	const kadarLabel = metodeIrigasi ? '5% (irigasi)' : '10% (tadah hujan)';
	
	const nisab = NISAB_PERTANIAN_KG * hargaPerKg;
	const nilaiHarta = hasilPanenKg * hargaPerKg;
	
	const wajibZakat = hasilPanenKg >= NISAB_PERTANIAN_KG;
	const zakatWajib = wajibZakat ? nilaiHarta * kadar : 0;

	return {
		nisab,
		nilaiHarta,
		wajibZakat,
		zakatWajib,
		kadar: kadarLabel,
		keterangan: wajibZakat
			? `Hasil panen ${hasilPanenKg}kg melebihi nisab ${NISAB_PERTANIAN_KG}kg`
			: `Hasil panen ${hasilPanenKg}kg belum mencapai nisab ${NISAB_PERTANIAN_KG}kg`
	};
}

// ========== ZAKAT PETERNAKAN (Syariah Calculation) ==========

// Nisab Zakat Peternakan berdasarkan jenis hewan

// SAPI/KERBAU: Nisab 30 ekor
function calculateZakatSapi(jumlah: number): { zakatHewan: number; keterangan: string } {
	if (jumlah < 30) {
		return { zakatHewan: 0, keterangan: `Jumlah ${jumlah} ekor belum mencapai nisab minimal 30 ekor` };
	}
	
	let zakatHewan = 0;
	let keterangan = '';
	
	if (jumlah >= 30 && jumlah <= 39) {
		zakatHewan = 1; // 1 ekor tabi' (anak sapi umur 1 tahun)
		keterangan = '1 ekor tabi\' (anak sapi umur 1 tahun)';
	} else if (jumlah >= 40 && jumlah <= 59) {
		zakatHewan = 1; // 1 ekor musinn (sapi umur 2 tahun)
		keterangan = '1 ekor musinn (sapi umur 2 tahun)';
	} else if (jumlah >= 60 && jumlah <= 69) {
		zakatHewan = 2; // 2 ekor tabi'
		keterangan = '2 ekor tabi\'';
	} else if (jumlah >= 70 && jumlah <= 79) {
		zakatHewan = 2; // 1 musinn + 1 tabi'
		keterangan = '1 ekor musinn + 1 ekor tabi\'';
	} else if (jumlah >= 80 && jumlah <= 89) {
		zakatHewan = 2; // 2 ekor musinn
		keterangan = '2 ekor musinn';
	} else if (jumlah >= 90 && jumlah <= 99) {
		zakatHewan = 3; // 3 ekor tabi'
		keterangan = '3 ekor tabi\'';
	} else if (jumlah >= 100 && jumlah <= 109) {
		zakatHewan = 3; // 1 musinn + 2 tabi'
		keterangan = '1 ekor musinn + 2 ekor tabi\'';
	} else {
		// For 110+, pattern continues
		const ratusan = Math.floor(jumlah / 100);
		const sisa = jumlah % 100;
		zakatHewan = ratusan + calculateZakatSapi(sisa).zakatHewan;
		keterangan = `Perhitungan khusus untuk ${jumlah} ekor`;
	}
	
	return { zakatHewan, keterangan };
}

// KAMBING/DOMBA: Nisab 40 ekor
function calculateZakatKambing(jumlah: number): { zakatHewan: number; keterangan: string } {
	if (jumlah < 40) {
		return { zakatHewan: 0, keterangan: `Jumlah ${jumlah} ekor belum mencapai nisab minimal 40 ekor` };
	}
	
	let zakatHewan = 0;
	let keterangan = '';
	
	if (jumlah >= 40 && jumlah <= 120) {
		zakatHewan = 1;
		keterangan = '1 ekor kambing';
	} else if (jumlah >= 121 && jumlah <= 200) {
		zakatHewan = 2;
		keterangan = '2 ekor kambing';
	} else if (jumlah >= 201 && jumlah <= 399) {
		zakatHewan = 3;
		keterangan = '3 ekor kambing';
	} else if (jumlah >= 400 && jumlah <= 499) {
		zakatHewan = 4;
		keterangan = '4 ekor kambing';
	} else {
		// For 500+ : 4 ekor + 1 per 100
		const tambah = Math.floor((jumlah - 400) / 100);
		zakatHewan = 4 + tambah;
		keterangan = `${zakatHewan} ekor kambing`;
	}
	
	return { zakatHewan, keterangan };
}

// UNTA: Nisab 5 ekor
function calculateZakatUnta(jumlah: number): { zakatHewan: number; zakatTambahan: string; keterangan: string } {
	if (jumlah < 5) {
		return { zakatHewan: 0, zakatTambahan: '', keterangan: `Jumlah ${jumlah} ekor belum mencapai nisab minimal 5 ekor` };
	}
	
	let zakatHewan = 0;
	let zakatTambahan = '';
	let keterangan = '';
	
	if (jumlah >= 5 && jumlah <= 9) {
		zakatHewan = 0; // Tidak ada unta, diganti kambing
		zakatTambahan = '1 ekor kambing';
		keterangan = '1 ekor kambing (untuk 5-9 unta)';
	} else if (jumlah >= 10 && jumlah <= 14) {
		zakatHewan = 0;
		zakatTambahan = '2 ekor kambing';
		keterangan = '2 ekor kambing (untuk 10-14 unta)';
	} else if (jumlah >= 15 && jumlah <= 19) {
		zakatHewan = 0;
		zakatTambahan = '3 ekor kambing';
		keterangan = '3 ekor kambing (untuk 15-19 unta)';
	} else if (jumlah >= 20 && jumlah <= 24) {
		zakatHewan = 0;
		zakatTambahan = '4 ekor kambing';
		keterangan = '4 ekor kambing (untuk 20-24 unta)';
	} else if (jumlah >= 25 && jumlah <= 35) {
		zakatHewan = 1; // 1 bintu makhad (unta betina umur 1 tahun)
		keterangan = '1 ekor bintu makhad (unta betina umur 1 tahun)';
	} else if (jumlah >= 36 && jumlah <= 45) {
		zakatHewan = 1; // 1 bintu labun (unta betina umur 2 tahun)
		keterangan = '1 ekor bintu labun (unta betina umur 2 tahun)';
	} else if (jumlah >= 46 && jumlah <= 60) {
		zakatHewan = 1; // 1 hiqqah (unta betina umur 3 tahun)
		keterangan = '1 ekor hiqqah (unta betina umur 3 tahun)';
	} else if (jumlah >= 61 && jumlah <= 75) {
		zakatHewan = 1; // 1 jadza (unta betina umur 4 tahun)
		keterangan = '1 ekor jadza\' (unta betina umur 4 tahun)';
	} else if (jumlah >= 76 && jumlah <= 90) {
		zakatHewan = 2; // 2 bintu labun
		keterangan = '2 ekor bintu labun';
	} else if (jumlah >= 91 && jumlah <= 120) {
		zakatHewan = 2; // 2 hiqqah
		keterangan = '2 ekor hiqqah';
	} else {
		// For 121+ : pattern continues
		keterangan = `Perhitungan khusus untuk ${jumlah} ekor unta`;
	}
	
	return { zakatHewan, zakatTambahan, keterangan };
}

export function calculateZakatPeternakan(input: ZakatPeternakanInput & { nilaiPerHewan?: number }): ZakatCalculationResult {
	const { jenisHewan, jumlahHewan, nilaiPerHewan } = input;
	
	let nisab = 0;
	let wajibZakat = false;
	let zakatWajib = 0;
	let keterangan = '';
	let kadar = '';
	
	if (jenisHewan === 'sapi') {
		nisab = 30; // Nisab sapi minimal 30 ekor
		wajibZakat = jumlahHewan >= nisab;
		const result = calculateZakatSapi(jumlahHewan);
		
		if (wajibZakat && nilaiPerHewan) {
			// Nilai zakat = jumlah hewan yang wajib × nilai per hewan (perkiraan)
			// Ini adalah konversi ke uang untuk memudahkan pembayaran
			// Sebenarnya zakatnya dalam bentuk hewan
			zakatWajib = result.zakatHewan * nilaiPerHewan * ZAKAT_KADAR;
		}
		
		keterangan = wajibZakat 
			? `${jumlahHewan} ekor sapi melebihi nisab 30 ekor. Zakat: ${result.keterangan}`
			: result.keterangan;
		kadar = '1 ekor untuk setiap 30-40 ekor';
		
	} else if (jenisHewan === 'kambing') {
		nisab = 40; // Nisab kambing 40 ekor
		wajibZakat = jumlahHewan >= nisab;
		const result = calculateZakatKambing(jumlahHewan);
		
		if (wajibZakat && nilaiPerHewan) {
			zakatWajib = result.zakatHewan * nilaiPerHewan;
		}
		
		keterangan = wajibZakat 
			? `${jumlahHewan} ekor kambing melebihi nisab 40 ekor. Zakat: ${result.keterangan}`
			: result.keterangan;
		kadar = '1 ekor untuk 40-120 ekor';
		
	} else if (jenisHewan === 'unta') {
		nisab = 5; // Nisab unta 5 ekor
		wajibZakat = jumlahHewan >= nisab;
		const result = calculateZakatUnta(jumlahHewan);
		
		if (wajibZakat && nilaiPerHewan) {
			if (result.zakatHewan > 0) {
				// Unta wajib dizakatkan dengan unta
				zakatWajib = result.zakatHewan * nilaiPerHewan * ZAKAT_KADAR; // Perkiraan nilai
			} else if (result.zakatTambahan) {
				// Unta 5-24 ekor dizakatkan dengan kambing, konversi ke uang
				zakatWajib = (result.zakatTambahan.match(/\d+/)?.[0] || '0') as unknown as number * (nilaiPerHewan || 0) * 0.1;
			}
		}
		
		keterangan = wajibZakat 
			? `${jumlahHewan} ekor unta melebihi nisab. Zakat: ${result.keterangan}`
			: result.keterangan;
		kadar = 'Bervariasi sesuai jumlah';
	}
	
	return {
		nisab,
		nilaiHarta: jumlahHewan * (nilaiPerHewan || 0),
		wajibZakat,
		zakatWajib,
		kadar,
		keterangan
	};
}

// ========== ZAKAT PERIKANAN ==========

export function calculateZakatPerikanan(input: ZakatPerikananInput): ZakatCalculationResult {
	const { pendapatanBersih, hargaEmasPerGram } = input;
	
	const nisab = NISAB_EMAS_GRAM * hargaEmasPerGram;
	
	const wajibZakat = pendapatanBersih >= nisab;
	const zakatWajib = wajibZakat ? pendapatanBersih * ZAKAT_KADAR : 0;

	return {
		nisab,
		nilaiHarta: pendapatanBersih,
		wajibZakat,
		zakatWajib,
		kadar: '2.5%',
		keterangan: wajibZakat
			? `Pendapatan bersih dari perikanan Rp ${pendapatanBersih.toLocaleString()} melebihi nisab`
			: `Pendapatan bersih Rp ${pendapatanBersih.toLocaleString()} belum mencapai nisab Rp ${nisab.toLocaleString()}`
	};
}

// ========== HELPER: Get Nisab in Rupiah ==========

export function getNisabEmas(hargaEmasPerGram: number): number {
	return NISAB_EMAS_GRAM * hargaEmasPerGram;
}

export function getNisabPerak(hargaPerakPerGram: number): number {
	return NISAB_PERAK_GRAM * hargaPerakPerGram;
}

export function getNisabPertanian(hargaPerKg: number): number {
	return NISAB_PERTANIAN_KG * hargaPerKg;
}

export function getNisabPeternakan(jenisHewan: 'sapi' | 'kambing' | 'unta'): number {
	switch (jenisHewan) {
		case 'sapi': return 30;
		case 'kambing': return 40;
		case 'unta': return 5;
		default: return 40;
	}
}