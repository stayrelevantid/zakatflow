<script lang="ts">
	import { Card, Input, Button } from '$lib/components/ui';
	import { fly, fade } from 'svelte/transition';
	import { isLoading } from '$lib/stores/zakat';
	import { createTransaksi, calculateZakat } from '$lib/services/api';
	import type { KalkulatorResult } from '$lib/services/api';
	import type { ZakatCategory } from '$lib/types/zakat';

	interface Props {
		title: string;
		description: string;
		icon: string;
		category: ZakatCategory;
	}

	let { title, description, icon, category }: Props = $props();

	let result: KalkulatorResult | null = $state(null);
	let error: string | null = $state(null);
	let success: string | null = $state(null);

	async function handleSubmit(event: Event) {
		event.preventDefault();
		error = null;
		success = null;

		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);

		// We'll handle specific calculator logic in each page
		// This is a placeholder for now
	}

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(value);
	}

	function resetForm() {
		result = null;
		error = null;
		success = null;
	}
</script>

<div class="max-w-2xl mx-auto" transition:fade={{ duration: 400 }}>
	<a href="/kalkulator" class="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors">
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
		</svg>
		Kembali ke Kalkulator
	</a>

	<div class="mb-8" transition:fly={{ y: -20, duration: 600 }}>
		<h1 class="text-4xl font-display font-bold text-white mb-2">{icon} {title}</h1>
		<p class="text-white/60 text-lg">{description}</p>
	</div>

	<div transition:fly={{ y: 20, delay: 100, duration: 500 }}>
		<Card class="p-8">
			<slot name="form" {result} {error} {handleSubmit} {resetForm} {formatCurrency} />

			{#if error}
				<div class="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
					<p class="text-red-400 text-sm">{error}</p>
				</div>
			{/if}

			{#if success}
				<div class="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
					<p class="text-green-400 text-sm">{success}</p>
				</div>
			{/if}
		</Card>
	</div>
</div>