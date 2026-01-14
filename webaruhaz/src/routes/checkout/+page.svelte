<!--
  @component CheckoutPage

  Pénztár oldal - rendelési adatok megadása és kosár összesítő

  Ez az oldal a vásárlás folyamat utolsó lépése, ahol a vásárló megadja
  a szállítási adatait és véglegesíti a rendelést.

  ## Funkciók

  ### Rendelési űrlap (bal oldal - shadcn-svelte komponensekkel)
  - **Személyes adatok**: Teljes név, Email, Telefonszám
  - **Szállítási cím**: Irányítószám, Település, Utca és házszám
  - **shadcn-svelte Input komponensek**: Glassmorphism stílussal testreszabva
  - **Validáció**: Minden mező kötelező, hiányzó mezők esetén alert

  ### Rendelés összesítő (jobb oldal - shadcn-svelte Card)
  - **Kosár tartalom**: Összes kosárban lévő termék megjelenítése
  - **Termék részletek**: Név, mennyiség, ár, módosítók (tej, cukor)
  - **Végösszeg kalkuláció**: Automatikus számítás az összes tételből
  - **Üres kosár kezelés**: Ha nincs termék, figyelmeztető üzenet

  ### Rendelés leadása
  - **Form validáció**: Minden mező kitöltésének ellenőrzése
  - **Order objektum létrehozása**: TypeScript Order interfész szerint
  - **Rendelés mentése**: orders store-ba írás (admin felület számára)
  - **Kosár ürítése**: cartItems store törlése sikeres rendelés után
  - **Visszairányítás**: Automatikus navigáció a főoldalra

  ## Design

  - **Layout**: 2 oszlopos grid (1 oszlop mobilon, 2 oszlop desktop-on)
  - **Glassmorphism**: Egységes átlátszó design mindkét témában
  - **Animációk**: Csillagok (dark mode), Felhők (light mode)
  - **Celestial body**: Nap/hold animáció a háttérben
  - **Reszponzív**: Mobil-first megközelítés

  @example
  ```svelte
  <!-- Navigáció a checkout oldalra -->
  <a href="/checkout">
    <button>Megrendelés</button>
  </a>
  ```
