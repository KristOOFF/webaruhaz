<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { products } from '$lib/products';
  import { cartTotal } from '$lib/cart';
  import { isDarkMode } from '$lib/theme'; // Import the store
  import ProductCard from '$lib/components/ProductCard.svelte';
  import { Coffee, Sun, Moon } from '@lucide/svelte';

  function toggleTheme() {
    isDarkMode.update(v => !v);
  }
</script>

<!-- Main Container: Transition between Sky Blue (Light) and Deep Space (Dark) -->
<div class="min-h-screen relative overflow-hidden font-sans transition-colors duration-700
  bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500
  dark:from-[#0f0f20] dark:to-[#1a1a2e] selection:bg-pink-400">
  
  <!-- DECORATIONS -->
  
  <!-- 1. Stars (Visible only in Dark Mode) -->
  <div class="stars absolute inset-0 pointer-events-none transition-opacity duration-700 opacity-0 dark:opacity-50"></div>

  <!-- 2. Clouds (Visible only in Light Mode) -->
  <div class="absolute inset-0 pointer-events-none transition-opacity duration-700 opacity-100 dark:opacity-0">
     <!-- CSS Clouds -->
     <div class="cloud top-20 left-10 w-40 h-40"></div>
     <div class="cloud top-40 right-20 w-60 h-60 delay-700"></div>
     <div class="cloud bottom-20 left-1/3 w-80 h-80 delay-1000"></div>
  </div>

  <!-- 3. Celestial Body (Sun in Light / Moon/Planet in Dark) -->
  <div class="absolute top-20 right-[-50px] rounded-full blur-[2px] shadow-[0_0_50px_rgba(253,224,71,0.5)] transition-all duration-1000
    w-32 h-32 bg-yellow-300 opacity-90
    dark:bg-yellow-100 dark:opacity-80 dark:shadow-[0_0_50px_rgba(255,255,255,0.2)]">
  </div>

  <!-- HEADER -->
  <header class="flex justify-center items-center py-8 relative px-4 z-20">
    <!-- Title Box -->
    <div class="backdrop-blur-sm border px-8 py-3 rounded-2xl flex items-center space-x-3 transition-colors duration-300
      bg-white/20 border-white/30
      dark:bg-white/10 dark:border-white/10">
      <Coffee class="text-white" />
      <h1 class="text-2xl font-bold text-white tracking-wide drop-shadow-md">Termékeink</h1>
    </div>

    <!-- Theme Toggle Button -->
    <div class="absolute right-4 top-8 sm:right-10">
      <button on:click={toggleTheme} class="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 backdrop-blur-sm
        bg-white/30 border-white/50 text-white hover:bg-white/40 hover:border-white/70
        dark:bg-white/5 dark:border-white/20 dark:text-yellow-400 dark:hover:bg-white/10 dark:hover:border-white/30">
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
    <div class="backdrop-blur-xl border rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col space-y-4 transition-colors duration-300
      bg-white/20 border-white/40
      dark:bg-white/5 dark:border-white/20 dark:shadow-[0_8px_32px_0_rgba(139,92,246,0.2)]">

      <div class="flex justify-between items-center text-white">
        <span class="text-lg font-bold drop-shadow-sm">Összesen:</span>
        <span class="text-xl font-bold drop-shadow-sm">{$cartTotal} Ft</span>
      </div>

      <!-- Button: Pink in Light Mode, Purple in Dark Mode -->
      <button class="w-full font-bold py-3 rounded-lg shadow-lg transition-all transform active:scale-95 text-white
        bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500
        dark:from-purple-600 dark:to-indigo-600 dark:hover:from-purple-500 dark:hover:to-indigo-500">
        Megrendelés
      </button>
    </div>
  </div>

  <footer class="text-center text-white/60 text-xs py-4 relative w-full z-10">
    © 2025 NeoCoffee Kft. - Minden jog fenntartva.
  </footer>
</div>

<style>
  /* Dark Mode Stars */
  .stars {
    background-image: 
      radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)),
      radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)),
      radial-gradient(2px 2px at 50px 160px, #ddd, rgba(0,0,0,0)),
      radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0)),
      radial-gradient(2px 2px at 130px 80px, #fff, rgba(0,0,0,0));
    background-size: 200px 200px;
  }

  /* Light Mode Clouds */
  .cloud {
    position: absolute;
    background: rgba(255, 255, 255, 0.4);
    filter: blur(40px);
    border-radius: 50%;
    animation: float 20s infinite ease-in-out;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-20px) scale(1.1); }
  }
</style>