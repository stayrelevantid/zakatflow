<script lang="ts">
	import { Card, Input, Button } from '$lib/components/ui';
	import { fly, fade } from 'svelte/transition';
	import { isLoading } from '$lib/stores/zakat';
	import { createTransaksi } from '$lib/services/api';
	import { goto } from '$app/navigation';

	let hasilPanen = $state<number>(0);
	let hargaPerKg = $state<number>(0);
	let metodeIrigasi = $state<boolean>(true);
	let result = $state<{
		nilaiHarta: number;
		nisab: number;
		wajibZakat: boolean;
		zakatWajib: number;
		kadar: string;
	} | null>(null);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);

	// Nisab pertanian: 653 kg gabah (setara dengan sekitar 520 kg beras)
	const nisabKg = 653;

	function calculate() {
		error = null;

		if (hasilPanen <= 0) {
			error = 'Hasil panen harus lebih dari 0';
			return;
		}

		if (hargaPerKg <= 0) {
			error = 'Harga per kg harus lebih dari 0';
			return;
		}

		const nilaiHarta = hasilPanen * hargaPerKg;
		const wajibZakat = hasilPanen >= nisabKg;
		const kadar = metodeIrigasi ? 0.05 : 0.1; // 5% untuk irigasi, 10% untuk tadah hujan
		const zakatWajib = wajibZakat ? nilaiHarta * kadar : 0;

		result = {
			nilaiHarta,
			nisab: nisabKg,
			wajibZakat,
			zakatWajib,
			kadar: metodeIrigasi ? '5%' : '10%'
		};
	}

	async function handleSave() {
		if (!result) {
			error = 'Silakan hitung zakat terlebih dahulu';
			return;
		}

		try {
			await createTransaksi({
				kategori: 'Zakat Pertanian',
				nilaiHarta: result.nilaiHarta,
				zakatWajib: result.zakatWajib,
				metode: `${result.kadar} dari hasil panen (${metodeIrigasi ? 'Irigasi' : 'Tadah Hujan'})`,
				status: 'Belum Bayar',
				catatan: `${hasilPanen} kg × Rp ${hargaPerKg.toLocaleString('id-ID')}/kg`
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
		hasilPanen = 0;
		hargaPerKg = 0;
		metodeIrigasi = true;
		result = null;
		error = null;
		success = null;
	}
</script>

<svelte:head>
	<title>Zakat Pertanian - ZakatFlow</title>
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
		<h1 class="text-4xl font-display font-bold text-white mb-2">🌾 Zakat Pertanian</h1>
		<p class="text-white/60 text-lg">Hitung zakat dari hasil pertanian</p>
	</div>

	<div transition:fly={{ y: 20, delay: 100, duration: 500 }}>
		<Card class="p-8">
			<form class="space-y-6">
				<div>
					<Input
						label="Hasil Panen (kg)"
						type="number"
						placeholder="Masukkan hasil panen (kg)"
						bind:value={hasilPanen}
						min="0"
					/>
				</div>

				<div>
					<Input
						label="Harga per Kg (Rp)"
						type="number"
						placeholder="Harga hasil panen per kg"
						bind:value={hargaPerKg}
						min="0"
					/>
				</div>

				<fieldset>
					<legend class="label mb-3">Metode Pengairan</legend>
					<div class="flex gap-4">
						<label class="flex items-center gap-2 cursor-pointer">
							<input type="radio" bind:group={metodeIrigasi} value={true} class="w-4 h-4" />
							<span class="text-white">Irigasi (5%)</span>
						</label>
						<label class="flex items-center gap-2 cursor-pointer">
							<input type="radio" bind:group={metodeIrigasi} value={false} class="w-4 h-4" />
							<span class="text-white">Tadah Hujan (10%)</span>
						</label>
					</div>
				</fieldset>

				<div class="bg-white/5 rounded-xl p-4 border border-white/10">
					<h3 class="text-white font-semibold mb-2">Informasi Zakat Pertanian</h3>
					<ul class="text-white/60 text-sm space-y-1">
						<li>• Nisab: 653 kg gabah (~520 kg beras)</li>
						<li>• Kadar Zakat: 5% (irigasi) / 10% (tadah hujan)</li>
					</ul>
				</div>

				{#if result}
					<div class="bg-primary-500/20 border border-primary-500/30 rounded-xl p-4">
						<p class="text-white/60 text-sm mb-1">Total Zakat Pertanian</p>
						<p class="text-3xl font-bold text-primary-400">{formatCurrency(result.zakatWajib)}</p>
						<div class="mt-2 text-white/40 text-xs space-y-1">
							<p>Hasil panen: {hasilPanen} kg</p>
							<p>Nilai harta: {formatCurrency(result.nilaiHarta)}</p>
							<p>Nisab: {result.nisab} kg</p>
							<p>Metode: {metodeIrigasi ? 'Irigasi (5%)' : 'Tadah Hujan (10%)'}</p>
							<p class={result.wajibZakat ? 'text-green-400' : 'text-yellow-400'}>
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
</div>
