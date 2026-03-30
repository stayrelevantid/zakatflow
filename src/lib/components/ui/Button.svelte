<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Variant = 'default' | 'secondary' | 'outline' | 'ghost';
	type Size = 'sm' | 'md' | 'lg' | 'icon';

	interface Props extends HTMLButtonAttributes {
		variant?: Variant;
		size?: Size;
		class?: string;
		children?: import('svelte').Snippet;
		loading?: boolean;
	}

	let { variant = 'default', size = 'md', class: className, children, loading = false, disabled, ...restProps }: Props = $props();

	const baseClasses = 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50';

	const variantClasses: Record<Variant, string> = {
		default: 'glass-btn',
		secondary: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20',
		outline: 'border border-white/20 text-white hover:bg-white/10',
		ghost: 'text-white hover:bg-white/10'
	};

	const sizeClasses: Record<Size, string> = {
		sm: 'h-9 px-3 text-sm',
		md: 'h-11 px-6 text-base',
		lg: 'h-14 px-8 text-lg',
		icon: 'h-10 w-10'
	};
</script>

<button class={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)} disabled={disabled || loading} {...restProps}>
	{#if loading}
		<svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
			<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
		</svg>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</button>