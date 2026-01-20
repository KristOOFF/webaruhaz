<!--
  @component RootLayout

  Gyökér layout komponens - alkalmazás szintű wrapper

  Ez a komponens az alkalmazás legfelső szintű layoutja, amely minden
  oldalt körbeölel. Felelős a globális CSS betöltéséért és a favicon
  beállításáért.

  Funkciók:
  - Globális CSS (layout.css) betöltése, amely tartalmazza a Tailwind importokat
  - Favicon beállítása az oldal head részében
  - Gyerek komponensek renderelése (snippet-based children rendering)

  Megjegyzés:
  - Ez a layout minden SvelteKit route-ra automatikusan alkalmazódik
  - A children prop a Svelte 5 új snippet API-ját használja
-->
<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	/**
	 * Gyerek komponensek snippet-je
	 * A SvelteKit automatikusan átadja az aktuális oldal tartalmát
	 */
	let { children } = $props();
</script>

<!-- Favicon beállítása a document head-ben -->
<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<!-- Gyerek komponensek renderelése (az aktuális oldal) -->
{@render children()}
