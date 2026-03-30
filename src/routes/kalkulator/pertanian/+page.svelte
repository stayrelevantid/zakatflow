<script lang="ts">
	import { Card, Input, Button } from '$lib/components/ui';
	import { fly, fade } from 'svelte/transition';

	let metode = $state<'irigasi' | 'tadah'>('irigasi');
	const metodeId = 'metode-' + Math.random().toString(36).slice(2, 11);
</script>

<svelte:head>
	<title>Zakat Pertanian - ZakatFlow</title>
</svelte:head>

<div class="max-w-2xl mx-auto" transition:fade={{ duration: 300 }}>
	<a href="/kalkulator" class="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors">
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
		</svg>
		Kembali ke Kalkulator
	</a>

	<div class="mb-8" transition:fly={{ y: -20, duration: 500 }}>
		<h1 class="text-4xl font-display font-bold text-white mb-2">🌾 Zakat Pertanian</h1>
		<p class="text-white/60 text-lg">Hitung zakat dari hasil pertanian</p>
	</div>

	<Card class="p-8">
		<form class="space-y-6">
			<div>
				<Input label="Hasil Panen (kg)" type="number" placeholder="Masukkan hasil panen (kg)" min="0" />
			</div>

			<div>
				<Input label="Harga per Kg (Rp)" type="number" placeholder="Harga hasil panen per kg" min="0" />
			</div>

			<fieldset>
				<legend class="label mb-3">Metode Pengairan</legend>
				<div class="flex gap-4">
					<label for="{metodeId}-irigasi" class="flex items-center gap-2 cursor-pointer">
						<input type="radio" id="{metodeId}-irigasi" name="metode" class="w-4 h-4 text-primary-500" value="irigasi" bind:group={metode} />
						<span class="text-white">Irigasi (5%)</span>
					</label>
					<label for="{metodeId}-tadah" class="flex items-center gap-2 cursor-pointer">
						<input type="radio" id="{metodeId}-tadah" name="metode" class="w-4 h-4 text-primary-500" value="tadah" bind:group={metode} />
						<span class="text-white">Tadah Hujan (10%)</span>
					</label>
				</div>
			</fieldset>

			<div class="bg-white/5 rounded-xl p-4 border border-white/10">
				<h3 class="text-white font-semibold mb-2">Informasi Zakat Pertanian</h3>
				<ul class="text-white/60 text-sm space-y-1">
					<li>• Nisab: 653 kg gabah (~520 kg beras)</li>
					<li>• Kadar Zakat: 5% (irigasi) / 10% (tadah hujan)</li>
				</ul>
			</div>

			<div class="bg-primary-500/20 border border-primary-500/30 rounded-xl p-4">
				<p class="text-white/60 text-sm mb-1">Total Zakat Pertanian</p>
				<p class="text-3xl font-bold text-primary-400">Rp 0</p>
				<p class="text-white/40 text-xs mt-1">Hasil panen: 0 kg | Metode: {metode === 'irigasi' ? 'Irigasi (5%)' : 'Tadah Hujan (10%)'}</p>
			</div>

			<div class="flex gap-4">
				<Button type="submit" class="flex-1">Simpan Transaksi</Button>
				<Button variant="outline" type="button">Reset</Button>
			</div>
		</form>
	</Card>
</div>