-->
<script lang="ts">
  import { Sun, Moon, ArrowLeft, ShoppingCart } from '@lucide/svelte';
  import { isDarkMode } from '$lib/theme';
  import { cartItems, cartTotal } from '$lib/cart';
  import { orders } from '$lib/orders';
  import type { Order } from '$lib/types';

  // UI Components - shadcn-svelte komponensek glassmorphism testreszabással
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import * as Card from '$lib/components/ui/card';

  /**
   * Form adatok - Svelte 5 $state runes használata reaktív változókhoz
   *
   * Ezek a változók tárolják a rendelési űrlap mezőinek értékeit.
   * A $state rune biztosítja, hogy minden változás automatikusan frissítse a UI-t.
   */
  let fullName = $state('');   // Vevő teljes neve
  let email = $state('');      // Email cím értesítésekhez
  let phone = $state('');      // Telefonszám kapcsolattartáshoz
  let zip = $state('');        // Irányítószám (pl. "1234")
  let city = $state('');       // Település neve (pl. "Budapest")
  let street = $state('');     // Utca és házszám (pl. "Fő utca 123.")

  /**
   * Témaváltó függvény
   *
   * Invertálja a jelenlegi téma állapotot (világos ↔ sötét).
   * Az isDarkMode store automatikusan menti a változást localStorage-ba.
   */
  function toggleTheme() {
    isDarkMode.update(v => !v);
  }

  /**
   * Rendelés leadása és validáció
   *
   * Ez a függvény az alábbi lépéseket hajtja végre:
   * 1. **Form validáció**: Ellenőrzi, hogy minden mező ki van-e töltve
   * 2. **Kosár validáció**: Ellenőrzi, hogy van-e legalább 1 termék a kosárban
   * 3. **Order objektum létrehozása**: TypeScript Order interfész alapján
   * 4. **Rendelés mentése**: orders store-ba írás az admin felület számára
   * 5. **Kosár ürítése**: cartItems store törlése a sikeres rendelés után
   * 6. **Visszairányítás**: Automatikus navigáció a főoldalra
   *
   * @fires alert - Hibaüzenet ha validáció sikertelen
   * @fires alert - Sikeres rendelés megerősítő üzenet
   */
  function submitOrder() {
    // 1. Form validáció - minden mező kötelező
    if (!fullName || !email || !phone || !zip || !city || !street) {
      alert('Kérjük, töltsd ki az összes mezőt!');
      return;
    }

    // 2. Kosár validáció - legalább 1 terméknek kell lennie
    if ($cartItems.length === 0) {
      alert('A kosár üres!');
      return;
    }

    // 3. Order objektum létrehozása - TypeScript Order interfész szerint
    const newOrder: Order = {
      id: Date.now(),                    // Egyedi ID timestamp alapján
      customerName: fullName,            // Vevő neve
      email,                             // Email cím
      phone,                             // Telefonszám
      address: {                         // Szállítási cím
        zip,                             // Irányítószám
        city,                            // Település
        street,                          // Utca, házszám
        house: ''                        // Házszám (külön mező - jelenleg üres)
      },
      items: $cartItems.map(item => ({  // Kosár tételek átalakítása OrderItem-re
        name: item.name,                 // Termék neve
        price: item.price,               // Termék ára
        quantity: item.quantity,         // Mennyiség
        modifiers: item.modifiers        // Módosítók (tej, cukor)
      })),
      orderDate: new Date().toISOString(), // Rendelés dátuma ISO formátumban
      shipped: false,                    // Alapértelmezetten még nincs postázva
      shippedDate: null                  // Postázás dátuma (null amíg nincs postázva)
    };

    // 4. Rendelés mentése - orders store frissítése
    orders.update(currentOrders => [...currentOrders, newOrder]);

    // 5. Kosár ürítése - sikeres rendelés után a kosár törlődik
    cartItems.set([]);

    // 6. Visszairányítás - automatikus navigáció a főoldalra
    alert('Rendelés sikeresen leadva! Köszönjük a vásárlást!');
    window.location.href = '/';
  }

  /**
   * Csillag interfész
   */
  interface Star {
    x: number;
    y: number;
    size: number;
    opacity: number;
    delay: number;
  }

  /**
   * Csillagok generálása
   */
  const stars: Star[] = [];
  const starCount = 100;

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.5,
      delay: Math.random() * 4
    });
  }

  /**
   * Felhő interfész
   */
  interface Cloud {
    x: number;
    y: number;
    size: number;
    opacity: number;
    delay: number;
  }

  /**
   * Felhők generálása
   */
  const clouds: Cloud[] = [];
  const cloudCount = 5;

  for (let i = 0; i < cloudCount; i++) {
    clouds.push({
      x: Math.random() * 100,
      y: Math.random() * 60,
      size: Math.random() * 60 + 40,
      opacity: Math.random() * 0.3 + 0.3,
      delay: Math.random() * 20
    });
  }
</script>

