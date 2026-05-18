import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],

	/**
	 * Dev-server gyorsítás.
	 *
	 * Probléma: a `@lucide/svelte` minden ikont külön fájlban szállít, a
	 * `bits-ui` szintén sok apró modulból áll. Alapértelmezetten a Vite
	 * dev szerver ezeket request-enként, lazy módon transzformálja, ami
	 * a böngészőben több száz HTTP kérést és nagyon lassú első
	 * betöltést eredményez.
	 *
	 * Az `optimizeDeps.include` arra utasítja a Vite-ot, hogy ezeket
	 * előre, esbuild-del egyetlen bundle-be csomagolja.
	 *
	 * Csak a ténylegesen használt ikonokat / csomagokat listázzuk.
	 * Fontos: NE adjuk hozzá a `@lucide/svelte` barrel csomagot – az
	 * az összes 1000+ ikont be próbálná bundlezni, ami jelentősen
	 * lelassítaná az indulást. Csak az éppen használt ikonok szerepelnek.
	 */
	optimizeDeps: {
		include: [
			// Homepage / ProductCard ikonok
			'@lucide/svelte/icons/coffee',
			'@lucide/svelte/icons/sun',
			'@lucide/svelte/icons/moon',
			'@lucide/svelte/icons/shield',
			'@lucide/svelte/icons/shopping-cart',
			'@lucide/svelte/icons/minus',
			'@lucide/svelte/icons/plus',
			// Checkout + Admin route ikonok (előre bundle-ben, hogy ne legyen
			// re-optimization + full reload az első navigációkor)
			'@lucide/svelte/icons/arrow-left',
			'@lucide/svelte/icons/package',
			'@lucide/svelte/icons/trash-2',
			'@lucide/svelte/icons/eye',
			'@lucide/svelte/icons/log-in',
			'@lucide/svelte/icons/log-out',
			'bits-ui',
			'clsx',
			'tailwind-merge',
			'tailwind-variants'
		]
	},

	server: {
		/**
		 * Warmup: a Vite szerver indításakor előre transzformálja az
		 * alkalmazás saját fájljait (route-ok, komponensek), így az
		 * első böngészős kérésre már a cache-ből szolgálnak ki,
		 * nem szükséges akkor transzformálni őket.
		 */
		warmup: {
			clientFiles: [
				'./src/routes/+layout.svelte',
				'./src/routes/+page.svelte',
				'./src/routes/+page.ts',
				'./src/routes/checkout/+page.svelte',
				'./src/routes/admin/+page.svelte',
				'./src/lib/components/ProductCard.svelte',
				'./src/lib/components/ThemeDecorations.svelte',
				'./src/lib/components/ThemeToggleIcon.svelte',
			]
		}
	}
});
