<script lang="ts">
	import { Card, Button } from '$lib/components/ui';
	import { fly, fade } from 'svelte/transition';
</script>

<svelte:head>
	<title>Referensi Harga - ZakatFlow</title>
</svelte:head>

<div class="max-w-7xl mx-auto" transition:fade={{ duration: 400 }}>
	<div class="mb-8" transition:fly={{ y: -20, duration: 600 }}>
		<h1 class="text-4xl font-display font-bold text-white mb-2">💰 Referensi Harga</h1>
		<p class="text-white/60 text-lg">Harga referensi untuk kalkulasi zakat</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
		{#each [
			{ jenis: 'Emas', harga: 'Rp 1.100.000', satuan: 'per gram', update: '30 Mar 2026' },
			{ jenis: 'Perak', harga: 'Rp 15.000', satuan: 'per gram', update: '30 Mar 2026' },
			{ jenis: 'Beras', harga: 'Rp 15.000', satuan: 'per kg', update: '30 Mar 2026' }
		] as item, i}
			<div transition:fly={{ y: 20, delay: i * 100, duration: 500 }}>
				<Card class="p-6">
					<div class="flex items-center justify-between mb-4">
						<span class="text-3xl">
							{#if item.jenis === 'Emas'}🥇{:else if item.jenis === 'Perak'}🥈{:else}🍚{/if}
						</span>
						<span class="text-xs text-white/40">Update: {item.update}</span>
					</div>
					<h3 class="text-lg font-semibold text-white mb-1">{item.jenis}</h3>
					<p class="text-2xl font-bold text-primary-400 mb-1">{item.harga}</p>
					<p class="text-white/40 text-sm">{item.satuan}</p>
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
						{#each [
							{ jenis: 'Emas', harga: 1100000, satuan: 'gram', update: '30 Mar 2026' },
							{ jenis: 'Perak', harga: 15000, satuan: 'gram', update: '30 Mar 2026' },
							{ jenis: 'Beras', harga: 15000, satuan: 'kg', update: '30 Mar 2026' }
						] as item}
							<tr class="border-t border-white/5 hover:bg-white/5 transition-colors">
								<td class="px-4 py-3 text-white">{item.jenis}</td>
								<td class="px-4 py-3 text-white font-mono">Rp {item.harga.toLocaleString('id-ID')}</td>
								<td class="px-4 py-3 text-white/60">{item.satuan}</td>
								<td class="px-4 py-3 text-white/60">{item.update}</td>
								<td class="px-4 py-3">
									<Button variant="ghost" size="sm">Edit</Button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Card>
	</div>
</div>