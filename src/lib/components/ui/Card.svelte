<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<div class={cn('glass-card', className)} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</div>