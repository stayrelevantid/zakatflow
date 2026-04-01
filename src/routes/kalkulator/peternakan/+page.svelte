<script lang="ts">
	import { Card, Input, Button } from '$lib/components/ui';
	import { fly, fade } from 'svelte/transition';
	import { isLoading } from '$lib/stores/zakat';
	import { createTransaksi } from '$lib/services/api';
	import { goto } from '$app/navigation';

	type JenisHewan = 'sapi' | 'kambing' | 'unta';

	let jenisHewan = $state<JenisHewan>('sapi');
	let jumlahHewan = $state<number>(0);
	let nilaiPerHewan = $state<number>(0);
	let metodeZakat = $state<'ternak' | 'uang'>('uang');
	let result = $state<{
		nisab: number;
		nilaiHarta: number;
		wajibZakat: boolean;
		zakatHewan: number;
		zakatRupiah: number;
		kadar: string;
		keterangan: string;
		zakatDetail: string;
	} | null>(null);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);

	// Nisab berdasarkan jenis hewan
	const nisabHewan: Record<JenisHewan, number> = {
		sapi: 30,
		kambing: 40,
		unta: 5
	};

	const nisabInfo: Record<JenisHewan, string> = {
		sapi: "30 ekor sapi. Zakat: 1 tabi' (anak sapi 1 thn) untuk 30-39 ekor",
		kambing: '40 ekor kambing. Zakat: 1 ekor untuk 40-120 ekor',
		unta: '5 ekor unta. Zakat: 1 ekor kambing untuk 5-24 ekor, atau unta untuk lebih banyak'
	};

	// Calculate zakat based on syariah nisab
	function calculateZakatHewan(
		jenis: JenisHewan,
		jumlah: number
	): { jumlahHewan: number; keterangan: string } {
		if (jenis === 'sapi') {
			if (jumlah < 30)
				return {
					jumlahHewan: 0,
					keterangan: `Jumlah ${jumlah} ekor belum mencapai nisab minimal 30 ekor`
				};
			if (jumlah >= 30 && jumlah <= 39)
				return { jumlahHewan: 1, keterangan: "1 ekor tabi' (anak sapi umur 1 tahun)" };
			if (jumlah >= 40 && jumlah <= 59)
				return { jumlahHewan: 1, keterangan: '1 ekor musinn (sapi umur 2 tahun)' };
			if (jumlah >= 60 && jumlah <= 69) return { jumlahHewan: 2, keterangan: "2 ekor tabi'" };
			if (jumlah >= 70 && jumlah <= 79)
				return { jumlahHewan: 2, keterangan: "1 ekor musinn + 1 ekor tabi'" };
			if (jumlah >= 80 && jumlah <= 89) return { jumlahHewan: 2, keterangan: '2 ekor musinn' };
			if (jumlah >= 90 && jumlah <= 99) return { jumlahHewan: 3, keterangan: "3 ekor tabi'" };
			if (jumlah >= 100 && jumlah <= 109)
				return { jumlahHewan: 3, keterangan: "1 ekor musinn + 2 ekor tabi'" };
			// For 110+ : continues pattern
			const tabi = Math.floor(jumlah / 30);
			return {
				jumlahHewan: tabi,
				keterangan: `${tabi} ekor tabi' (perhitungan detail sesuai tabel nisab)`
			};
		}

		if (jenis === 'kambing') {
			if (jumlah < 40)
				return {
					jumlahHewan: 0,
					keterangan: `Jumlah ${jumlah} ekor belum mencapai nisab minimal 40 ekor`
				};
			if (jumlah >= 40 && jumlah <= 120) return { jumlahHewan: 1, keterangan: '1 ekor kambing' };
			if (jumlah >= 121 && jumlah <= 200) return { jumlahHewan: 2, keterangan: '2 ekor kambing' };
			if (jumlah >= 201 && jumlah <= 399) return { jumlahHewan: 3, keterangan: '3 ekor kambing' };
			if (jumlah >= 400 && jumlah <= 499) return { jumlahHewan: 4, keterangan: '4 ekor kambing' };
			const tambah = Math.floor((jumlah - 400) / 100) + 1;
			return { jumlahHewan: 4 + tambah, keterangan: `${4 + tambah} ekor kambing` };
		}

		if (jenis === 'unta') {
			if (jumlah < 5)
				return {
					jumlahHewan: 0,
					keterangan: `Jumlah ${jumlah} ekor belum mencapai nisab minimal 5 ekor`
				};
			if (jumlah >= 5 && jumlah <= 9)
				return { jumlahHewan: 0, keterangan: '1 ekor kambing (untuk 5-9 unta)' };
			if (jumlah >= 10 && jumlah <= 14)
				return { jumlahHewan: 0, keterangan: '2 ekor kambing (untuk 10-14 unta)' };
			if (jumlah >= 15 && jumlah <= 19)
				return { jumlahHewan: 0, keterangan: '3 ekor kambing (untuk 15-19 unta)' };
			if (jumlah >= 20 && jumlah <= 24)
				return { jumlahHewan: 0, keterangan: '4 ekor kambing (untuk 20-24 unta)' };
			if (jumlah >= 25 && jumlah <= 35)
				return { jumlahHewan: 1, keterangan: '1 ekor bintu makhad (unta umur 1 tahun)' };
			if (jumlah >= 36 && jumlah <= 45)
				return { jumlahHewan: 1, keterangan: '1 ekor bintu labun (unta umur 2 tahun)' };
			if (jumlah >= 46 && jumlah <= 60)
				return { jumlahHewan: 1, keterangan: '1 ekor hiqqah (unta umur 3 tahun)' };
			if (jumlah >= 61 && jumlah <= 75)
				return { jumlahHewan: 1, keterangan: "1 ekor jadza' (unta umur 4 tahun)" };
			if (jumlah >= 76 && jumlah <= 90) return { jumlahHewan: 2, keterangan: '2 ekor bintu labun' };
			if (jumlah >= 91 && jumlah <= 120) return { jumlahHewan: 2, keterangan: '2 ekor hiqqah' };
			return {
				jumlahHewan: Math.ceil(jumlah / 50),
				keterangan: `Perhitungan khusus untuk ${jumlah} ekor unta`
			};
		}

		return { jumlahHewan: 0, keterangan: 'Jenis hewan tidak valid' };
	}

	function calculate() {
		error = null;

		if (jumlahHewan <= 0) {
			error = 'Jumlah hewan harus lebih dari 0';
			return;
		}

		const nisab = nisabHewan[jenisHewan];
		const wajibZakat = jumlahHewan >= nisab;
		const nilaiHarta = jumlahHewan * nilaiPerHewan;

		const zakatResult = calculateZakatHewan(jenisHewan, jumlahHewan);
		const zakatDetail = zakatResult.keterangan;

		// Calculate rupiah value based on payment method
		let zakatRupiah = 0;
		if (metodeZakat === 'uang' && nilaiPerHewan > 0) {
			// For cash payment, zakat value = zakat hewan × nilai per hewan
			zakatRupiah = zakatResult.jumlahHewan * nilaiPerHewan;
		} else if (metodeZakat === 'ternak') {
			// For livestock payment, show estimated cash equivalent
			zakatRupiah = zakatResult.jumlahHewan * nilaiPerHewan;
		}

		result = {
			nisab,
			nilaiHarta,
			wajibZakat,
			zakatHewan: zakatResult.jumlahHewan,
			zakatRupiah,
			kadar: zakatDetail,
			keterangan: wajibZakat
				? `${jumlahHewan} ekor ${jenisHewan} melebihi nisab ${nisab} ekor`
				: `Jumlah ${jumlahHewan} ekor belum mencapai nisab ${nisab} ekor`,
			zakatDetail
		};
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
				zakatWajib: result.zakatRupiah,
				metode: `${jumlahHewan} ekor ${jenisLabel[jenisHewan]} - ${result.zakatDetail} (${metodeZakat === 'ternak' ? 'Dibayar dengan ternak' : 'Dibayar dengan uang'})`,
				status: 'Belum Bayar',
				catatan: `Zakat: ${result.zakatHewan} ekor${result.wajibZakat ? '' : ' - Belum mencapai nisab'}`
			});
			success = 'Transaksi berhasil disimpan!';
			error = null;
			// Redirect ke dashboard setelah 1 detik
			setTimeout(() => {
				goto('/');
			}, 1000);
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
		metodeZakat = 'uang';
		result = null;
		error = null;
		success = null;
	}
