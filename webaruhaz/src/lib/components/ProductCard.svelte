<!-- src/lib/components/ProductCard.svelte -->
<script lang="ts">
  import { Coffee, Minus, Plus } from '@lucide/svelte';
  import { addToCart } from '$lib/cart';
  import type { Product } from '$lib/types';

  export let product: Product;

  let quantity: number = 1;
  let milk: string = "Mandula tej";
  let sugar: string = "Cukor mennyiség";

  function decrease() { if (quantity > 1) quantity--; }
  function increase() { quantity++; }

  function handleAddToCart() {
    addToCart(product, quantity, { milk, sugar });
    quantity = 1;
  }
</script>

<div class="
  relative flex flex-col items-center text-center rounded-xl p-6 transition-all duration-300
  backdrop-blur-md border
  /* Light Mode Styles - More visible with stronger background */
  bg-white/30 border-white/50 hover:border-white/70 shadow-lg hover:shadow-xl
  /* Dark Mode Styles - Liquid Glass Effect */
  dark:bg-white/5 dark:border-white/20 dark:hover:border-white/30
  dark:shadow-[0_8px_32px_0_rgba(139,92,246,0.15)] dark:hover:shadow-[0_8px_32px_0_rgba(139,92,246,0.25)]
">
  
  <!-- Icon Circle -->
  <div class="w-12 h-12 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm
    bg-white/40 dark:bg-white/10 dark:border dark:border-white/20">
    <Coffee class="text-white w-6 h-6" />
  </div>

  <!-- Title & Price -->
  <h3 class="text-white font-bold text-lg drop-shadow-sm">{product.name}</h3>
  <p class="text-sky-50 dark:text-gray-300 text-sm mb-4">{product.price} Ft</p>

  <!-- Selectors -->
  <div class="w-full space-y-2 mb-4">
    <select bind:value={milk} class="w-full text-sm rounded px-3 py-2 outline-none cursor-pointer appearance-none backdrop-blur-sm
      bg-white/40 focus:ring-2 focus:ring-white/50 text-white border border-white/30
      dark:bg-white/10 dark:focus:ring-purple-400/50 dark:text-white dark:border-white/20
      [&>option]:bg-slate-700 [&>option]:text-gray-100
      dark:[&>option]:bg-gray-900 dark:[&>option]:text-gray-100">
      <option value="Mandula tej">Mandula tej</option>
      <option value="Tehéntej">Tehéntej</option>
      <option value="Zabtej">Zabtej</option>
    </select>

    <select bind:value={sugar} class="w-full text-sm rounded px-3 py-2 outline-none cursor-pointer appearance-none backdrop-blur-sm
      bg-white/40 focus:ring-2 focus:ring-white/50 text-white border border-white/30
      dark:bg-white/10 dark:focus:ring-purple-400/50 dark:text-white dark:border-white/20
      [&>option]:bg-slate-700 [&>option]:text-gray-100
      dark:[&>option]:bg-gray-900 dark:[&>option]:text-gray-100">
      <option value="Cukor mennyiség" disabled>Cukor mennyiség</option>
      <option value="Nincs">Nincs</option>
      <option value="1 kanál">1 kanál</option>
      <option value="2 kanál">2 kanál</option>
    </select>
  </div>

  <!-- Quantity Control -->
  <div class="flex items-center space-x-3 mb-4">
    <button on:click={decrease} class="w-8 h-8 flex items-center justify-center rounded transition text-white backdrop-blur-sm
      bg-white/40 hover:bg-white/50 border border-white/30
      dark:bg-white/10 dark:hover:bg-white/15 dark:border-white/20">
      <Minus size={14} />
    </button>
    <span class="text-white font-bold w-8 drop-shadow-md">{quantity} db</span>
    <button on:click={increase} class="w-8 h-8 flex items-center justify-center rounded transition text-white backdrop-blur-sm
      bg-white/40 hover:bg-white/50 border border-white/30
      dark:bg-white/10 dark:hover:bg-white/15 dark:border-white/20">
      <Plus size={14} />
    </button>
  </div>

  <!-- Button -->
  <button on:click={handleAddToCart} class="w-full py-2 rounded font-medium text-sm transition-all border text-white backdrop-blur-sm
    bg-white/50 hover:bg-white/60 border-white/40 hover:shadow-md
    dark:bg-white/15 dark:hover:bg-white/20 dark:border-white/30 dark:hover:shadow-[0_4px_16px_0_rgba(139,92,246,0.3)]">
    Kosárba
  </button>
</div>

<style>
  /* Ensure dropdown options are always visible with proper contrast */
  select option {
    background-color: rgb(51 65 85); /* slate-700 */
    color: rgb(243 244 246); /* gray-100 */
  }

  :global(.dark) select option {
    background-color: rgb(17 24 39); /* gray-900 */
    color: rgb(243 244 246); /* gray-100 */
  }
</style>