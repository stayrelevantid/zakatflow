<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		class?: string;
		label?: string;
		error?: string;
	}

	let { class: className, label, error, id, value = $bindable(''), ...restProps }: Props = $props();
	const inputId = id ?? `input-${crypto.randomUUID().slice(0, 8)}`;
</script>

{#if label}
	<label for={inputId} class="label">{label}</label>
{/if}

<input id={inputId} class={cn('input', error && 'border-red-500', className)} bind:value {...restProps} />

{#if error}
	<p class="text-red-400 text-sm mt-1">{error}</p>
{/if}