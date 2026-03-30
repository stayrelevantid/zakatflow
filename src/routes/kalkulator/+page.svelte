<script lang="ts">
	import { Card } from '$lib/components/ui';
	import { fly, fade } from 'svelte/transition';
</script>

<svelte:head>
	<title>Kalkulator Zakat - ZakatFlow</title>
</svelte:head>

<div class="max-w-4xl mx-auto" transition:fade={{ duration: 400 }}>
	<div class="mb-8" transition:fly={{ y: -20, duration: 600 }}>
		<h1 class="text-4xl font-display font-bold text-white mb-2">🧮 Kalkulator Zakat</h1>
		<p class="text-white/60 text-lg">Pilih jenis zakat yang ingin dihitung</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		{#each [
			{ href: '/kalkulator/fitrah', title: 'Zakat Fitrah', icon: '🍚', desc: 'Zakat untuk berbuka puasa Ramadan' },
			{ href: '/kalkulator/emas', title: 'Zakat Emas/Perak', icon: '🥇', desc: 'Zakat atas harta emas dan perak' },
			{ href: '/kalkulator/penghasilan', title: 'Zakat Penghasilan', icon: '💵', desc: 'Zakat dari gaji atau penghasilan' },
			{ href: '/kalkulator/perdagangan', title: 'Zakat Perdagangan', icon: '🏪', desc: 'Zakat dari usaha perdagangan' },
			{ href: '/kalkulator/pertanian', title: 'Zakat Pertanian', icon: '🌾', desc: 'Zakat dari hasil pertanian' },
			{ href: '/kalkulator/kebun', title: 'Zakat Kebun/Ikan', icon: '🌴', desc: 'Zakat dari hasil kebun dan perikanan' }
		] as item, i}
			<div transition:fly={{ y: 30, delay: i * 60, duration: 500 }}>
				<a href={item.href} class="block group">
					<Card class="p-6 hover:border-primary-500/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
						<div class="flex items-start gap-4">
							<span class="text-4xl">{item.icon}</span>
							<div class="flex-1">
								<h3 class="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
									{item.title}
								</h3>
								<p class="text-white/50 text-sm mt-1">{item.desc}</p>
							</div>
							<svg class="w-5 h-5 text-white/40 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						</div>
					</Card>
				</a>
			</div>
		{/each}
	</div>
</div>