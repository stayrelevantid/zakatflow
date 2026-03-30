import type {
	ZakatFitrahInput,
	ZakatEmasInput,
	ZakatPenghasilanInput,
	ZakatPerdaganganInput,
	ZakatPertanianInput,
	ZakatPeternakanInput,
	ZakatPerikananInput,
	ZakatCalculationResult
} from '../types/zakat';

// Constants for Nisab values
const NISAB_EMAS_GRAM = 85;
const NISAB_PERAK_GRAM = 595;
const NISAB_PERTANIAN_KG = 653;
const ZAKAT_KADAR = 0.025; // 2.5%

// ========== ZAKAT FITRAH ==========

export function calculateZakatFitrah(input: ZakatFitrahInput): ZakatCalculationResult {
	const { jumlahJiwa, hargaBerasPerKg } = input;
	
	const nilaiHarta = jumlahJiwa * hargaBerasPerKg * 2.5; // 2.5 kg per jiwa
	const zakatWajib = jumlahJiwa * 2.5 * hargaBerasPerKg;

	return {
		nisab: 0, // No nisab for fitrah
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

	// Zakat Emas
	if (beratEmasGram >= NISAB_EMAS_GRAM) {
		const zakatEmas = beratEmasGram * hargaEmasPerGram * ZAKAT_KADAR;
		totalZakat += zakatEmas;
		ketentuan.push(`Emas: ${beratEmasGram}g × Rp ${hargaEmasPerGram.toLocaleString()} × 2.5% = Rp ${zakatEmas.toLocaleString()}`);
	}

	// Zakat Perak
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
	
	const kadar = metodeIrigasi ? 0.05 : 0.10; // 5% atau 10%
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

// ========== ZAKAT PETERNAKAN ==========

export function calculateZakatPeternakan(input: ZakatPeternakanInput): ZakatCalculationResult {
	const { nilaiHewan, jumlahHewan, jenisHewan, hargaEmasPerGram } = input;
	
	const nisab = NISAB_EMAS_GRAM * hargaEmasPerGram;
	const nilaiHarta = nilaiHewan * jumlahHewan;
	
	const wajibZakat = nilaiHarta >= nisab;
	const zakatWajib = wajibZakat ? nilaiHarta * ZAKAT_KADAR : 0;

	const jenisHewanLabel: Record<string, string> = {
		sapi: 'Sapi/Kerbau',
		kerbau: 'Kerbau',
		kambing: 'Kambing/Domba',
		unta: 'Unta',
		lainnya: 'Lainnya'
	};

	return {
		nisab,
		nilaiHarta,
		wajibZakat,
		zakatWajib,
		kadar: '2.5%',
		keterangan: wajibZakat
			? `Nilai ${jumlahHewan} ekor ${jenisHewanLabel[jenisHewan] || jenisHewan} = Rp ${nilaiHarta.toLocaleString()} melebihi nisab`
			: `Nilai hewan ternak Rp ${nilaiHarta.toLocaleString()} belum mencapai nisab Rp ${nisab.toLocaleString()}`
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