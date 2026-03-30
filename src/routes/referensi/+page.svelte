<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { fly, fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { fetchAllReferensi, updateReferensi } from '$lib/services/api';
	import { isLoading } from '$lib/stores/zakat';
	import type { ReferensiHarga } from '$lib/types/zakat';

	let referensiList: ReferensiHarga[] = $state([]);
	let editingJenis: string | null = $state(null);
	let editValue: number = $state(0);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);

	onMount(async () => {
		await loadReferensi();
	});

	async function loadReferensi() {
		try {
			const data = await fetchAllReferensi();
			referensiList = data;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Terjadi kesalahan saat memuat data';
		}
	}

	function startEdit(jenis: string, currentValue: number) {
		editingJenis = jenis;
		editValue = currentValue;
	}

	function cancelEdit() {
		editingJenis = null;
		editValue = 0;
	}

	async function saveEdit() {
		if (!editingJenis) return;

		try {
			await updateReferensi(editingJenis, editValue);
			referensiList = referensiList.map(r =>
				r.jenis === editingJenis
					? { ...r, hargaPerUnit: editValue, terakhirUpdate: new Date().toISOString().split('T')[0] }
					: r
			);
			editingJenis = null;
			editValue = 0;
			success = 'Referensi harga berhasil diperbarui!';
			setTimeout(() => { success = null; }, 3000);
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

	function getIcon(jenis: string): string {
		switch (jenis.toLowerCase()) {
			case 'emas': return '🥇';
			case 'perak': return '🥈';
			case 'beras': return '🍚';
			default: return '💰';
		}
	}
</script>

<svelte:head>
	<title>Referensi Harga - ZakatFlow</title>
</svelte:head>

<div class="max-w-7xl mx-auto" transition:fade={{ duration: 400 }}>
	<div class="mb-8" transition:fly={{ y: -20, duration: 600 }}>
		<h1 class="text-4xl font-display font-bold text-white mb-2">💰 Referensi Harga</h1>
		<p class="text-white/60 text-lg">Harga referensi untuk kalkulasi zakat. Berlaku secara global.</p>
	</div>

	{#if error}
		<div class="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
			<p class="text-red-400">{error}</p>
		</div>
	{/if}

	{#if success}
		<div class="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
			<p class="text-green-400">{success}</p>
		</div>
	{/if}

	{#if $isLoading}
		<div class="p-12 text-center">
			<div class="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
			<p class="text-white/60">Memuat data...</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
			{#each referensiList as item, i}
				<div transition:fly={{ y: 20, delay: i * 100, duration: 500 }}>
					<Card class="p-6">
						<div class="flex items-center justify-between mb-4">
							<span class="text-3xl">{getIcon(item.jenis)}</span>
							<span class="text-xs text-white/40">Update: {item.terakhirUpdate}</span>
						</div>
						<h3 class="text-lg font-semibold text-white mb-1">{item.jenis}</h3>
						{#if editingJenis === item.jenis}
							<div class="mt-2">
								<input
									type="number"
									bind:value={editValue}
									class="glass-input w-full px-3 py-2 rounded-lg text-white"
								/>
								<div class="flex gap-2 mt-2">
									<Button size="sm" onclick={saveEdit}>Simpan</Button>
									<Button size="sm" variant="outline" onclick={cancelEdit}>Batal</Button>
								</div>
							</div>
						{:else}
							<p class="text-2xl font-bold text-primary-400 mb-1">{formatCurrency(item.hargaPerUnit)}</p>
							<p class="text-white/40 text-sm">per {item.satuan}</p>
							<Button size="sm" variant="outline" class="mt-4" onclick={() => startEdit(item.jenis, item.hargaPerUnit)}>
								Edit Harga
							</Button>
						{/if}
					</Card>
				</div>
			{/each}
		</div>

		<div transition:fly={{ y: 20, duration: 500 }}>
			<Card class="p-6">
				<h2 class="text-xl font-display font-semibold text-white mb-4">📝 Daftar Referensi</h2>
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead class="bg-white/5">
							<tr>
								<th class="px-4 py-3 text-left text-white/60 text-sm font-medium">Jenis</th>
								<th class="px-4 py-3 text-left text-white/60 text-sm font-medium">Harga per Unit</th>
								<th class="px-4 py-3 text-left text-white/60 text-sm font-medium">Satuan</th>
								<th class="px-4 py-3 text-left text-white/60 text-sm font-medium">Terakhir Update</th>
								<th class="px-4 py-3 text-left text-white/60 text-sm font-medium">Aksi</th>
							</tr>
						</thead>
						<tbody>
							{#each referensiList as item}
								<tr class="border-t border-white/5 hover:bg-white/5 transition-colors">
									<td class="px-4 py-3 text-white">{item.jenis}</td>
									<td class="px-4 py-3 text-white font-mono">{formatCurrency(item.hargaPerUnit)}</td>
									<td class="px-4 py-3 text-white/60">{item.satuan}</td>
									<td class="px-4 py-3 text-white/60">{item.terakhirUpdate}</td>
									<td class="px-4 py-3">
										<Button size="sm" variant="ghost" onclick={() => startEdit(item.jenis, item.hargaPerUnit)}>
											Edit
										</Button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	{/if}
</div>