<!-- Main Container -->
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
        <div class="cloud-part" style="width: {cloud.size}px; height: {cloud.size * 0.6}px; left: 0;"></div>
        <div class="cloud-part" style="width: {cloud.size * 0.8}px; height: {cloud.size * 0.7}px; left: {cloud.size * 0.3}px; top: {cloud.size * 0.1}px;"></div>
        <div class="cloud-part" style="width: {cloud.size * 0.9}px; height: {cloud.size * 0.65}px; left: {cloud.size * 0.5}px; top: -{cloud.size * 0.05}px;"></div>
        <div class="cloud-part" style="width: {cloud.size * 0.7}px; height: {cloud.size * 0.6}px; left: {cloud.size * 0.8}px; top: {cloud.size * 0.08}px;"></div>
      </div>
    {/each}
  </div>

  <!-- Celestial Body -->
  <div class="absolute top-20 right-[-50px] rounded-full blur-[2px] transition-all duration-1000
    w-32 h-32 bg-yellow-300 opacity-90 shadow-[0_0_50px_rgba(253,224,71,0.5)]
    dark:bg-yellow-100 dark:opacity-80 dark:shadow-[0_0_50px_rgba(255,255,255,0.2)]">
  </div>

  <!-- HEADER -->
  <header class="flex justify-center items-center py-8 relative px-4 z-20 max-w-7xl mx-auto">
    <!-- Back Button -->
    <div class="absolute left-4 top-8">
      <a href="/">
        <Button variant="default" size="icon">
          {#snippet children()}
            <ArrowLeft size={20} />
          {/snippet}
        </Button>
      </a>
    </div>

    <!-- Title Box -->
    <div class="backdrop-blur-xl border px-8 py-3 rounded-2xl flex items-center space-x-3 transition-all duration-300
      bg-white/20 border-white/30 shadow-lg
      dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
      <ShoppingCart class="text-gray-800 dark:text-white transition-colors duration-300" />
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white tracking-wide drop-shadow-md transition-colors duration-300">Pénztár</h1>
    </div>

    <!-- Theme Toggle Button -->
    <div class="absolute right-4 top-8">
      <Button variant="default" size="icon" onclick={toggleTheme}>
        {#snippet children()}
          {#if $isDarkMode}
            <Sun size={20} class="text-yellow-400" />
          {:else}
            <Moon size={20} />
          {/if}
        {/snippet}
      </Button>
    </div>
  </header>

  <!-- MAIN CONTENT -->
  <main class="max-w-7xl mx-auto px-4 z-10 relative pb-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Szállítási adatok Form -->
      <Card.Root>
        <Card.Header>
          <Card.Title>Szállítási adatok</Card.Title>
        </Card.Header>
        <Card.Content class="space-y-4">
          <div class="space-y-2">
            <Label for="fullName">Teljes név</Label>
            <Input id="fullName" type="text" placeholder="Kovács János" bind:value={fullName} required />
          </div>

          <div class="space-y-2">
            <Label for="email">Email cím</Label>
            <Input id="email" type="email" placeholder="pelda@email.hu" bind:value={email} required />
          </div>

          <div class="space-y-2">
            <Label for="phone">Telefonszám</Label>
            <Input id="phone" type="tel" placeholder="+36 30 123 4567" bind:value={phone} required />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="zip">Irányítószám</Label>
              <Input id="zip" type="text" placeholder="1234" bind:value={zip} required />
            </div>
            <div class="space-y-2">
              <Label for="city">Település</Label>
              <Input id="city" type="text" placeholder="Budapest" bind:value={city} required />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="street">Cím (Utca, házszám)</Label>
            <Input id="street" type="text" placeholder="Fő utca 123." bind:value={street} required />
          </div>

          <Button onclick={submitOrder} class="w-full mt-6">
            {#snippet children()}
              Rendelés leadása
            {/snippet}
          </Button>
        </Card.Content>
      </Card.Root>

      <!-- Kosár összesítő -->
      <Card.Root>
        <Card.Header>
          <Card.Title>Rendelés összesítő</Card.Title>
        </Card.Header>
        <Card.Content>
          {#if $cartItems.length === 0}
            <div class="text-center py-8 text-gray-700 dark:text-white/60">
              A kosár üres.
            </div>
          {:else}
            <div class="space-y-3 max-h-96 overflow-y-auto">
              {#each $cartItems as item}
                <div class="flex justify-between items-start p-4 rounded-xl backdrop-blur-xl border
                  bg-white/40 border-white/50
                  dark:bg-white/[0.05] dark:border-white/[0.1]">
                  <div class="flex-1">
                    <div class="font-semibold text-gray-800 dark:text-white text-lg">
                      {item.name} <span class="text-gray-600 dark:text-white/80">x{item.quantity}</span>
                    </div>
                    <div class="text-sm text-gray-700 dark:text-white mt-2">
                      <div>Tej: <span class="font-medium">{item.modifiers.milk}</span></div>
                      <div>Cukor: <span class="font-medium">{item.modifiers.sugar}</span></div>
                    </div>
                  </div>
                  <div class="font-bold text-gray-800 dark:text-white text-lg">
                    {item.price * item.quantity} Ft
                  </div>
                </div>
              {/each}
            </div>

            <div class="mt-6 pt-6 border-t border-gray-800/20 dark:border-white/20 flex justify-between items-center">
              <span class="text-xl font-bold text-gray-800 dark:text-white">Végösszeg:</span>
              <span class="text-2xl font-bold text-gray-800 dark:text-white">
                {$cartTotal} Ft
              </span>
            </div>
          {/if}
        </Card.Content>
      </Card.Root>
    </div>
  </main>

  <footer class="text-center text-white/60 text-xs py-4 relative w-full z-10 mt-8">
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
