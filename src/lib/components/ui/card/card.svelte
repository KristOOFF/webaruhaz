<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="card"
	class={cn(
		"backdrop-blur-xl bg-white/30 border-white/50 dark:bg-white/[0.08] dark:border-white/[0.15] text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-lg dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-white/70 hover:shadow-xl dark:hover:border-white/[0.25] dark:hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.5)]",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
