<script lang="ts">
	import { Card, Input, Button } from '$lib/components/ui';
	import { fly, fade } from 'svelte/transition';
	import { isLoading } from '$lib/stores/zakat';
	import { createTransaksi } from '$lib/services/api';

	let gajiBulanan = $state<number>(0);
	let hargaEmas = $state<number>(1100000);
	let result = $state<{ nisabTahunan: number; penghasilanTahunan: number; wajibZakat: boolean; zakatWajib: number } | null>(null);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);

	function calculate() {
		error = null;
		
		if (gajiBulanan <= 0) {
			error = 'Gaji bulanan harus lebih dari 0';
			return;
		}
		
		if (hargaEmas <= 0) {
			error = 'Harga emas harus lebih dari 0';
			return;
		}

		const nisabTahunan = 85 * hargaEmas; // 85 gram emas
		const penghasilanTahunan = gajiBulanan * 12;
		const wajibZakat = penghasilanTahunan >= nisabTahunan;
		const zakatWajib = wajibZakat ? penghasilanTahunan * 0.025 : 0;
		
		result = { nisabTahunan, penghasilanTahunan, wajibZakat, zakatWajib };
	}

	async function handleSave() {
		if (!result) {
			error = 'Silakan hitung zakat terlebih dahulu';
			return;
		}

		try {
			await createTransaksi({
				kategori: 'Zakat Penghasilan',
				nilaiHarta: result.penghasilanTahunan,
				zakatWajib: result.zakatWajib,
				metode: '2.5% dari penghasilan tahunan',
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
		gajiBulanan = 0;
		hargaEmas = 1100000;
		result = null;
		error = null;
		success = null;
	}
</script>

<svelte:head>
	<title>Zakat Penghasilan - ZakatFlow</title>
</svelte:head>

<div class="max-w-2xl mx-auto" transition:fade={{ duration: 400 }}>
	<a href="/kalkulator" class="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors">
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
		</svg>
		Kembali ke Kalkulator
	</a>

	<div class="mb-8" transition:fly={{ y: -20, duration: 600 }}>
		<h1 class="text-4xl font-display font-bold text-white mb-2">💵 Zakat Penghasilan</h1>
		<p class="text-white/60 text-lg">Hitung zakat dari gaji atau penghasilan Anda</p>
	</div>

	<div transition:fly={{ y: 20, delay: 100, duration: 500 }}>
		<Card class="p-8">
			<form class="space-y-6">
				<div>
					<Input label="Gaji Bulanan (Rp)" type="number" placeholder="Masukkan gaji bulanan" bind:value={gajiBulanan} min="0" />
				</div>

				<div>
					<Input label="Harga Emas per Gram (Rp)" type="number" placeholder="Harga emas saat ini" bind:value={hargaEmas} min="1" />
					<p class="text-white/40 text-xs mt-1">Untuk menghitung nisab tahunan (default: Rp 1.100.000)</p>
				</div>

				<div class="bg-white/5 rounded-xl p-4 border border-white/10">
					<h3 class="text-white font-semibold mb-2">Informasi Zakat Penghasilan</h3>
					<ul class="text-white/60 text-sm space-y-1">
						<li>• Nisab: Setara 85 gram emas/tahun</li>
						<li>• Kadar Zakat: 2,5%</li>
						<li>• Dihitung dari penghasilan tahunan</li>
					</ul>
				</div>

				{#if result}
					<div class="bg-primary-500/20 border border-primary-500/30 rounded-xl p-4">
						<p class="text-white/60 text-sm mb-1">Total Zakat Penghasilan</p>
						<p class="text-3xl font-bold text-primary-400">{formatCurrency(result.zakatWajib)}</p>
						<div class="mt-2 text-white/40 text-xs space-y-1">
							<p>Penghasilan tahunan: {formatCurrency(result.penghasilanTahunan)}</p>
							<p>Nisab: {formatCurrency(result.nisabTahunan)}</p>
							<p class="{result.wajibZakat ? 'text-green-400' : 'text-yellow-400'}">
								{result.wajibZakat ? '✓ Wajib zakat' : '✗ Belum mencapai nisab'}
							</p>
						</div>
					</div>
				{:else}
					<div class="bg-white/5 border border-white/10 rounded-xl p-4">
						<p class="text-white/40 text-sm">Klik "Hitung Zakat" untuk melihat hasil perhitungan</p>
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