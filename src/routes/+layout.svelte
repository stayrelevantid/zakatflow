<script lang="ts">
	import '../app.css';
	import { Navbar, Sidebar, Footer } from '$lib/components/ui';
	import favicon from '$lib/assets/favicon.svg';
	import { sidebarOpen } from '$lib/stores/zakat';
	import { cn } from '$lib/utils';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>ZakatFlow - Kalkulator Zakat</title>
</svelte:head>

<div
	class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden"
>
	<Navbar />

	<div class="pt-16 pb-20 flex">
		<Sidebar />

		<main class={cn('flex-1 transition-all duration-300 p-6', $sidebarOpen ? 'ml-64' : 'ml-0')}>
			<div class="relative z-10">
				{@render children()}
			</div>
		</main>
	</div>

	<Footer />
</div>
