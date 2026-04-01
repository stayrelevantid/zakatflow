<script lang="ts">
	import { Card, Input, Button } from '$lib/components/ui';
	import { fly, fade } from 'svelte/transition';
	import { isLoading } from '$lib/stores/zakat';
	import { createTransaksi } from '$lib/services/api';
	import { goto } from '$app/navigation';

	let modalUsaha = $state<number>(0);
	let kas = $state<number>(0);
	let piutangLancar = $state<number>(0);
	let hutangJatuhTempo = $state<number>(0);
	let hargaEmas = $state<number>(1100000);
	let result = $state<{
		totalHarta: number;
		nilaiHarta: number;
		nisab: number;
		wajibZakat: boolean;
		zakatWajib: number;
	} | null>(null);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);

	function calculate() {
		error = null;

		const totalHarta = modalUsaha + kas + piutangLancar;
		const nilaiHarta = totalHarta - hutangJatuhTempo;
		const nisab = 85 * hargaEmas;
		const wajibZakat = nilaiHarta >= nisab;
		const zakatWajib = wajibZakat ? nilaiHarta * 0.025 : 0;

		result = { totalHarta, nilaiHarta, nisab, wajibZakat, zakatWajib };
	}

	async function handleSave() {
		if (!result) {
			error = 'Silakan hitung zakat terlebih dahulu';
			return;
		}

		try {
			await createTransaksi({
				kategori: 'Zakat Perdagangan',
				nilaiHarta: result.nilaiHarta,
				zakatWajib: result.zakatWajib,
				metode: '2.5% dari (Modal + Kas + Piutang - Hutang)',
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
		modalUsaha = 0;
		kas = 0;
		piutangLancar = 0;
		hutangJatuhTempo = 0;
		hargaEmas = 1100000;
		result = null;
		error = null;
		success = null;
	}
</script>

<svelte:head>
	<title>Zakat Perdagangan - ZakatFlow</title>
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
		<h1 class="text-4xl font-display font-bold text-white mb-2">🏪 Zakat Perdagangan</h1>
		<p class="text-white/60 text-lg">Hitung zakat dari usaha perdagangan</p>
	</div>

	<div transition:fly={{ y: 20, delay: 100, duration: 500 }}>
		<Card class="p-8">
			<form class="space-y-6">
				<div>
					<Input
						label="Modal Usaha (Rp)"
						type="number"
						placeholder="Modal usaha"
						bind:value={modalUsaha}
						min="0"
					/>
				</div>

				<div>
					<Input
						label="Kas (Rp)"
						type="number"
						placeholder="Uang kas usaha"
						bind:value={kas}
						min="0"
					/>
				</div>

				<div>
					<Input
						label="Piutang Lancar (Rp)"
						type="number"
						placeholder="Piutang yang bisa dicairkan"
						bind:value={piutangLancar}
						min="0"
					/>
				</div>

				<div>
					<Input
						label="Hutang Jatuh Tempo (Rp)"
						type="number"
						placeholder="Hutang yang harus dibayar"
						bind:value={hutangJatuhTempo}
						min="0"
					/>
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

				<div class="bg-white/5 rounded-xl p-4 border border-white/10">
					<h3 class="text-white font-semibold mb-2">Informasi Zakat Perdagangan</h3>
					<ul class="text-white/60 text-sm space-y-1">
						<li>• Nisab: Setara 85 gram emas</li>
						<li>• Kadar Zakat: 2,5%</li>
						<li>• Formula: Modal + Kas + Piutang - Hutang</li>
					</ul>
				</div>

				{#if result}
					<div class="bg-primary-500/20 border border-primary-500/30 rounded-xl p-4">
						<p class="text-white/60 text-sm mb-1">Total Zakat Perdagangan</p>
						<p class="text-3xl font-bold text-primary-400">{formatCurrency(result.zakatWajib)}</p>
						<div class="mt-2 text-white/40 text-xs space-y-1">
							<p>Total harta dagang: {formatCurrency(result.totalHarta)}</p>
							<p>Nilai harta (setelah hutang): {formatCurrency(result.nilaiHarta)}</p>
							<p>Nisab: {formatCurrency(result.nisab)}</p>
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
