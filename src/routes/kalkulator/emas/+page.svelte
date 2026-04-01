<script lang="ts">
	import { Card, Input, Button } from '$lib/components/ui';
	import { fly, fade } from 'svelte/transition';
	import { isLoading } from '$lib/stores/zakat';
	import { createTransaksi } from '$lib/services/api';
	import { goto } from '$app/navigation';

	type JenisZakat = 'emas' | 'perak' | null;

	let jenisZakat = $state<JenisZakat>(null);
	let beratEmas = $state<number>(0);
	let hargaEmas = $state<number>(1100000);
	let beratPerak = $state<number>(0);
	let hargaPerak = $state<number>(15000);
	let result = $state<{
		nisab: number;
		berat: number;
		nilaiHarta: number;
		wajibZakat: boolean;
		zakatWajib: number;
		kadar: string;
		keterangan: string;
	} | null>(null);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);

	const nisabEmas = 85; // gram
	const nisabPerak = 595; // gram
	const kadarZakat = 0.025; // 2.5%

	function pilihJenis(jenis: JenisZakat) {
		jenisZakat = jenis;
		resetForm();
	}

	function calculate() {
		error = null;

		if (jenisZakat === 'emas') {
			if (beratEmas <= 0) {
				error = 'Berat emas harus lebih dari 0';
				return;
			}
			if (hargaEmas <= 0) {
				error = 'Harga emas harus lebih dari 0';
				return;
			}

			const nilaiHarta = beratEmas * hargaEmas;
			const wajibZakat = beratEmas >= nisabEmas;
			const zakatWajib = wajibZakat ? nilaiHarta * kadarZakat : 0;

			result = {
				nisab: nisabEmas,
				berat: beratEmas,
				nilaiHarta,
				wajibZakat,
				zakatWajib,
				kadar: '2.5%',
				keterangan: wajibZakat
					? `${beratEmas} gram emas melebihi nisab ${nisabEmas} gram`
					: `${beratEmas} gram emas belum mencapai nisab ${nisabEmas} gram`
			};
		} else if (jenisZakat === 'perak') {
			if (beratPerak <= 0) {
				error = 'Berat perak harus lebih dari 0';
				return;
			}
			if (hargaPerak <= 0) {
				error = 'Harga perak harus lebih dari 0';
				return;
			}

			const nilaiHarta = beratPerak * hargaPerak;
			const wajibZakat = beratPerak >= nisabPerak;
			const zakatWajib = wajibZakat ? nilaiHarta * kadarZakat : 0;

			result = {
				nisab: nisabPerak,
				berat: beratPerak,
				nilaiHarta,
				wajibZakat,
				zakatWajib,
				kadar: '2.5%',
				keterangan: wajibZakat
					? `${beratPerak} gram perak melebihi nisab ${nisabPerak} gram`
					: `${beratPerak} gram perak belum mencapai nisab ${nisabPerak} gram`
			};
		}
	}

	async function handleSave() {
		if (!result || !jenisZakat) {
			error = 'Silakan hitung zakat terlebih dahulu';
			return;
		}

		try {
			await createTransaksi({
				kategori: jenisZakat === 'emas' ? 'Zakat Emas' : 'Zakat Perak',
				nilaiHarta: result.nilaiHarta,
				zakatWajib: result.zakatWajib,
				metode: `${result.berat} gram × Rp ${(jenisZakat === 'emas' ? hargaEmas : hargaPerak).toLocaleString('id-ID')}/gram`,
				status: 'Belum Bayar',
				catatan: result.wajibZakat ? 'Wajib zakat' : 'Belum mencapai nisab'
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
		beratEmas = 0;
		hargaEmas = 1100000;
		beratPerak = 0;
		hargaPerak = 15000;
		result = null;
		error = null;
		success = null;
	}

	function kembaliKePilihan() {
		jenisZakat = null;
		resetForm();
	}
</script>

<svelte:head>
	<title>Zakat Emas/Perak - ZakatFlow</title>
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
		<h1 class="text-4xl font-display font-bold text-white mb-2">🥇 Zakat Emas & Perak</h1>
		<p class="text-white/60 text-lg">Hitung zakat atas harta emas dan perak Anda</p>
	</div>

	{#if !jenisZakat}
		<!-- Pilihan Jenis Zakat -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4" transition:fly={{ y: 20, duration: 500 }}>
			<button
				onclick={() => pilihJenis('emas')}
				class="glass-card p-8 rounded-xl text-left hover:bg-white/10 transition-all group"
			>
				<div class="text-5xl mb-4">🥇</div>
				<h3
					class="text-xl font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors"
				>
					Zakat Emas
				</h3>
				<p class="text-white/60 text-sm">
					Nisab: 85 gram<br />
					Kadar: 2.5%
				</p>
			</button>

			<button
				onclick={() => pilihJenis('perak')}
				class="glass-card p-8 rounded-xl text-left hover:bg-white/10 transition-all group"
			>
				<div class="text-5xl mb-4">🥈</div>
				<h3
					class="text-xl font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors"
				>
					Zakat Perak
				</h3>
				<p class="text-white/60 text-sm">
					Nisab: 595 gram<br />
					Kadar: 2.5%
				</p>
			</button>
		</div>
	{:else}
		<!-- Form Perhitungan -->
		<div transition:fly={{ y: 20, duration: 500 }}>
			<Card class="p-8">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-2xl font-semibold text-white">
						{jenisZakat === 'emas' ? '🥇 Zakat Emas' : '🥈 Zakat Perak'}
					</h2>
					<button
						onclick={kembaliKePilihan}
						class="text-sm text-white/60 hover:text-white transition-colors"
					>
						Ganti Jenis →
					</button>
				</div>

				<form class="space-y-6">
					{#if jenisZakat === 'emas'}
						<div>
							<Input
								label="Berat Emas (gram)"
								type="number"
								placeholder="Masukkan berat emas"
								bind:value={beratEmas}
								min="0"
								step="0.01"
							/>
							<p class="text-white/40 text-xs mt-1">Nisab emas: 85 gram</p>
						</div>

						<div>
							<Input
								label="Harga Emas per Gram (Rp)"
								type="number"
								placeholder="Harga emas saat ini"
								bind:value={hargaEmas}
								min="1"
							/>
						</div>
					{:else}
						<div>
							<Input
								label="Berat Perak (gram)"
								type="number"
								placeholder="Masukkan berat perak"
								bind:value={beratPerak}
								min="0"
								step="0.01"
							/>
							<p class="text-white/40 text-xs mt-1">Nisab perak: 595 gram</p>
						</div>

						<div>
							<Input
								label="Harga Perak per Gram (Rp)"
								type="number"
								placeholder="Harga perak saat ini"
								bind:value={hargaPerak}
								min="1"
							/>
						</div>
					{/if}

					<div class="bg-white/5 rounded-xl p-4 border border-white/10">
						<h3 class="text-white font-semibold mb-2">
							Informasi Zakat {jenisZakat === 'emas' ? 'Emas' : 'Perak'}
						</h3>
						<ul class="text-white/60 text-sm space-y-1">
							<li>
								• Nisab {jenisZakat === 'emas' ? 'Emas' : 'Perak'}: {jenisZakat === 'emas'
									? '85'
									: '595'} gram
							</li>
							<li>• Kadar Zakat: 2.5%</li>
						</ul>
					</div>

					{#if result}
						<div class="bg-primary-500/20 border border-primary-500/30 rounded-xl p-4">
							<p class="text-white/60 text-sm mb-1">
								Total Zakat {jenisZakat === 'emas' ? 'Emas' : 'Perak'}
							</p>
							{#if result.wajibZakat}
								<p class="text-3xl font-bold text-primary-400">
									{formatCurrency(result.zakatWajib)}
								</p>
								<p class="text-white/40 text-xs mt-1">
									{result.berat} gram × Rp {(jenisZakat === 'emas'
										? hargaEmas
										: hargaPerak
									).toLocaleString('id-ID')} × 2.5%
								</p>
							{:else}
								<p class="text-2xl font-bold text-yellow-400">Belum Wajib Zakat</p>
								<p class="text-white/60 text-sm mt-1">{result.keterangan}</p>
							{/if}
						</div>
					{:else}
						<div class="bg-white/5 border border-white/10 rounded-xl p-4">
							<p class="text-white/40 text-sm">
								Klik "Hitung Zakat" untuk melihat hasil perhitungan
							</p>
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
							<p class="text-green-400/70 text-xs mt-1">Mengalihkan ke dashboard...</p>
						</div>
					{/if}

					<div class="flex gap-4">
						<Button type="button" onclick={calculate} class="flex-1">Hitung Zakat</Button>
					</div>

					{#if result}
						<div class="flex gap-4">
							<Button
								type="button"
								onclick={handleSave}
								loading={$isLoading}
								disabled={!result.wajibZakat}
								class="flex-1"
							>
								{result.wajibZakat ? 'Simpan Transaksi' : 'Tidak Wajib Zakat'}
							</Button>
							<Button variant="outline" type="button" onclick={resetForm}>Reset</Button>
						</div>
					{/if}
				</form>
			</Card>
		</div>
	{/if}
</div>
