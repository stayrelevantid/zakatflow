<script lang="ts">
	import { Card, Input, Button } from '$lib/components/ui';
	import { fly, fade } from 'svelte/transition';
	import { isLoading } from '$lib/stores/zakat';
	import { createTransaksi } from '$lib/services/api';
	import { goto } from '$app/navigation';

	let jumlahJiwa = $state<number>(0);
	let hargaBeras = $state<number>(15000);
	let result = $state<{ zakatWajib: number; jumlahBeras: number } | null>(null);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);

	function calculate() {
		error = null;

		if (jumlahJiwa <= 0) {
			error = 'Jumlah jiwa harus lebih dari 0';
			return;
		}

		if (hargaBeras <= 0) {
			error = 'Harga beras harus lebih dari 0';
			return;
		}

		const jumlahBeras = jumlahJiwa * 2.5; // 2.5 kg per jiwa
		const zakatWajib = jumlahBeras * hargaBeras;

		result = { zakatWajib, jumlahBeras };
	}

	async function handleSave() {
		if (!result) {
			error = 'Silakan hitung zakat terlebih dahulu';
			return;
		}

		try {
			await createTransaksi({
				kategori: 'Zakat Fitrah',
				nilaiHarta: result.zakatWajib,
				zakatWajib: result.zakatWajib,
				metode: `${jumlahJiwa} jiwa × 2.5 kg × Rp ${hargaBeras.toLocaleString('id-ID')}/kg`,
				status: 'Belum Bayar',
				catatan: ''
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
		jumlahJiwa = 0;
		hargaBeras = 15000;
		result = null;
		error = null;
		success = null;
	}
</script>

<svelte:head>
	<title>Zakat Fitrah - ZakatFlow</title>
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
		<h1 class="text-4xl font-display font-bold text-white mb-2">🍚 Zakat Fitrah</h1>
		<p class="text-white/60 text-lg">Hitung zakat fitrah untuk Anda dan keluarga</p>
	</div>

	<div transition:fly={{ y: 20, delay: 100, duration: 500 }}>
		<Card class="p-8">
			<form class="space-y-6">
				<div>
					<Input
						label="Jumlah Jiwa"
						type="number"
						placeholder="Masukkan jumlah jiwa"
						bind:value={jumlahJiwa}
						min="1"
					/>
					<p class="text-white/40 text-xs mt-1">Jumlah anggota keluarga yang wajib zakat fitrah</p>
				</div>

				<div>
					<Input
						label="Harga Beras per Kg (Rp)"
						type="number"
						placeholder="Masukkan harga beras"
						bind:value={hargaBeras}
						min="1"
					/>
					<p class="text-white/40 text-xs mt-1">Harga beras di daerah Anda</p>
				</div>

				<div class="bg-white/5 rounded-xl p-4 border border-white/10">
					<h3 class="text-white font-semibold mb-2">Informasi Zakat Fitrah</h3>
					<ul class="text-white/60 text-sm space-y-1">
						<li>• Nisab: Per jiwa</li>
						<li>• Kadar Zakat: 2,5 kg beras</li>
						<li>• Atau setara: 3,5 liter beras</li>
					</ul>
				</div>

				{#if result}
					<div class="bg-primary-500/20 border border-primary-500/30 rounded-xl p-4">
						<p class="text-white/60 text-sm mb-1">Total Zakat Fitrah</p>
						<p class="text-3xl font-bold text-primary-400">{formatCurrency(result.zakatWajib)}</p>
						<p class="text-white/40 text-xs mt-1">= {result.jumlahBeras.toFixed(1)} kg beras</p>
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
						<Button type="button" onclick={handleSave} loading={$isLoading} class="flex-1"
							>Simpan Transaksi</Button
						>
						<Button variant="outline" type="button" onclick={resetForm}>Reset</Button>
					</div>
				{/if}
			</form>
		</Card>
	</div>
</div>
