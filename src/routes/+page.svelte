<!--
  @component HomePage

  Főoldal komponens - termék katalógus és kosár (shadcn-svelte komponensekkel)

  Ez az alkalmazás fő oldala, amely megjeleníti a kávétermékeket egy reszponzív
  grid elrendezésben, valamint kezeli a kosár összesítését és a témaváltást.

  Funkciók:
  - Termék grid megjelenítése shadcn Card komponensekkel
  - Kosár végösszeg megjelenítése shadcn Card-ban
  - Témaváltó és admin gombok shadcn Button-nel
  - Dinamikus dekorációk (csillagok sötét módban, felhők világos módban)
  - Égi test animáció (nap/hold)

  shadcn-svelte komponensek:
  - Card (header címhez, checkout sávhoz, hibaüzenetekhez)
  - Button (témaváltó, admin link, checkout gomb)
  - ProductCard (már shadcn komponenseket használ)

  Layout:
  - Header: cím Card + témaváltó/admin Button-ök
  - Main: ProductCard grid
  - Checkout sáv: Card végösszeggel és checkout Button-nel
  - Footer: copyright információ
-->
<script lang="ts">
  import { cartTotal } from '$lib/cart';
  import { isDarkMode } from '$lib/theme';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import ThemeDecorations from '$lib/components/ThemeDecorations.svelte';
  import ThemeToggleIcon from '$lib/components/ThemeToggleIcon.svelte';
  // Per-ikonos import: jelentősen gyorsabb dev build (nem húzza be az összes Lucide ikont)
  import Coffee from '@lucide/svelte/icons/coffee';
  import Shield from '@lucide/svelte/icons/shield';
  import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
  import type { PageData } from './+page';

  // shadcn-svelte komponensek
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';

  // Termékek betöltése a load függvényből (SSR)
  let { data }: { data: PageData } = $props();

  /**
   * Témaváltó függvény
   * Invertálja a jelenlegi téma állapotot
   */
  function toggleTheme() {
    isDarkMode.update(v => !v);
  }
</script>

<!-- Main Container: Transition between Light and Dark -->
<div class="min-h-screen relative overflow-hidden font-sans transition-colors duration-300
  bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500
  dark:bg-gradient-to-br dark:from-[#0d0e1a] dark:via-[#0d0e1a] dark:to-[#0d0e1a]">

  <!-- DECORATIONS -->
  <ThemeDecorations />

  <!-- HEADER -->
  <header class="flex justify-center items-center py-8 relative px-4 z-20">
    <!-- Title Card -->
    <Card.Root class="border-white/30 shadow-lg backdrop-blur-xl bg-white/20 dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
      <Card.Content class="flex items-center space-x-3 px-8 py-3">
        <Coffee class="text-gray-800 dark:text-white transition-colors duration-300" />
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white tracking-wide drop-shadow-md transition-colors duration-300">Termékeink</h1>
      </Card.Content>
    </Card.Root>

    <!--
      Akció gombok (Admin link + téma váltó).

      Szándékosan NEM használjuk a shadcn `outline` variantot, mert az
      `bg-background`-et használ (világos módban tiszta fehér, sötétben
      majdnem fekete) és csak `duration-200` tranzícióval animálódik.
      A fő háttér viszont `duration-700`-zal vált, így a gomb 500ms-mal
      korábban végez → vizuálisan "villog".

      Helyette ugyanazt az üvegmézes (glassmorphism) stílust adjuk a
      gomboknak, mint a cím Card-nak, és minden szín-tranzíciót
      `duration-700`-ra egységesítünk.
    -->
    <div class="absolute right-4 top-8 sm:right-10 flex gap-2">
      <Button
        href="/admin"
        class="h-10 px-4 gap-2 backdrop-blur-xl border bg-white/20 border-white/30 text-gray-800
               dark:bg-white/[0.03] dark:border-white/[0.08] dark:text-white
               hover:bg-white/30 dark:hover:bg-white/[0.06]
               shadow-lg dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]
               transition-colors duration-300"
      >
        {#snippet children()}
          <Shield size={18} />
          <span class="text-sm font-medium">Admin</span>
        {/snippet}
      </Button>
      <Button
        onclick={toggleTheme}
        size="icon"
        class="w-10 h-10 backdrop-blur-xl border bg-white/20 border-white/30 text-gray-800
               dark:bg-white/[0.03] dark:border-white/[0.08] dark:text-white
               hover:bg-white/30 dark:hover:bg-white/[0.06]
               shadow-lg dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]
               transition-colors duration-300"
      >
        {#snippet children()}
          <ThemeToggleIcon size={20} />
        {/snippet}
      </Button>
    </div>
  </header>

  <!-- MAIN GRID -->
  <main class="max-w-6xl mx-auto px-4 z-10 relative">
    {#if data.error}
      <!-- Hibaüzenet ha az API nem érhető el -->
      <Card.Root class="border-white/40 shadow-lg backdrop-blur-xl bg-white/20 dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        <Card.Content class="p-8 text-center">
          <p class="text-gray-800 dark:text-white text-lg font-semibold">
            {data.error}
          </p>
          <p class="text-gray-600 dark:text-white/60 mt-2">
            Kérjük, győződj meg róla, hogy a backend szerver fut.
          </p>
        </Card.Content>
      </Card.Root>
    {:else if data.products.length === 0}
      <!-- Üres termék lista -->
      <Card.Root class="border-white/40 shadow-lg backdrop-blur-xl bg-white/20 dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
        <Card.Content class="p-8 text-center">
          <p class="text-gray-800 dark:text-white text-lg font-semibold">
            Jelenleg nincsenek elérhető termékek.
          </p>
        </Card.Content>
      </Card.Root>
    {:else}
      <!-- Termékek grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each data.products as product (product.id)}
          <ProductCard {product} />
        {/each}
      </div>
    {/if}
  </main>

  <!-- CHECKOUT BAR -->
  <div class="px-4 flex justify-center z-10 mt-16 mb-8 relative">
    <Card.Root class="w-full max-w-lg border-white/40 shadow-2xl backdrop-blur-xl bg-white/20 dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
      <Card.Content class="p-6 flex flex-col space-y-4">
        <div class="flex justify-between items-center text-gray-800 dark:text-white transition-colors duration-300">
          <span class="text-lg font-bold drop-shadow-sm">Összesen:</span>
          <span class="text-xl font-bold drop-shadow-sm">{$cartTotal} Ft</span>
        </div>

        <Button variant="default" size="lg" class="w-full" href="/checkout">
          {#snippet children()}
            <ShoppingCart size={20} class="mr-2" />
            Megrendelés
          {/snippet}
        </Button>
      </Card.Content>
    </Card.Root>
  </div>

  <footer class="text-center text-white/60 text-xs py-4 relative w-full z-10">
    © 2025 NeoCoffee Kft. - Minden jog fenntartva.
  </footer>
</div>

