<script lang="ts">
	import { Card, Input, Button } from '$lib/components/ui';
	import { fly, fade } from 'svelte/transition';
	import { isLoading } from '$lib/stores/zakat';
	import { createTransaksi } from '$lib/services/api';

	type JenisHewan = 'sapi' | 'kambing' | 'unta';

	let jenisHewan = $state<JenisHewan>('sapi');
	let jumlahHewan = $state<number>(0);
	let nilaiPerHewan = $state<number>(0);
	let result = $state<{ nisab: number; nilaiHarta: number; wajibZakat: boolean; zakatWajib: number; kadar: string; keterangan: string } | null>(null);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);

	// Nisab berdasarkan jenis hewan
	const nisabHewan: Record<JenisHewan, number> = {
		sapi: 30,
		kambing: 40,
		unta: 5
	};

	const nisabInfo: Record<JenisHewan, string> = {
		sapi: '30 ekor sapi. Zakat: 1 ekor tabi\' (anak sapi 1 thn) untuk 30-39 ekor',
		kambing: '40 ekor kambing. Zakat: 1 ekor untuk 40-120 ekor',
		unta: '5 ekor unta. Zakat: 1 ekor kambing untuk 5-24 ekor, atau unta untuk lebih banyak'
	};

	function calculate() {
		error = null;
		
		if (jumlahHewan <= 0) {
			error = 'Jumlah hewan harus lebih dari 0';
			return;
		}

		const nisab = nisabHewan[jenisHewan];
		const wajibZakat = jumlahHewan >= nisab;
		const nilaiHarta = jumlahHewan * nilaiPerHewan;
		
		let zakatWajib = 0;
		let keterangan = '';
		let kadar = '';

		if (jenisHewan === 'sapi') {
			kadar = '1 ekor tabi\'/musinn per 30-40 ekor';
			if (jumlahHewan < 30) {
				keterangan = `Jumlah ${jumlahHewan} ekor belum mencapai nisab minimal 30 ekor`;
			} else if (jumlahHewan >= 30 && jumlahHewan <= 39) {
				keterangan = 'Zakat: 1 ekor tabi\' (anak sapi umur 1 tahun)';
				zakatWajib = nilaiPerHewan * 0.025;
			} else if (jumlahHewan >= 40 && jumlahHewan <= 59) {
				keterangan = 'Zakat: 1 ekor musinn (sapi umur 2 tahun)';
				zakatWajib = nilaiPerHewan * 0.025;
			} else {
				const jumlahZakat = Math.floor(jumlahHewan / 30);
				keterangan = `Zakat: ~${jumlahZakat} ekor (perhitungan detail sesuai tabel nisab)`;
				zakatWajib = jumlahZakat * nilaiPerHewan * 0.025;
			}
		} else if (jenisHewan === 'kambing') {
			kadar = '1 ekor untuk 40-120 ekor';
			if (jumlahHewan < 40) {
				keterangan = `Jumlah ${jumlahHewan} ekor belum mencapai nisab minimal 40 ekor`;
			} else if (jumlahHewan >= 40 && jumlahHewan <= 120) {
				keterangan = 'Zakat: 1 ekor kambing';
				zakatWajib = nilaiPerHewan;
			} else if (jumlahHewan >= 121 && jumlahHewan <= 200) {
				keterangan = 'Zakat: 2 ekor kambing';
				zakatWajib = 2 * nilaiPerHewan;
			} else if (jumlahHewan >= 201 && jumlahHewan <= 399) {
				keterangan = 'Zakat: 3 ekor kambing';
				zakatWajib = 3 * nilaiPerHewan;
			} else {
				const tambah = Math.floor((jumlahHewan - 400) / 100) + 1;
				keterangan = `Zakat: ${4 + tambah} ekor kambing`;
				zakatWajib = (4 + tambah) * nilaiPerHewan;
			}
		} else if (jenisHewan === 'unta') {
			kadar = 'Bervariasi sesuai jumlah';
			if (jumlahHewan < 5) {
				keterangan = `Jumlah ${jumlahHewan} ekor belum mencapai nisab minimal 5 ekor`;
			} else if (jumlahHewan >= 5 && jumlahHewan <= 9) {
				keterangan = 'Zakat: 1 ekor kambing (untuk 5-9 unta)';
				zakatWajib = nilaiPerHewan * 0.1;
			} else if (jumlahHewan >= 10 && jumlahHewan <= 14) {
				keterangan = 'Zakat: 2 ekor kambing';
				zakatWajib = nilaiPerHewan * 0.2;
			} else if (jumlahHewan >= 25 && jumlahHewan <= 35) {
				keterangan = 'Zakat: 1 ekor bintu makhad (unta umur 1 thn)';
				zakatWajib = nilaiPerHewan * 0.025;
			} else {
				keterangan = `Perhitungan khusus untuk ${jumlahHewan} ekor unta`;
				zakatWajib = nilaiPerHewan * 0.025;
			}
		}

		result = { nisab, nilaiHarta, wajibZakat, zakatWajib, kadar, keterangan };
	}

	async function handleSave() {
		if (!result) {
			error = 'Silakan hitung zakat terlebih dahulu';
			return;
		}

		const jenisLabel = { sapi: 'Sapi/Kerbau', kambing: 'Kambing/Domba', unta: 'Unta' };

		try {
			await createTransaksi({
				kategori: 'Zakat Peternakan',
				nilaiHarta: result.nilaiHarta,
				zakatWajib: result.zakatWajib,
				metode: `${jumlahHewan} ekor ${jenisLabel[jenisHewan]} - ${result.keterangan}`,
				status: 'Belum Bayar',
				catatan: result.wajibZakat ? 'Wajib zakat' : 'Belum mencapai nisab'
			});
			success = 'Transaksi berhasil disimpan!';
			error = null;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Terjadi kesalahan saat menyimpan';
		}
	}

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(value);
	}

	function resetForm() {
		jenisHewan = 'sapi';
		jumlahHewan = 0;
		nilaiPerHewan = 0;
		result = null;
		error = null;
		success = null;
	}
