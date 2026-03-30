<script lang="ts">
	import { page } from '$app/state';
	import { cn } from '$lib/utils';
	import Button from './Button.svelte';

	const navItems = [
		{ href: '/', label: 'Dashboard', icon: '📊' },
		{ href: '/kalkulator', label: 'Kalkulator', icon: '🧮' },
		{ href: '/riwayat', label: 'Riwayat', icon: '📋' },
		{ href: '/referensi', label: 'Referensi', icon: '💰' }
	];

	let mobileMenuOpen = $state(false);
</script>

<nav class="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<div class="flex items-center gap-2">
				<span class="text-2xl">🕌</span>
				<span class="font-display font-bold text-xl text-white">ZakatFlow</span>
			</div>

			<div class="hidden md:flex items-center gap-1">
				{#each navItems as item}
					<a
						href={item.href}
						class={cn(
							'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
							page.url.pathname === item.href
								? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
								: 'text-white/70 hover:text-white hover:bg-white/5'
						)}
					>
						<span class="mr-2">{item.icon}</span>
						{item.label}
					</a>
				{/each}
			</div>

			<button
				class="md:hidden text-white p-2"
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				aria-label="Toggle menu"
			>
				{#if mobileMenuOpen}
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				{:else}
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				{/if}
			</button>
		</div>

		{#if mobileMenuOpen}
			<div class="md:hidden py-4 space-y-2">
				{#each navItems as item}
					<a
						href={item.href}
						class={cn(
							'block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
							page.url.pathname === item.href
								? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
								: 'text-white/70 hover:text-white hover:bg-white/5'
						)}
						onclick={() => (mobileMenuOpen = false)}
					>
						<span class="mr-2">{item.icon}</span>
						{item.label}
					</a>
				{/each}
			</div>
		{/if}
	</div>
</nav>