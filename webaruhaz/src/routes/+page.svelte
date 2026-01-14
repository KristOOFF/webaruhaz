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
  import { Coffee, Sun, Moon, Shield } from '@lucide/svelte';

  /**
   * Témaváltó függvény
   * Invertálja a jelenlegi téma állapotot
   */
  function toggleTheme() {
    isDarkMode.update(v => !v);
  }

  /**
   * Csillag interfész
   * Definiálja egy egyedi csillag tulajdonságait a dark mode animációhoz
   */
  interface Star {
    x: number;      // Vízszintes pozíció (0-100%)
    y: number;      // Függőleges pozíció (0-100%)
    size: number;   // Csillag mérete pixelben
    opacity: number; // Alapértelmezett átlátszóság
    delay: number;  // Animáció késleltetés másodpercben
  }

  /**
   * Csillagok generálása
   * 100 véletlenszerű pozíciójú, méretű és villogási mintájú csillag
   */
  const stars: Star[] = [];
  const starCount = 100;

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,         // 1-3px méret
      opacity: Math.random() * 0.5 + 0.5,  // 0.5-1.0 átlátszóság
      delay: Math.random() * 4              // 0-4s késleltetés
    });
  }

  /**
   * Felhő interfész
   * Definiálja egy egyedi felhő tulajdonságait a light mode animációhoz
   */
  interface Cloud {
    x: number;      // Vízszintes pozíció (0-100%)
    y: number;      // Függőleges pozíció (0-60%)
    size: number;   // Felhő mérete pixelben
    opacity: number; // Átlátszóság (0.3-0.6)
    delay: number;  // Animáció késleltetés másodpercben
  }

  /**
   * Felhők generálása
   * 5 véletlenszerű pozíciójú, méretű és lebegési mintájú felhő
   */
  const clouds: Cloud[] = [];
  const cloudCount = 5;

  for (let i = 0; i < cloudCount; i++) {
    clouds.push({
      x: Math.random() * 100,
      y: Math.random() * 60,               // Felső/középső rész (0-60%)
      size: Math.random() * 60 + 40,       // 40-100px méret
      opacity: Math.random() * 0.3 + 0.3,  // 0.3-0.6 átlátszóság
      delay: Math.random() * 20             // 0-20s késleltetés
    });
  }
</script>

<!-- Main Container: Transition between Light and Dark -->
<div class="min-h-screen relative overflow-hidden font-sans transition-colors duration-700
  bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500
  dark:bg-gradient-to-br dark:from-[#0d0e1a] dark:via-[#0d0e1a] dark:to-[#0d0e1a] selection:bg-pink-400">

  <!-- DECORATIONS -->

  <!-- Stars (Dark mode only) -->
  <div class="absolute inset-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-700">
    {#each stars as star}
      <div
        class="star absolute rounded-full bg-white"
        style="left: {star.x}%; top: {star.y}%; width: {star.size}px; height: {star.size}px; --base-opacity: {star.opacity}; --delay: {star.delay};"
      ></div>
    {/each}
  </div>

  <!-- Clouds (Light mode only) -->
  <div class="absolute inset-0 pointer-events-none transition-opacity duration-700 opacity-100 dark:opacity-0">
    {#each clouds as cloud}
      <div class="cloud-container absolute" style="left: {cloud.x}%; top: {cloud.y}%; --delay: {cloud.delay}s; --opacity: {cloud.opacity};">
        <!-- Main cloud body made of overlapping circles -->
        <div class="cloud-part" style="width: {cloud.size}px; height: {cloud.size * 0.6}px; left: 0;"></div>
        <div class="cloud-part" style="width: {cloud.size * 0.8}px; height: {cloud.size * 0.7}px; left: {cloud.size * 0.3}px; top: {cloud.size * 0.1}px;"></div>
        <div class="cloud-part" style="width: {cloud.size * 0.9}px; height: {cloud.size * 0.65}px; left: {cloud.size * 0.5}px; top: -{cloud.size * 0.05}px;"></div>
        <div class="cloud-part" style="width: {cloud.size * 0.7}px; height: {cloud.size * 0.6}px; left: {cloud.size * 0.8}px; top: {cloud.size * 0.08}px;"></div>
      </div>
    {/each}
  </div>

  <!-- Celestial Body (Sun in Light / Moon in Dark) -->
  <div class="absolute top-20 right-[-50px] rounded-full blur-[2px] transition-all duration-1000
    w-32 h-32 bg-yellow-300 opacity-90 shadow-[0_0_50px_rgba(253,224,71,0.5)]
    dark:bg-yellow-100 dark:opacity-80 dark:shadow-[0_0_50px_rgba(255,255,255,0.2)]">
  </div>

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
      <a href="/admin" class="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 backdrop-blur-xl
        bg-white/30 border-white/50 text-gray-800 hover:bg-white/40 hover:border-white/70 shadow-lg
        dark:bg-white/[0.03] dark:border-white/[0.08] dark:text-purple-400 dark:hover:bg-white/[0.05] dark:hover:border-white/[0.12] dark:shadow-[0_4px_16px_0_rgba(0,0,0,0.4)]">
        <Shield size={20} />
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

<style>
  /* Stars - Twinkling animation (dark mode only) */
  .star {
    animation: twinkle 4s ease-in-out infinite;
    animation-delay: calc(var(--delay, 0) * 1s);
  }

  @keyframes twinkle {
    0%, 100% { opacity: var(--base-opacity, 1); }
    50% { opacity: calc(var(--base-opacity, 1) * 0.3); }
  }

  /* Light Mode Clouds */
  .cloud-container {
    position: relative;
    animation: float 20s infinite ease-in-out;
    animation-delay: var(--delay, 0s);
  }

  .cloud-part {
    position: absolute;
    background: rgba(255, 255, 255, var(--opacity, 0.4));
    filter: blur(40px);
    border-radius: 50%;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
    25% { transform: translateY(-15px) translateX(10px) scale(1.05); }
    50% { transform: translateY(-25px) translateX(5px) scale(1.1); }
    75% { transform: translateY(-15px) translateX(-5px) scale(1.05); }
  }
</style>