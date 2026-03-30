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
	}

	let { variant = 'default', size = 'md', class: className, children, ...restProps }: Props = $props();

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

<button class={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</button>