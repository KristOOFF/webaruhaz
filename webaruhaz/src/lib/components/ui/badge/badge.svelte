<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	export const badgeVariants = tv({
		base: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all duration-200 focus-visible:ring-[3px] [&>svg]:pointer-events-none [&>svg]:size-3 backdrop-blur-xl",
		variants: {
			variant: {
				default:
					"bg-white/30 border-white/50 text-gray-800 dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white",
				secondary:
					"bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90 border-transparent",
				destructive:
					"bg-red-500/30 border-red-500/50 text-red-700 dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-400",
				success:
					"bg-green-500/30 border-green-500/50 text-green-700 dark:bg-green-500/20 dark:border-green-500/30 dark:text-green-400",
				warning:
					"bg-orange-500/30 border-orange-500/50 text-orange-700 dark:bg-orange-500/20 dark:border-orange-500/30 dark:text-orange-400",
				outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
</script>

<script lang="ts">
	import type { HTMLAnchorAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		href,
		class: className,
		variant = "default",
		children,
		...restProps
	}: WithElementRef<HTMLAnchorAttributes> & {
		variant?: BadgeVariant;
	} = $props();
</script>

<svelte:element
	this={href ? "a" : "span"}
	bind:this={ref}
	data-slot="badge"
	{href}
	class={cn(badgeVariants({ variant }), className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
