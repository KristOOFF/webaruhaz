<script lang="ts" module>
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
	import { type VariantProps, tv } from "tailwind-variants";

	export const buttonVariants = tv({
		base: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 backdrop-blur-xl border",
		variants: {
			variant: {
				default: "glass-interactive text-gray-800 dark:text-white shadow-lg dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]",
				destructive:
					"bg-red-500/30 border-red-500/50 text-red-800 hover:bg-red-500/40 hover:border-red-500/70 dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/30 dark:hover:border-red-500/40 shadow-lg dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]",
				success:
					"bg-green-500/30 border-green-500/50 text-green-800 hover:bg-green-500/40 hover:border-green-500/70 dark:bg-green-500/20 dark:border-green-500/30 dark:text-green-300 dark:hover:bg-green-500/30 dark:hover:border-green-500/40 shadow-lg dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]",
				warning:
					"bg-orange-500/30 border-orange-500/50 text-orange-800 hover:bg-orange-500/40 hover:border-orange-500/70 dark:bg-orange-500/20 dark:border-orange-500/30 dark:text-orange-300 dark:hover:bg-orange-500/30 dark:hover:border-orange-500/40 shadow-lg dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]",
				outline:
					"bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border shadow-xs",
				secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-xs",
				ghost: "border-transparent hover:bg-white/10 dark:hover:bg-white/[0.02] text-gray-800 dark:text-white",
				link: "text-primary underline-offset-4 hover:underline border-transparent",
			},
			size: {
				default: "h-9 px-4 py-2 has-[>svg]:px-3",
				sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
				lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
				icon: "size-9",
				"icon-sm": "size-8",
				"icon-lg": "size-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
	export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
		};
</script>

<script lang="ts">
	let {
		class: className,
		variant = "default",
		size = "default",
		ref = $bindable(null),
		href = undefined,
		type = "button",
		disabled,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? "link" : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