</script>

<svelte:head>
	<title>Zakat Peternakan - ZakatFlow</title>
</svelte:head>

<div class="max-w-2xl mx-auto" transition:fade={{ duration: 400 }}>
	<a href="/kalkulator" class="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors">
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
		</svg>
		Kembali ke Kalkulator
	</a>

	<div class="mb-8" transition:fly={{ y: -20, duration: 600 }}>
		<h1 class="text-4xl font-display font-bold text-white mb-2">🐄 Zakat Peternakan</h1>
		<p class="text-white/60 text-lg">Hitung zakat dari hasil ternak dengan nisab syariah</p>
	</div>

	<div transition:fly={{ y: 20, delay: 100, duration: 500 }}>
		<Card class="p-8">
			<form class="space-y-6">
				<div>
					<label class="label mb-3">Jenis Hewan Ternak</label>
					<select bind:value={jenisHewan} class="glass-input w-full px-4 py-3 rounded-xl">
						<option value="sapi">Sapi/Kerbau</option>
						<option value="kambing">Kambing/Domba</option>
						<option value="unta">Unta</option>
					</select>
					<p class="text-white/40 text-xs mt-1">Nisab: {nisabInfo[jenisHewan]}</p>
				</div>

				<div>
					<Input label="Jumlah Hewan" type="number" placeholder="Masukkan jumlah hewan" bind:value={jumlahHewan} min="1" />
				</div>

				<div>
					<Input label="Nilai per Hewan (Rp)" type="number" placeholder="Perkiraan nilai jual per ekor" bind:value={nilaiPerHewan} min="0" />
					<p class="text-white/40 text-xs mt-1">Untuk konversi nilai zakat ke Rupiah</p>
				</div>

				<div class="bg-white/5 rounded-xl p-4 border border-white/10">
					<h3 class="text-white font-semibold mb-2">📖 Informasi Nisab Syariah</h3>
					<div class="text-white/60 text-sm space-y-2">
						<p class="font-medium text-white">Sapi/Kerbau:</p>
						<ul class="ml-4 list-disc">
							<li>Nisab: 30 ekor</li>
							<li>30-39 ekor: 1 tabi' (anak sapi 1 thn)</li>
							<li>40-59 ekor: 1 musinn (sapi 2 thn)</li>
							<li>60-69 ekor: 2 tabi'</li>
						</ul>
						<p class="font-medium text-white mt-2">Kambing/Domba:</p>
						<ul class="ml-4 list-disc">
							<li>Nisab: 40 ekor</li>
							<li>40-120 ekor: 1 ekor</li>
							<li>121-200 ekor: 2 ekor</li>
							<li>201-399 ekor: 3 ekor</li>
						</ul>
						<p class="font-medium text-white mt-2">Unta:</p>
						<ul class="ml-4 list-disc">
							<li>Nisab: 5 ekor</li>
							<li>5-24 ekor: dibayar dengan kambing</li>
							<li>25+ ekor: dibayar dengan unta</li>
						</ul>
					</div>
				</div>

				{#if result}
					<div class="bg-primary-500/20 border border-primary-500/30 rounded-xl p-4">
						<p class="text-white/60 text-sm mb-1">Hasil Perhitungan</p>
						<p class="text-3xl font-bold text-primary-400">{formatCurrency(result.zakatWajib)}</p>
						<div class="mt-2 text-white/40 text-xs space-y-1">
							<p>Jumlah: {jumlahHewan} ekor {jenisHewan === 'sapi' ? 'sapi/kerbau' : jenisHewan === 'kambing' ? 'kambing' : 'unta'}</p>
							<p>Nilai hewan: {formatCurrency(result.nilaiHarta)}</p>
							<p>Nisab: {result.nisab} ekor</p>
							<p class="text-white/60 text-sm mt-2">{result.keterangan}</p>
							<p class="{result.wajibZakat ? 'text-green-400' : 'text-yellow-400'} mt-2">
								{result.wajibZakat ? '✓ Wajib zakat' : '✗ Belum mencapai nisab'}
							</p>
						</div>
					</div>
				{:else}
					<div class="bg-white/5 border border-white/10 rounded-xl p-4">
						<p class="text-white/40 text-sm">Klik "Hitung Zakat" untuk melihat hasil perhitungan sesuai nisab syariah</p>
					</div>
				{/if}

				{#if error}
					<div class="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
						<p class="text-red-400 text-sm">{error}</p>
					</div>
				{/if}

				{#if success}
					<div class="p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
						<p class="text-green-400 text-sm">{success}</p>
					</div>
				{/if}

				<div class="flex gap-4">
					<Button type="button" onclick={calculate} class="flex-1">Hitung Zakat</Button>
				</div>

				{#if result}
					<div class="flex gap-4">
						<Button type="button" onclick={handleSave} loading={$isLoading} disabled={!result.wajibZakat} class="flex-1">
							{result.wajibZakat ? 'Simpan Transaksi' : 'Tidak Wajib Zakat'}
						</Button>
						<Button variant="outline" type="button" onclick={resetForm}>Reset</Button>
					</div>
				{/if}
			</form>
		</Card>
	</div>
</div>