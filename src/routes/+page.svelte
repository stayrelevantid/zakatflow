<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { fly, fade } from 'svelte/transition';
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

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
		{#each [
			{ title: 'Total Zakat', value: 'Rp 0', icon: '💰', color: 'primary' },
			{ title: 'Sudah Bayar', value: 'Rp 0', icon: '✅', color: 'green' },
			{ title: 'Belum Bayar', value: 'Rp 0', icon: '⏳', color: 'yellow' },
			{ title: 'Transaksi', value: '0', icon: '📋', color: 'blue' }
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
				<h2 class="text-xl font-display font-semibold text-white mb-4">📊 Ringkasan Zakat</h2>
				<div class="h-64 flex items-center justify-center border border-dashed border-white/20 rounded-xl">
					<p class="text-white/40">Chart akan ditampilkan di sini</p>
				</div>
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
			<div class="h-48 flex items-center justify-center border border-dashed border-white/20 rounded-xl">
				<p class="text-white/40">Tabel transaksi akan ditampilkan di sini</p>
			</div>
		</Card>
	</div>
</div>