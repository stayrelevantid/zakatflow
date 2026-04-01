<script lang="ts">
	import { Card } from '$lib/components/ui';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import { fly, fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { transaksiStore, isLoading } from '$lib/stores/zakat';
	import { fetchAllTransaksi, deleteTransaksi, updateTransaksi } from '$lib/services/api';
	import type { TransaksiZakat } from '$lib/types/zakat';

	let transaksiList: TransaksiZakat[] = $state([]);
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

	let maintenanceStatus: {
		success: boolean;
		needsCleanup?: boolean;
		analysis?: any;
		message?: string;
	} | null = $state(null);
	let cleaning = $state(false);

	async function checkDataStatus() {
		try {
			const response = await fetch('/api/maintenance');
			maintenanceStatus = await response.json();
		} catch (e) {
			error = 'Gagal memeriksa status data';
		}
	}

	async function cleanupData() {
		if (
			!confirm('PERINGATAN: Tindakan ini akan menghapus data duplikat dan baris kosong. Lanjutkan?')
		)
			return;

		cleaning = true;
		try {
			const response = await fetch('/api/maintenance', { method: 'POST' });
			maintenanceStatus = await response.json();
			if (maintenanceStatus && maintenanceStatus.success) {
				await loadTransaksi();
			}
		} catch (e) {
			error = 'Gagal membersihkan data';
		} finally {
			cleaning = false;
		}
	}

	async function resetData() {
		const firstConfirm = confirm(
			'PERINGATAN: Semua data akan dihapus dan diganti dengan 15 transaksi contoh. Lanjutkan?'
		);
		if (!firstConfirm) return;

		const secondConfirm = prompt('Ketik "RESET" untuk mengkonfirmasi:');
		if (secondConfirm?.toUpperCase() !== 'RESET') return;

		cleaning = true;
		try {
			const response = await fetch('/api/maintenance/reset', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ confirm: 'RESET_ALL_DATA' })
			});
			const result = await response.json();
			if (result.success) {
				maintenanceStatus = { success: true, message: result.message };
				await loadTransaksi();
			} else {
				error = result.error || 'Gagal mereset data';
			}
		} catch (e) {
			error = 'Gagal mereset data';
		} finally {
			cleaning = false;
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return;

		try {
			await deleteTransaksi(id);
			transaksiList = transaksiList.filter((t) => t.id !== id);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Terjadi kesalahan saat menghapus';
		}
	}

	async function handleToggleStatus(transaksi: TransaksiZakat) {
		const newStatus = transaksi.status === 'Sudah Bayar' ? 'Belum Bayar' : 'Sudah Bayar';

		try {
			await updateTransaksi(transaksi.id, { status: newStatus });
			transaksiList = transaksiList.map((t) =>
				t.id === transaksi.id ? { ...t, status: newStatus } : t
			);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Terjadi kesalahan saat mengupdate status';
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

	<div class="glass-card rounded-xl overflow-hidden p-6" transition:fly={{ y: 20, duration: 500 }}>
		{#if $isLoading}
			<div class="p-12 text-center">
				<div
					class="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"
				></div>
				<p class="text-white/60">Memuat data...</p>
			</div>
		{:else if transaksiList.length === 0}
			<div class="p-12 text-center">
				<p class="text-4xl mb-2">📭</p>
				<p class="text-white/40">Belum ada transaksi tercatat</p>
				<p class="text-white/40 text-sm mt-2">Silakan hitung dan simpan zakat Anda</p>
			</div>
		{:else}
			<DataTable
				data={transaksiList}
				onToggleStatus={handleToggleStatus}
				onDelete={handleDelete}
				{formatCurrency}
				{formatDate}
			/>
		{/if}

		<!-- Maintenance Section -->
		<div class="mt-8 p-4 bg-white/5 rounded-xl">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-white font-semibold">🔧 Perbaikan Data</h3>
					<p class="text-white/60 text-sm">Periksa dan bersihkan data yang bermasalah</p>
				</div>
				<div class="flex gap-2">
					<button
						onclick={checkDataStatus}
						class="px-4 py-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded-lg text-sm transition-colors"
					>
						Periksa Data
					</button>
					{#if maintenanceStatus?.needsCleanup}
						<button
							onclick={cleanupData}
							disabled={cleaning}
							class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors disabled:opacity-50"
						>
							{cleaning ? 'Membersihkan...' : 'Bersihkan Data'}
						</button>
					{/if}
					<button
						onclick={resetData}
						disabled={cleaning}
						class="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-sm transition-colors disabled:opacity-50"
					>
						Reset Data
					</button>
				</div>
			</div>

			{#if maintenanceStatus}
				<div class="mt-4 p-4 bg-black/20 rounded-lg">
					{#if maintenanceStatus.analysis}
						<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
							<div class="text-center">
								<p class="text-2xl font-bold text-white">{maintenanceStatus.analysis.totalRows}</p>
								<p class="text-white/60 text-xs">Total Baris</p>
							</div>
							<div class="text-center">
								<p class="text-2xl font-bold text-green-400">
									{maintenanceStatus.analysis.validRows}
								</p>
								<p class="text-white/60 text-xs">Valid</p>
							</div>
							<div class="text-center">
								<p class="text-2xl font-bold text-yellow-400">
									{maintenanceStatus.analysis.emptyRows}
								</p>
								<p class="text-white/60 text-xs">Kosong</p>
							</div>
							<div class="text-center">
								<p class="text-2xl font-bold text-red-400">
									{maintenanceStatus.analysis.duplicateIds.length}
								</p>
								<p class="text-white/60 text-xs">Duplikat</p>
							</div>
						</div>

						{#if maintenanceStatus.analysis.sampleData.length > 0}
							<div class="mt-4">
								<p class="text-white/60 text-sm mb-2">Contoh Data:</p>
								<div class="space-y-1">
									{#each maintenanceStatus.analysis.sampleData as sample}
										<div class="flex gap-4 text-sm">
											<span class="text-white/40">Baris {sample.row}:</span>
											<span class="text-white">{sample.kategori}</span>
											<span class="text-white/60">({sample.status})</span>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					{/if}

					{#if maintenanceStatus.message}
						<p class="text-green-400 text-sm mt-4">{maintenanceStatus.message}</p>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
