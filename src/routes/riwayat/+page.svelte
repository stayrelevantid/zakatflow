<script lang="ts">
	import { Card } from '$lib/components/ui';
	import { fly, fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { transaksiStore, isLoading } from '$lib/stores/zakat';
	import { fetchAllTransaksi, deleteTransaksi } from '$lib/services/api';
	import type { TransaksiZakat } from '$lib/types/zakat';

	let transaksiList: TransaksiZakat[] = $state([]);
	let filterKategori = $state('');
	let filterStatus = $state('');
	let error = $state<string | null>(null);

	onMount(async () => {
		await loadTransaksi();
	});

	async function loadTransaksi() {
		try {
			const data = await fetchAllTransaksi();
			transaksiList = data;
			transaksiStore.set(data);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Terjadi kesalahan saat memuat data';
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return;

		try {
			await deleteTransaksi(id);
			transaksiList = transaksiList.filter(t => t.id !== id);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Terjadi kesalahan saat menghapus';
		}
	}

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(value);
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	const filteredList = $derived(transaksiList.filter(t => {
		if (filterKategori && t.kategori !== filterKategori) return false;
		if (filterStatus && t.status !== filterStatus) return false;
		return true;
	}));
</script>

<svelte:head>
	<title>Riwayat Pembayaran - ZakatFlow</title>
</svelte:head>

<div class="max-w-7xl mx-auto" transition:fade={{ duration: 400 }}>
	<div class="mb-8" transition:fly={{ y: -20, duration: 600 }}>
		<h1 class="text-4xl font-display font-bold text-white mb-2">📋 Riwayat Pembayaran</h1>
		<p class="text-white/60 text-lg">Daftar transaksi zakat yang telah tercatat</p>
	</div>

	{#if error}
		<div class="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
			<p class="text-red-400">{error}</p>
		</div>
	{/if}

	<div class="glass-card rounded-xl overflow-hidden" transition:fly={{ y: 20, duration: 500 }}>
		<div class="p-4 border-b border-white/10">
			<div class="flex flex-col md:flex-row gap-4">
				<div class="flex-1">
					<input
						type="text"
						placeholder="Cari transaksi..."
						class="glass-input w-full px-4 py-2 rounded-lg"
					/>
				</div>
				<div class="flex gap-2">
					<select bind:value={filterKategori} class="glass-input px-4 py-2 rounded-lg">
						<option value="">Semua Kategori</option>
						<option value="Zakat Fitrah">Zakat Fitrah</option>
						<option value="Zakat Emas">Zakat Emas/Perak</option>
						<option value="Zakat Penghasilan">Zakat Penghasilan</option>
						<option value="Zakat Perdagangan">Zakat Perdagangan</option>
						<option value="Zakat Pertanian">Zakat Pertanian</option>
						<option value="Zakat Peternakan">Zakat Peternakan</option>
						<option value="Zakat Perikanan">Zakat Perikanan</option>
					</select>
					<select bind:value={filterStatus} class="glass-input px-4 py-2 rounded-lg">
						<option value="">Semua Status</option>
						<option value="Sudah Bayar">Sudah Bayar</option>
						<option value="Belum Bayar">Belum Bayar</option>
					</select>
				</div>
			</div>
		</div>

		<div class="overflow-x-auto">
			{#if $isLoading}
				<div class="p-12 text-center">
					<div class="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
					<p class="text-white/60">Memuat data...</p>
				</div>
			{:else if filteredList.length === 0}
				<div class="p-12 text-center">
					<p class="text-4xl mb-2">📭</p>
					<p class="text-white/40">Belum ada transaksi tercatat</p>
					<p class="text-white/40 text-sm mt-2">Silakan hitung dan simpan zakat Anda</p>
				</div>
			{:else}
				<table class="w-full">
					<thead class="bg-white/5">
						<tr>
							<th class="px-4 py-3 text-left text-white/60 text-sm font-medium">Tanggal</th>
							<th class="px-4 py-3 text-left text-white/60 text-sm font-medium">Kategori</th>
							<th class="px-4 py-3 text-left text-white/60 text-sm font-medium">Nilai Harta</th>
							<th class="px-4 py-3 text-left text-white/60 text-sm font-medium">Zakat Wajib</th>
							<th class="px-4 py-3 text-left text-white/60 text-sm font-medium">Status</th>
							<th class="px-4 py-3 text-left text-white/60 text-sm font-medium">Aksi</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredList as transaksi}
							<tr class="border-t border-white/5 hover:bg-white/5 transition-colors">
								<td class="px-4 py-3 text-white">{formatDate(transaksi.tanggal)}</td>
								<td class="px-4 py-3 text-white">{transaksi.kategori}</td>
								<td class="px-4 py-3 text-white font-mono">{formatCurrency(transaksi.nilaiHarta)}</td>
								<td class="px-4 py-3 text-primary-400 font-mono">{formatCurrency(transaksi.zakatWajib)}</td>
								<td class="px-4 py-3">
									<span class="px-2 py-1 rounded-full text-xs {transaksi.status === 'Sudah Bayar' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}">
										{transaksi.status}
									</span>
								</td>
								<td class="px-4 py-3">
									<button
										onclick={() => handleDelete(transaksi.id)}
										class="text-red-400 hover:text-red-300 text-sm transition-colors"
									>
										Hapus
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</div>
</div>