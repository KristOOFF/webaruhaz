<script lang="ts">
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	type InputType = Exclude<HTMLInputTypeAttribute, "file">;

	type Props = WithElementRef<
		Omit<HTMLInputAttributes, "type"> &
			({ type: "file"; files?: FileList } | { type?: InputType; files?: undefined })
	>;

	let {
		ref = $bindable(null),
		value = $bindable(),
		type,
		files = $bindable(),
		class: className,
		"data-slot": dataSlot = "input",
		...restProps
	}: Props = $props();
</script>

{#if type === "file"}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(
			"backdrop-blur-md bg-white/40 border-white/30 dark:bg-white/[0.1] dark:border-white/[0.15] text-gray-800 dark:text-gray-200 placeholder:text-gray-600 dark:placeholder:text-gray-400 selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border px-3 pt-1.5 text-sm font-medium shadow-xs transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50",
			"focus-visible:border-white/50 dark:focus-visible:border-white/30 focus-visible:ring-2 focus-visible:ring-white/50 dark:focus-visible:ring-white/50",
			"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
			className
		)}
		type="file"
		bind:files
		bind:value
		{...restProps}
	/>
{:else}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(
			"backdrop-blur-md bg-white/40 border-white/30 dark:bg-white/[0.1] dark:border-white/[0.15] text-gray-800 dark:text-gray-200 placeholder:text-gray-600 dark:placeholder:text-gray-400 selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
			"focus-visible:border-white/50 dark:focus-visible:border-white/30 focus-visible:ring-2 focus-visible:ring-white/50 dark:focus-visible:ring-white/50",
			"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
			className
		)}
		{type}
		bind:value
		{...restProps}
	/>
{/if}
