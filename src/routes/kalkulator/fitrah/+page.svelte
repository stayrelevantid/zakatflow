<script lang="ts">
	import { Card, Input, Button } from '$lib/components/ui';
	import { fly, fade } from 'svelte/transition';
</script>

<svelte:head>
	<title>Zakat Fitrah - ZakatFlow</title>
</svelte:head>

<div class="max-w-2xl mx-auto" transition:fade={{ duration: 400 }}>
	<a href="/kalkulator" class="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors">
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
					<Input label="Jumlah Jiwa" type="number" placeholder="Masukkan jumlah jiwa" min="1" />
					<p class="text-white/40 text-xs mt-1">Jumlah anggota keluarga yang wajib zakat fitrah</p>
				</div>

				<div>
					<Input label="Harga Beras per Kg (Rp)" type="number" placeholder="Masukkan harga beras" />
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

				<div class="bg-primary-500/20 border border-primary-500/30 rounded-xl p-4">
					<p class="text-white/60 text-sm mb-1">Total Zakat Fitrah</p>
					<p class="text-3xl font-bold text-primary-400">Rp 0</p>
					<p class="text-white/40 text-xs mt-1">= 0 jiwa × 2,5 kg × Rp 0/kg</p>
				</div>

				<div class="flex gap-4">
					<Button type="submit" class="flex-1">Simpan Transaksi</Button>
					<Button variant="outline" type="button">Reset</Button>
				</div>
			</form>
		</Card>
	</div>
</div>