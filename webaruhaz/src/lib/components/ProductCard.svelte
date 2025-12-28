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
  backdrop-blur-xl border
  bg-white/30 border-white/50 hover:border-white/70 shadow-lg hover:shadow-xl
  dark:bg-white/[0.08] dark:border-white/[0.15] dark:hover:border-white/[0.25]
  dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] dark:hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.5)]
">
  
  <!-- Icon Circle -->
  <div class="w-12 h-12 rounded-full flex items-center justify-center mb-3 backdrop-blur-md transition-all duration-300
    bg-white/40 border border-white/30
    dark:bg-white/[0.12] dark:border-white/[0.2]">
    <Coffee class="text-gray-800 dark:text-white w-6 h-6 transition-colors duration-300" />
  </div>

  <!-- Title & Price -->
  <h3 class="text-gray-800 dark:text-white font-bold text-lg drop-shadow-sm transition-colors duration-300">{product.name}</h3>
  <p class="text-gray-700 dark:text-gray-300 text-sm mb-4 transition-colors duration-300">{product.price} Ft</p>

  <!-- Selectors -->
  <div class="w-full space-y-2 mb-4">
    <select bind:value={milk} class="w-full text-sm rounded-lg px-3 py-2 outline-none cursor-pointer appearance-none backdrop-blur-md transition-all duration-300
      bg-white/40 focus:ring-2 focus:ring-white/50 text-gray-800 border border-white/30
      dark:bg-white/[0.1] dark:focus:ring-2 dark:focus:ring-purple-400/50 dark:text-gray-200 dark:border-white/[0.15]">
      <option value="Mandula tej">Mandula tej</option>
      <option value="Tehéntej">Tehéntej</option>
      <option value="Zabtej">Zabtej</option>
    </select>

    <select bind:value={sugar} class="w-full text-sm rounded-lg px-3 py-2 outline-none cursor-pointer appearance-none backdrop-blur-md transition-all duration-300
      bg-white/40 focus:ring-2 focus:ring-white/50 text-gray-800 border border-white/30
      dark:bg-white/[0.1] dark:focus:ring-2 dark:focus:ring-purple-400/50 dark:text-gray-200 dark:border-white/[0.15]">
      <option value="Cukor mennyiség" disabled>Cukor mennyiség</option>
      <option value="Nincs">Nincs</option>
      <option value="1 kanál">1 kanál</option>
      <option value="2 kanál">2 kanál</option>
    </select>
  </div>

  <!-- Quantity Control -->
  <div class="flex items-center space-x-3 mb-4">
    <button on:click={decrease} class="w-8 h-8 flex items-center justify-center rounded-lg transition-all backdrop-blur-md
      text-gray-800 bg-white/40 hover:bg-white/50 border border-white/30
      dark:text-white dark:bg-white/[0.1] dark:hover:bg-white/[0.15] dark:border-white/[0.15]">
      <Minus size={14} />
    </button>
    <span class="text-gray-800 dark:text-white font-bold w-8 drop-shadow-md transition-colors duration-300">{quantity} db</span>
    <button on:click={increase} class="w-8 h-8 flex items-center justify-center rounded-lg transition-all backdrop-blur-md
      text-gray-800 bg-white/40 hover:bg-white/50 border border-white/30
      dark:text-white dark:bg-white/[0.1] dark:hover:bg-white/[0.15] dark:border-white/[0.15]">
      <Plus size={14} />
    </button>
  </div>

  <!-- Button -->
  <button on:click={handleAddToCart} class="w-full py-2 rounded-xl font-medium text-sm transition-all backdrop-blur-md
    text-gray-800 bg-white/50 hover:bg-white/60 border border-white/40 hover:shadow-md
    dark:text-white dark:bg-white/[0.12] dark:hover:bg-white/[0.18] dark:border-white/[0.2] dark:hover:shadow-lg">
    Kosárba
  </button>
</div>

<style>
  /* Ensure dropdown options are always visible with proper contrast */
  select option {
    background-color: rgb(226 232 240); /* slate-200 for light mode */
    color: rgb(31 41 55); /* gray-800 */
  }

  :global(.dark) select option {
    background-color: rgba(15, 15, 26, 0.95); /* Very dark with slight transparency */
    color: rgb(229 231 235); /* gray-200 */
  }
</style>