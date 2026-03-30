<script lang="ts">
	import { Card, Input, Button } from '$lib/components/ui';
	import { fly, fade } from 'svelte/transition';
</script>

<svelte:head>
	<title>Zakat Perdagangan - ZakatFlow</title>
</svelte:head>

<div class="max-w-2xl mx-auto" transition:fade={{ duration: 300 }}>
	<a href="/kalkulator" class="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors">
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
		</svg>
		Kembali ke Kalkulator
	</a>

	<div class="mb-8" transition:fly={{ y: -20, duration: 500 }}>
		<h1 class="text-4xl font-display font-bold text-white mb-2">🏪 Zakat Perdagangan</h1>
		<p class="text-white/60 text-lg">Hitung zakat dari usaha perdagangan</p>
	</div>

	<Card class="p-8">
		<form class="space-y-6">
			<div>
				<Input label="Modal Usaha (Rp)" type="number" placeholder="Modal usaha" min="0" />
			</div>

			<div>
				<Input label="Kas (Rp)" type="number" placeholder="Uang kas usaha" min="0" />
			</div>

			<div>
				<Input label="Piutang Lancar (Rp)" type="number" placeholder="Piutang yang bisa dicairkan" min="0" />
			</div>

			<div>
				<Input label="Hutang Jatuh Tempo (Rp)" type="number" placeholder="Hutang yang harus dibayar" min="0" />
			</div>

			<div>
				<Input label="Harga Emas per Gram (Rp)" type="number" placeholder="Harga emas saat ini" />
			</div>

			<div class="bg-white/5 rounded-xl p-4 border border-white/10">
				<h3 class="text-white font-semibold mb-2">Informasi Zakat Perdagangan</h3>
				<ul class="text-white/60 text-sm space-y-1">
					<li>• Nisab: Setara 85 gram emas</li>
					<li>• Kadar Zakat: 2,5%</li>
					<li>• Formula: Modal + Kas + Piutang - Hutang</li>
				</ul>
			</div>

			<div class="bg-primary-500/20 border border-primary-500/30 rounded-xl p-4">
				<p class="text-white/60 text-sm mb-1">Total Zakat Perdagangan</p>
				<p class="text-3xl font-bold text-primary-400">Rp 0</p>
				<p class="text-white/40 text-xs mt-1">Total harta dagang: Rp 0 | Nisab: Rp 0</p>
			</div>

			<div class="flex gap-4">
				<Button type="submit" class="flex-1">Simpan Transaksi</Button>
				<Button variant="outline" type="button">Reset</Button>
			</div>
		</form>
	</Card>
</div>