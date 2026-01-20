<!--
  @component ProductCard

  Termék kártya komponens - egyedi termék megjelenítése shadcn-svelte komponensekkel

  Ez a komponens a shadcn-svelte Card, Select és Button komponenseket használja,
  megtartva a glassmorphism stílust.

  @prop {Product} product - A megjelenítendő termék objektum (kötelező)

  Funkciók:
  - Termék név, ár és ikon megjelenítése
  - Tej típus választó (Mandula tej, Tehéntej, Zabtej)
  - Cukor mennyiség választó (Nincs, 1 kanál, 2 kanál)
  - Mennyiség növelő/csökkentő gombok
  - Kosárba helyezés gomb

  @example
  ```svelte
  <ProductCard product={products[0]} />
  ```
-->
<script lang="ts">
  import { Coffee, Minus, Plus } from '@lucide/svelte';
  import { addToCart } from '$lib/cart';
  import type { Product } from '$lib/types';

  // shadcn-svelte components
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import * as Select from '$lib/components/ui/select';
    import { Label } from 'bits-ui';

  /**
   * A megjelenítendő termék
   */
  let { product }: { product: Product } = $props();

  /**
   * Helyi állapot - választott mennyiség
   */
  let quantity = $state(1);

  /**
   * Helyi állapot - választott tej típus
   */
  let milk = $state("Tej típus");

  /**
   * Helyi állapot - választott cukor mennyiség
   */
  let sugar = $state("Cukor mennyiség");

  /**
   * Mennyiség csökkentése
   */
  function decrease() { if (quantity > 1) quantity--; }

  /**
   * Mennyiség növelése
   */
  function increase() { quantity++; }

  /**
   * Kosárba helyezés kezelő
   */
  function handleAddToCart() {
    addToCart(product, quantity, { milk, sugar });
    quantity = 1;
  }
</script>

<Card.Root class="flex flex-col items-center text-center p-6">
  <Card.Content class="flex flex-col items-center w-full space-y-4 p-0">
    <!-- Icon Circle -->
    <div class="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300
      bg-white/40 border border-white/30
      dark:bg-white/[0.12] dark:border-white/[0.2]">
      <Coffee class="text-gray-800 dark:text-white w-6 h-6 transition-colors duration-300" />
    </div>

    <!-- Title & Price -->
    <div>
      <h3 class="text-gray-800 dark:text-white font-bold text-lg drop-shadow-sm transition-colors duration-300">{product.name}</h3>
      <p class="text-gray-700 dark:text-gray-300 text-sm transition-colors duration-300">{product.price} Ft</p>
    </div>

    <!-- Milk Select -->
    <Select.Root type="single" bind:value={milk as any}>
      <Select.Trigger class="w-full">
        {#snippet children()}
          {milk}
        {/snippet}
      </Select.Trigger>
      <Select.Content>
        <Select.Label>Tej típus</Select.Label>
        <Select.Item value="Mandula tej" label="Mandula tej" />
        <Select.Item value="Tehéntej" label="Tehéntej" />
        <Select.Item value="Zabtej" label="Zabtej" />
      </Select.Content>
    </Select.Root>

    <!-- Sugar Select -->
    <Select.Root type="single" bind:value={sugar as any}>
      <Select.Trigger class="w-full">
        {#snippet children()}
          {sugar}
        {/snippet}
      </Select.Trigger>
      <Select.Content>
        <Select.Label>Cukor mennyiség</Select.Label>
        <Select.Item value="Nincs" label="Nincs" />
        <Select.Item value="1 kanál" label="1 kanál" />
        <Select.Item value="2 kanál" label="2 kanál" />
      </Select.Content>
    </Select.Root>

    <!-- Quantity Control -->
    <div class="flex items-center space-x-3">
      <Button variant="ghost" size="icon" onclick={decrease} class="w-8 h-8">
        {#snippet children()}
          <Minus size={14} />
        {/snippet}
      </Button>
      <span class="text-gray-800 dark:text-white font-bold w-8 drop-shadow-md transition-colors duration-300">{quantity} db</span>
      <Button variant="ghost" size="icon" onclick={increase} class="w-8 h-8">
        {#snippet children()}
          <Plus size={14} />
        {/snippet}
      </Button>
    </div>

    <!-- Add to Cart Button -->
    <Button onclick={handleAddToCart} class="w-full">
      {#snippet children()}
        Kosárba
      {/snippet}
    </Button>
  </Card.Content>
</Card.Root>
