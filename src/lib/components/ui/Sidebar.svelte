<script lang="ts">
	import { page } from '$app/state';
	import { cn } from '$lib/utils';

	const kalkulatorItems = [
		{ href: '/kalkulator/fitrah', label: 'Zakat Fitrah', icon: '🍚' },
		{ href: '/kalkulator/emas', label: 'Zakat Emas/Perak', icon: '🥇' },
		{ href: '/kalkulator/penghasilan', label: 'Zakat Penghasilan', icon: '💵' },
		{ href: '/kalkulator/perdagangan', label: 'Zakat Perdagangan', icon: '🏪' },
		{ href: '/kalkulator/pertanian', label: 'Zakat Pertanian', icon: '🌾' },
		{ href: '/kalkulator/peternakan', label: 'Zakat Peternakan/Perikanan', icon: '🐄' }
	];

	let isOpen = $state(true);
</script>

<aside
	class={cn(
		'fixed left-0 top-16 bottom-0 w-64 glass-card border-r border-white/10 transition-transform duration-300',
		!isOpen && '-translate-x-full'
	)}
>
	<div class="p-4">
		<button onclick={() => (isOpen = !isOpen)} class="text-white/70 hover:text-white mb-4">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				{#if isOpen}
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
				{:else}
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
				{/if}
			</svg>
		</button>

		<h3 class="text-white/50 text-xs uppercase tracking-wider mb-3">Menu Kalkulator</h3>
		<nav class="space-y-1">
			{#each kalkulatorItems as item}
				<a
					href={item.href}
					class={cn(
						'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
						page.url.pathname === item.href
							? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
							: 'text-white/70 hover:text-white hover:bg-white/5'
					)}
				>
					<span>{item.icon}</span>
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>
	</div>
</aside>