</script>

<svelte:head>
	<title>Zakat Peternakan - ZakatFlow</title>
</svelte:head>

<div class="max-w-2xl mx-auto" transition:fade={{ duration: 400 }}>
	<a
		href="/kalkulator"
		class="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
	>
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
		</svg>
		Kembali ke Kalkulator
	</a>

	<div class="mb-8" transition:fly={{ y: -20, duration: 600 }}>
		<h1 class="text-4xl font-display font-bold text-white mb-2">🐄 Zakat Peternakan</h1>
		<p class="text-white/60 text-lg">Hitung zakat dari hasil ternak dengan nisab syariah</p>
		<p class="text-white/40 text-sm mt-2">
			Zakat dapat dibayar dengan ternak atau diwangkan (uang)
		</p>
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
					<Input
						label="Jumlah Hewan"
						type="number"
						placeholder="Masukkan jumlah hewan"
						bind:value={jumlahHewan}
						min="1"
					/>
				</div>

				<div>
					<label class="label mb-3">Metode Pembayaran Zakat</label>
					<div class="flex gap-4">
						<label class="flex items-center gap-2 cursor-pointer">
							<input type="radio" bind:group={metodeZakat} value="uang" class="w-4 h-4" />
							<span class="text-white">Dibayar dengan Uang</span>
						</label>
						<label class="flex items-center gap-2 cursor-pointer">
							<input type="radio" bind:group={metodeZakat} value="ternak" class="w-4 h-4" />
							<span class="text-white">Dibayar dengan Ternak</span>
						</label>
					</div>
				</div>

				{#if metodeZakat === 'uang'}
					<div>
						<Input
							label="Nilai per Hewan (Rp)"
							type="number"
							placeholder="Perkiraan nilai jual per ekor"
							bind:value={nilaiPerHewan}
							min="0"
						/>
						<p class="text-white/40 text-xs mt-1">Untuk konversi nilai zakat ke Rupiah</p>
					</div>
				{:else}
					<div>
						<Input
							label="Nilai per Hewan (Rp) - Opsional"
							type="number"
							placeholder="Untuk estimasi nilai"
							bind:value={nilaiPerHewan}
							min="0"
						/>
						<p class="text-white/40 text-xs mt-1">
							Opsional: untuk informasi estimasi nilai dalam rupiah
						</p>
					</div>
				{/if}

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

				<Button type="button" onclick={calculate} class="w-full">Hitung Zakat</Button>

				{#if result}
					<div class="bg-primary-500/20 border border-primary-500/30 rounded-xl p-4">
						<p class="text-white/60 text-sm mb-1">Hasil Perhitungan</p>

						{#if result.wajibZakat}
							<div class="text-white/80 text-sm mb-2">
								<span class="font-semibold">{result.zakatDetail}</span>
							</div>

							{#if metodeZakat === 'ternak'}
								<p class="text-3xl font-bold text-primary-400">
									{result.zakatHewan} ekor {jenisHewan === 'sapi'
										? 'sapi/kerbau'
										: jenisHewan === 'kambing'
											? 'kambing'
											: 'unta'}
								</p>
								{#if nilaiPerHewan > 0}
									<p class="text-white/60 text-sm mt-1">
										Estimasi nilai: {formatCurrency(result.zakatRupiah)}
									</p>
								{/if}
							{:else}
								<p class="text-3xl font-bold text-primary-400">
									{formatCurrency(result.zakatRupiah)}
								</p>
								<p class="text-white/60 text-sm mt-1">
									Setara dengan {result.zakatHewan} ekor {jenisHewan === 'sapi'
										? 'sapi/kerbau'
										: jenisHewan === 'kambing'
											? 'kambing'
											: 'unta'}
								</p>
							{/if}
						{:else}
							<p class="text-2xl font-bold text-yellow-400">Belum Wajib Zakat</p>
							<p class="text-white/60 text-sm mt-1">{result.keterangan}</p>
						{/if}

						<div class="mt-3 text-white/40 text-xs space-y-1">
							<p>
								Jumlah: {jumlahHewan} ekor {jenisHewan === 'sapi'
									? 'sapi/kerbau'
									: jenisHewan === 'kambing'
										? 'kambing'
										: 'unta'}
							</p>
							{#if nilaiPerHewan > 0}
								<p>Nilai hewan: {formatCurrency(result.nilaiHarta)}</p>
							{/if}
							<p>Nisab: {result.nisab} ekor</p>
						</div>
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

				{#if result && result.wajibZakat}
					<div class="flex gap-4">
						<Button type="button" onclick={handleSave} loading={$isLoading} class="flex-1">
							Simpan Transaksi
						</Button>
						<Button variant="outline" type="button" onclick={resetForm}>Reset</Button>
					</div>
				{:else if result}
					<div class="flex gap-4">
						<Button type="button" onclick={resetForm} variant="outline" class="flex-1"
							>Hitung Ulang</Button
						>
					</div>
				{/if}
			</form>
		</Card>
	</div>
</div>
