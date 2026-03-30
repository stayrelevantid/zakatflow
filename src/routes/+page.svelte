<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { fly, fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { fetchAllTransaksi } from '$lib/services/api';

	type Transaksi = {
		id: string;
		tanggal: string;
		kategori: string;
		nilaiHarta: number;
		zakatWajib: number;
		metode: string;
		status: string;
		catatan?: string;
	};

	let transaksi = $state<Transaksi[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	// Stats
	let totalZakat = $state(0);
	let sudahBayar = $state(0);
	let belumBayar = $state(0);
	let jumlahTransaksi = $state(0);

	onMount(async () => {
		try {
			const data = await getAllTransaksi();
			transaksi = data;
			
			// Calculate stats
			jumlahTransaksi = data.length;
			totalZakat = data.reduce((sum, t) => sum + t.zakatWajib, 0);
			sudahBayar = data.filter(t => t.status === 'Sudah Bayar').reduce((sum, t) => sum + t.zakatWajib, 0);
			belumBayar = data.filter(t => t.status === 'Belum Bayar').reduce((sum, t) => sum + t.zakatWajib, 0);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Gagal memuat data';
		} finally {
			loading = false;
		}
	});

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
			month: 'short',
			year: 'numeric'
		});
	}

	function getStatusColor(status: string): string {
		return status === 'Sudah Bayar' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400';
	}

	function getCategoryIcon(kategori: string): string {
		const icons: Record<string, string> = {
			'Zakat Fitrah': '🍚',
			'Zakat Emas': '🪙',
			'Zakat Perak': '🥈',
			'Zakat Penghasilan': '💰',
			'Zakat Perdagangan': '🏪',
			'Zakat Pertanian': '🌾',
			'Zakat Peternakan': '🐄',
			'Zakat Perikanan': '🐟'
		};
		return icons[kategori] || '📋';
	}
</script>

<svelte:head>
	<title>Dashboard - ZakatFlow</title>
</svelte:head>

<div class="max-w-7xl mx-auto" transition:fade={{ duration: 400 }}>
	<div class="mb-8">
		<h1 class="text-4xl font-display font-bold text-white mb-2" transition:fly={{ y: -20, duration: 600 }}>
			🕌 Dashboard Zakat
		</h1>
		<p class="text-white/60 text-lg">Kelola dan pantau pembayaran zakat Anda</p>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
		</div>
	{:else if error}
		<div class="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
			<p class="text-red-400">{error}</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
			{#each [
				{ title: 'Total Zakat', value: formatCurrency(totalZakat), icon: '💰', color: 'primary' },
				{ title: 'Sudah Bayar', value: formatCurrency(sudahBayar), icon: '✅', color: 'green' },
				{ title: 'Belum Bayar', value: formatCurrency(belumBayar), icon: '⏳', color: 'yellow' },
				{ title: 'Transaksi', value: jumlahTransaksi.toString(), icon: '📋', color: 'blue' }
			] as stat, i}
				<div transition:fly={{ y: 30, delay: i * 80, duration: 500 }}>
					<Card class="p-6">
						<div class="flex items-center justify-between mb-2">
							<span class="text-3xl">{stat.icon}</span>
						</div>
						<p class="text-white/60 text-sm mb-1">{stat.title}</p>
						<p class="text-2xl font-bold text-white">{stat.value}</p>
					</Card>
				</div>
			{/each}
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div class="lg:col-span-2" transition:fly={{ y: 20, delay: 400, duration: 500 }}>
				<Card class="p-6">
					<h2 class="text-xl font-display font-semibold text-white mb-4">📊 Ringkasan per Kategori</h2>
					{#if transaksi.length === 0}
						<div class="h-64 flex items-center justify-center border border-dashed border-white/20 rounded-xl">
							<p class="text-white/40">Belum ada transaksi</p>
						</div>
					{:else}
						<div class="space-y-3">
							{#each Object.entries(transaksi.reduce((acc, t) => {
								acc[t.kategori] = (acc[t.kategori] || 0) + t.zakatWajib;
								return acc;
							}, {} as Record<string, number>)).sort((a, b) => b[1] - a[1]) as [string, number]}
								<div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
									<div class="flex items-center gap-3">
										<span class="text-xl">{getCategoryIcon(kategori)}</span>
										<span class="text-white">{kategori}</span>
									</div>
									<span class="text-white font-semibold">{formatCurrency(zakatWajib)}</span>
								</div>
							{/each}
						</div>
					{/if}
				</Card>
			</div>

			<div transition:fly={{ y: 20, delay: 500, duration: 500 }}>
				<Card class="p-6">
					<h2 class="text-xl font-display font-semibold text-white mb-4">⚡ Aksi Cepat</h2>
					<div class="space-y-3">
						<a href="/kalkulator" class="block">
							<Button variant="default" class="w-full">
								<span class="mr-2">🧮</span> Hitung Zakat
							</Button>
						</a>
						<a href="/riwayat" class="block">
							<Button variant="secondary" class="w-full">
								<span class="mr-2">📋</span> Lihat Riwayat
							</Button>
						</a>
						<a href="/referensi" class="block">
							<Button variant="outline" class="w-full">
								<span class="mr-2">💰</span> Referensi Harga
							</Button>
						</a>
					</div>
				</Card>
			</div>
		</div>

		<div class="mt-6" transition:fly={{ y: 20, delay: 600, duration: 500 }}>
			<Card class="p-6">
				<h2 class="text-xl font-display font-semibold text-white mb-4">📜 Transaksi Terakhir</h2>
				{#if transaksi.length === 0}
					<div class="h-48 flex items-center justify-center border border-dashed border-white/20 rounded-xl">
						<p class="text-white/40">Belum ada transaksi</p>
					</div>
				{:else}
					<div class="overflow-x-auto">
						<table class="w-full">
							<thead>
								<tr class="text-white/60 text-sm border-b border-white/10">
									<th class="text-left py-3 px-2">Tanggal</th>
									<th class="text-left py-3 px-2">Kategori</th>
									<th class="text-right py-3 px-2">Nilai Harta</th>
									<th class="text-right py-3 px-2">Zakat</th>
									<th class="text-center py-3 px-2">Status</th>
								</tr>
							</thead>
							<tbody>
								{#each transaksi.slice(0, 5) as t}
									<tr class="text-white border-b border-white/5 hover:bg-white/5">
										<td class="py-3 px-2 text-sm">{formatDate(t.tanggal)}</td>
										<td class="py-3 px-2">
											<div class="flex items-center gap-2">
												<span>{getCategoryIcon(t.kategori)}</span>
												<span class="text-sm">{t.kategori}</span>
											</div>
										</td>
										<td class="py-3 px-2 text-right text-sm">{formatCurrency(t.nilaiHarta)}</td>
										<td class="py-3 px-2 text-right text-sm font-semibold text-primary-400">{formatCurrency(t.zakatWajib)}</td>
										<td class="py-3 px-2 text-center">
											<span class="px-2 py-1 rounded-full text-xs {getStatusColor(t.status)}">
												{t.status}
											</span>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					{#if transaksi.length > 5}
						<div class="mt-4 text-center">
							<a href="/riwayat" class="text-primary-400 hover:text-primary-300 text-sm">
								Lihat semua transaksi →
							</a>
						</div>
					{/if}
				{/if}
			</Card>
		</div>
	{/if}
</div>