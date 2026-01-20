<!--
  @component HomePage

  Főoldal komponens - termék katalógus és kosár

  Ez az alkalmazás fő oldala, amely megjeleníti a kávétermékeket egy reszponzív
  grid elrendezésben, valamint kezeli a kosár összesítését és a témaváltást.

  Funkciók:
  - Termék grid megjelenítése (1-3 oszlop, reszponzív)
  - Kosár végösszeg megjelenítése
  - Témaváltó gomb (világos/sötét mód)
  - Dinamikus dekorációk (csillagok sötét módban, felhők világos módban)
  - Égi test animáció (nap/hold)

  Vizuális elemek:
  - Glassmorphism design mindenhol
  - 100 véletlenszerű csillag villogó animációval (dark mode)
  - 5 véletlenszerű felhő lebegő animációval (light mode)
  - Gradient háttér mindkét témában
  - Smooth átmenetek témaváltáskor (700ms)

  Layout:
  - Header: cím + témaváltó gomb
  - Main: termék kártyák grid-ben
  - Checkout sáv: végösszeg + megrendelés gomb
  - Footer: copyright információ
-->
<script lang="ts">
  import { products } from '$lib/products';
  import { cartTotal } from '$lib/cart';
  import { isDarkMode } from '$lib/theme';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import ThemeDecorations from '$lib/components/ThemeDecorations.svelte';
  import { Coffee, Sun, Moon, Shield } from '@lucide/svelte';

  /**
   * Témaváltó függvény
   * Invertálja a jelenlegi téma állapotot
   */
  function toggleTheme() {
    isDarkMode.update(v => !v);
  }
</script>

<!-- Main Container: Transition between Light and Dark -->
<div class="min-h-screen relative overflow-hidden font-sans transition-colors duration-700
  bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500
  dark:bg-gradient-to-br dark:from-[#0d0e1a] dark:via-[#0d0e1a] dark:to-[#0d0e1a] selection:bg-pink-400">

  <!-- DECORATIONS -->
  <ThemeDecorations />

  <!-- HEADER -->
  <header class="flex justify-center items-center py-8 relative px-4 z-20">
    <!-- Title Box -->
    <div class="backdrop-blur-xl border px-8 py-3 rounded-2xl flex items-center space-x-3 transition-all duration-300
      bg-white/20 border-white/30 shadow-lg
      dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
      <Coffee class="text-gray-800 dark:text-white transition-colors duration-300" />
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white tracking-wide drop-shadow-md transition-colors duration-300">Termékeink</h1>
    </div>

    <!-- Theme Toggle Button -->
    <div class="absolute right-4 top-8 sm:right-10 flex gap-2">
      <a href="/admin" class="h-10 px-4 rounded-full border flex items-center justify-center gap-2 transition-all duration-300 backdrop-blur-xl
        bg-white/30 border-white/50 text-gray-800 hover:bg-white/40 hover:border-white/70 shadow-lg
        dark:bg-white/[0.03] dark:border-white/[0.08] dark:text-purple-400 dark:hover:bg-white/[0.05] dark:hover:border-white/[0.12] dark:shadow-[0_4px_16px_0_rgba(0,0,0,0.4)]">
        <Shield size={18} />
        <span class="text-sm font-medium">Admin</span>
      </a>
      <button on:click={toggleTheme} class="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 backdrop-blur-xl
        bg-white/30 border-white/50 text-gray-800 hover:bg-white/40 hover:border-white/70 shadow-lg
        dark:bg-white/[0.03] dark:border-white/[0.08] dark:text-yellow-400 dark:hover:bg-white/[0.05] dark:hover:border-white/[0.12] dark:shadow-[0_4px_16px_0_rgba(0,0,0,0.4)]">
        {#if $isDarkMode}
          <Sun size={20} />
        {:else}
          <Moon size={20} />
        {/if}
      </button>
    </div>
  </header>

  <!-- MAIN GRID -->
  <main class="max-w-6xl mx-auto px-4 z-10 relative">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each products as product (product.id)}
        <ProductCard {product} />
      {/each}
    </div>
  </main>

  <!-- CHECKOUT BAR -->
  <div class="px-4 flex justify-center z-10 mt-16 mb-8">
    <div class="backdrop-blur-xl border rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col space-y-4 transition-all duration-300
      bg-white/20 border-white/40 shadow-lg
      dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">

      <div class="flex justify-between items-center text-gray-800 dark:text-white transition-colors duration-300">
        <span class="text-lg font-bold drop-shadow-sm">Összesen:</span>
        <span class="text-xl font-bold drop-shadow-sm">{$cartTotal} Ft</span>
      </div>

      <!-- Button -->
      <a href="/checkout">
        <button class="w-full font-bold py-3 rounded-xl transition-all duration-300 transform active:scale-95 backdrop-blur-xl border
          bg-white/20 border-white/40 text-gray-800 hover:bg-white/30 hover:border-white/50 shadow-lg
          dark:bg-white/[0.03] dark:border-white/[0.08] dark:text-white dark:hover:bg-white/[0.05] dark:hover:border-white/[0.12] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
          Megrendelés
        </button>
      </a>
    </div>
  </div>

  <footer class="text-center text-white/60 text-xs py-4 relative w-full z-10">
    © 2025 NeoCoffee Kft. - Minden jog fenntartva.
  </footer>
</div>

