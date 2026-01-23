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
  - **Form adatok törlése**: localStorage-ból töröljük a mentett adatokat
  - **Visszairányítás**: Automatikus navigáció a főoldalra

  ### Form adatok perzisztencia
  - **Opcionális mentés**: A felhasználó eldöntheti, hogy elmentse-e az adatait checkbox-szal
  - **Automatikus betöltés**: Az oldal betöltésekor visszaállnak a korábban mentett adatok
  - **Preferencia megjegyzése**: A mentési beállítás is megmarad a következő látogatásig

  ## Design

  - **Layout**: 2 oszlopos grid (1 oszlop mobilon, 2 oszlop desktop-on)
  - **Glassmorphism**: Egységes átlátszó design mindkét témában
  - **Animációk**: Csillagok (dark mode), Felhők (light mode)
  - **Celestial body**: Nap/hold animáció a háttérben
  - **Reszponzív**: Mobil-first megközelítés
-->
<script lang="ts">
  import { Sun, Moon, ArrowLeft, ShoppingCart } from '@lucide/svelte';
  import { isDarkMode } from '$lib/theme';
  import ThemeDecorations from '$lib/components/ThemeDecorations.svelte';
  import { cartItems, cartTotal } from '$lib/cart';
  import { createOrder } from '$lib/api';
  import type { CreateOrderInput } from '$lib/api';
  import {
    validateEmail,
    validatePhone,
    validateZip,
    validateCity,
    validateStreet,
    validationErrors
  } from '$lib/utils';
  import { onMount } from 'svelte';

  // UI Components - shadcn-svelte komponensek glassmorphism testreszabással
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import * as Card from '$lib/components/ui/card';

  // localStorage kulcsok a checkout adatok tárolásához
  const CHECKOUT_STORAGE_KEY = 'checkoutFormData';
  const SAVE_PREFERENCE_KEY = 'checkoutSavePreference';

  /**
   * Form adatok - Svelte 5 $state runes használata reaktív változókhoz
   *
   * Ezek a változók tárolják a rendelési űrlap mezőinek értékeit.
   * A $state rune biztosítja, hogy minden változás automatikusan frissítse a UI-t.
   * Az adatok automatikusan mentődnek localStorage-ba, és betöltődnek az oldal megnyitásakor.
   */
  let fullName = $state('');   // Vevő teljes neve
  let email = $state('');      // Email cím értesítésekhez
  let phone = $state('');      // Telefonszám kapcsolattartáshoz
  let zip = $state('');        // Irányítószám (pl. "1234")
  let city = $state('');       // Település neve (pl. "Budapest")
  let street = $state('');     // Utca és házszám (pl. "Fő utca 123.")

  /**
   * Adatok mentése beállítás
   *
   * Ha true, a form adatok mentődnek localStorage-ba a következő rendeléshez.
   * Ha false, a form adatok nem mentődnek, és rendelés után törlődnek.
   */
  let saveFormData = $state(false);

  /**
   * Form adatok és mentési beállítás betöltése localStorage-ból
   *
   * Ez a függvény az oldal betöltésekor fut le, és visszaállítja
   * a korábban mentett form adatokat, ha a felhasználó korábban
   * bekapcsolta az adatok mentését.
   */
  onMount(() => {
    try {
      // Mentési beállítás betöltése
      const savedPreference = localStorage.getItem(SAVE_PREFERENCE_KEY);
      if (savedPreference !== null) {
        saveFormData = savedPreference === 'true';
      }

      // Form adatok betöltése, ha volt korábban mentés
      const saved = localStorage.getItem(CHECKOUT_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        fullName = data.fullName || '';
        email = data.email || '';
        phone = data.phone || '';
        zip = data.zip || '';
        city = data.city || '';
        street = data.street || '';
      }
    } catch (error) {
      console.error('Hiba a checkout adatok betöltésekor:', error);
    }
  });

  /**
   * Mentési beállítás automatikus mentése localStorage-ba
   *
   * Ez az effect figyeli a saveFormData változását, és menti localStorage-ba.
   */
  $effect(() => {
    try {
      localStorage.setItem(SAVE_PREFERENCE_KEY, String(saveFormData));
    } catch (error) {
      console.error('Hiba a mentési beállítás mentésekor:', error);
    }
  });

  /**
   * Form adatok automatikus mentése localStorage-ba
   *
   * Ez az effect figyeli a form mezők változásait, és automatikusan
   * menti őket localStorage-ba, ha a felhasználó engedélyezte.
   */
  $effect(() => {
    if (!saveFormData) {
      // Ha ki van kapcsolva a mentés, töröljük a mentett adatokat
      try {
        localStorage.removeItem(CHECKOUT_STORAGE_KEY);
      } catch (error) {
        console.error('Hiba a checkout adatok törlésekor:', error);
      }
      return;
    }

    const data = {
      fullName,
      email,
      phone,
      zip,
      city,
      street
    };
    try {
      localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Hiba a checkout adatok mentésekor:', error);
    }
  });

  /**
   * Validációs hibaüzenetek - Svelte 5 $state runes
   *
   * Ezek a változók tárolják az egyes mezők validációs hibaüzeneteit.
   * Ha üres string, akkor nincs hiba az adott mezőnél.
   */
  let fullNameError = $state('');
  let emailError = $state('');
  let phoneError = $state('');
  let zipError = $state('');
  let cityError = $state('');
  let streetError = $state('');

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
   * Valós idejű mező validáció
   *
   * Ez a függvény egyetlen mező validációját végzi el, amikor a felhasználó
   * befejezi a szerkesztést (onblur esemény). Jobb UX élményt nyújt, mert azonnal
   * látható a hiba, nem kell megvárni a form elküldését.
   *
   * @param field - A validálandó mező neve
   */
  function validateField(field: 'fullName' | 'email' | 'phone' | 'zip' | 'city' | 'street') {
    switch (field) {
      case 'fullName':
        if (!fullName.trim()) {
          fullNameError = validationErrors.required;
        } else {
          fullNameError = '';
        }
        break;
      case 'email':
        if (!email.trim()) {
          emailError = validationErrors.required;
        } else if (!validateEmail(email)) {
          emailError = validationErrors.email;
        } else {
          emailError = '';
        }
        break;
      case 'phone':
        if (!phone.trim()) {
          phoneError = validationErrors.required;
        } else if (!validatePhone(phone)) {
          phoneError = validationErrors.phone;
        } else {
          phoneError = '';
        }
        break;
      case 'zip':
        if (!zip.trim()) {
          zipError = validationErrors.required;
        } else if (!validateZip(zip)) {
          zipError = validationErrors.zip;
        } else {
          zipError = '';
        }
        break;
      case 'city':
        if (!city.trim()) {
          cityError = validationErrors.required;
        } else if (!validateCity(city)) {
          cityError = validationErrors.city;
        } else {
          cityError = '';
        }
        break;
      case 'street':
        if (!street.trim()) {
          streetError = validationErrors.required;
        } else if (!validateStreet(street)) {
          streetError = validationErrors.street;
        } else {
          streetError = '';
        }
        break;
    }
  }

  /**
   * Rendelés leadása és validáció
   *
   * Ez a függvény az alábbi lépéseket hajtja végre:
   * 1. **Form validáció**: Ellenőrzi, hogy minden mező ki van-e töltve és helyes formátumú
   * 2. **Kosár validáció**: Ellenőrzi, hogy van-e legalább 1 termék a kosárban
   * 3. **Order objektum létrehozása**: API CreateOrderInput interfész alapján
   * 4. **Rendelés mentése**: API hívás a backend felé (adatbázisba ír)
   * 5. **Kosár ürítése**: cartItems store törlése a sikeres rendelés után
   * 6. **Form adatok törlése**: localStorage-ból töröljük a mentett adatokat
   * 7. **Visszairányítás**: Automatikus navigáció a főoldalra
   *
   * @fires alert - Hibaüzenet ha validáció sikertelen vagy API hiba történik
   * @fires alert - Sikeres rendelés megerősítő üzenet
   */
  async function submitOrder() {
    // Hibaüzenetek visszaállítása
    fullNameError = '';
    emailError = '';
    phoneError = '';
    zipError = '';
    cityError = '';
    streetError = '';

    let hasError = false;

    // 1. Form validáció - minden mező kötelező és formátum ellenőrzés
    if (!fullName.trim()) {
      fullNameError = validationErrors.required;
      hasError = true;
    }

    if (!email.trim()) {
      emailError = validationErrors.required;
      hasError = true;
    } else if (!validateEmail(email)) {
      emailError = validationErrors.email;
      hasError = true;
    }

    if (!phone.trim()) {
      phoneError = validationErrors.required;
      hasError = true;
    } else if (!validatePhone(phone)) {
      phoneError = validationErrors.phone;
      hasError = true;
    }

    if (!zip.trim()) {
      zipError = validationErrors.required;
      hasError = true;
    } else if (!validateZip(zip)) {
      zipError = validationErrors.zip;
      hasError = true;
    }

    if (!city.trim()) {
      cityError = validationErrors.required;
      hasError = true;
    } else if (!validateCity(city)) {
      cityError = validationErrors.city;
      hasError = true;
    }

    if (!street.trim()) {
      streetError = validationErrors.required;
      hasError = true;
    } else if (!validateStreet(street)) {
      streetError = validationErrors.street;
      hasError = true;
    }

    if (hasError) {
      alert('Kérjük, javítsd ki a hibás mezőket!');
      return;
    }

    // 2. Kosár validáció - legalább 1 terméknek kell lennie
    if ($cartItems.length === 0) {
      alert('A kosár üres!');
      return;
    }

    try {
      // 3. Order objektum létrehozása - API CreateOrderInput interfész szerint
      const orderData: CreateOrderInput = {
        vevo_nev: fullName,              // Vevő teljes neve
        telefon: phone,                  // Telefonszám
        email: email,                    // Email cím
        iranyitoszam: zip,               // Irányítószám
        telepules: city,                 // Település neve
        utca_hazszam: street,            // Utca és házszám
        items: $cartItems.map(item => ({ // Kosár tételek átalakítása backend formátumra
          termek_nev: item.name,         // Termék neve
          termek_ar: item.price,         // Termék ára
          mennyiseg: item.quantity,      // Mennyiség
          tej: item.modifiers.milk,      // Tej típusa
          cukor: item.modifiers.sugar    // Cukor mennyisége
        }))
      };

      // 4. Rendelés mentése - API hívás (adatbázisba írás)
      await createOrder(orderData);

      // 5. Kosár ürítése - sikeres rendelés után a kosár törlődik
      cartItems.set([]);

      // 6. Form adatok kezelése - ha saveFormData ki van kapcsolva, már törlődött a $effect által
      // Ha be van kapcsolva, a form adatok megmaradnak a következő rendeléshez

      // 7. Visszairányítás - automatikus navigáció a főoldalra
      alert('Rendelés sikeresen leadva! Köszönjük a vásárlást!');
      window.location.href = '/';
    } catch (error) {
      // API hiba kezelése - felhasználóbarát hibaüzenet
      console.error('Rendelés hiba:', error);
      alert('Hiba történt a rendelés leadása során. Kérjük, próbáld újra!');
    }
  }

</script>

<!-- Main Container -->
<div class="min-h-screen relative overflow-hidden font-sans transition-colors duration-700
  bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500
  dark:bg-gradient-to-br dark:from-[#0d0e1a] dark:via-[#0d0e1a] dark:to-[#0d0e1a]">

  <!-- DECORATIONS -->
  <ThemeDecorations />

  <!-- HEADER -->
  <header class="flex justify-center items-center py-8 relative px-4 z-20 max-w-7xl mx-auto">
    <!-- Back Button -->
    <div class="absolute left-4 top-8">
      <Button variant="outline" size="icon" href="/">
        {#snippet children()}
          <ArrowLeft size={20} />
        {/snippet}
      </Button>
    </div>

    <!-- Title Card -->
    <Card.Root class="border-white/30 shadow-lg backdrop-blur-xl bg-white/20 dark:bg-white/[0.03] dark:border-white/[0.08] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
      <Card.Content class="flex items-center space-x-3 px-8 py-3">
        <ShoppingCart class="text-gray-800 dark:text-white transition-colors duration-300" />
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white tracking-wide drop-shadow-md transition-colors duration-300">Pénztár</h1>
      </Card.Content>
    </Card.Root>

    <!-- Theme Toggle Button -->
    <div class="absolute right-4 top-8">
      <Button variant="outline" size="icon" onclick={toggleTheme}>
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
            <Input id="fullName" type="text" placeholder="Kovács János" bind:value={fullName} onblur={() => validateField('fullName')} required class={fullNameError ? 'border-red-500 focus-visible:ring-red-500' : ''} />
            {#if fullNameError}
              <p class="text-sm text-red-600 dark:text-red-400">{fullNameError}</p>
            {/if}
          </div>

          <div class="space-y-2">
            <Label for="email">Email cím</Label>
            <Input id="email" type="email" placeholder="pelda@email.hu" bind:value={email} onblur={() => validateField('email')} required class={emailError ? 'border-red-500 focus-visible:ring-red-500' : ''} />
            {#if emailError}
              <p class="text-sm text-red-600 dark:text-red-400">{emailError}</p>
            {/if}
          </div>

          <div class="space-y-2">
            <Label for="phone">Telefonszám</Label>
            <Input id="phone" type="tel" placeholder="+36 30 123 4567" bind:value={phone} onblur={() => validateField('phone')} required class={phoneError ? 'border-red-500 focus-visible:ring-red-500' : ''} />
            {#if phoneError}
              <p class="text-sm text-red-600 dark:text-red-400">{phoneError}</p>
            {/if}
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="zip">Irányítószám</Label>
              <Input id="zip" type="text" placeholder="1234" bind:value={zip} onblur={() => validateField('zip')} required class={zipError ? 'border-red-500 focus-visible:ring-red-500' : ''} />
              {#if zipError}
                <p class="text-sm text-red-600 dark:text-red-400">{zipError}</p>
              {/if}
            </div>
            <div class="space-y-2">
              <Label for="city">Település</Label>
              <Input id="city" type="text" placeholder="Budapest" bind:value={city} onblur={() => validateField('city')} required class={cityError ? 'border-red-500 focus-visible:ring-red-500' : ''} />
              {#if cityError}
                <p class="text-sm text-red-600 dark:text-red-400">{cityError}</p>
              {/if}
            </div>
          </div>

          <div class="space-y-2">
            <Label for="street">Cím (Utca, házszám)</Label>
            <Input id="street" type="text" placeholder="Fő utca 123." bind:value={street} onblur={() => validateField('street')} required class={streetError ? 'border-red-500 focus-visible:ring-red-500' : ''} />
            {#if streetError}
              <p class="text-sm text-red-600 dark:text-red-400">{streetError}</p>
            {/if}
          </div>

          <div class="flex items-center space-x-2 pt-2">
            <Checkbox id="saveFormData" bind:checked={saveFormData} />
            <Label for="saveFormData" class="cursor-pointer text-sm font-normal">
              Adataim megjegyzése a következő rendeléshez
            </Label>
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
                <Card.Root class="border-white/50 backdrop-blur-xl bg-white/40 dark:bg-white/[0.05] dark:border-white/[0.1]">
                  <Card.Content class="p-4 flex justify-between items-start">
                    <div class="flex-1">
                      <div class="font-semibold text-gray-800 dark:text-white text-lg">
                        {item.name} <span class="text-gray-600 dark:text-white/80">x{item.quantity}</span>
                      </div>
                      <div class="text-sm text-gray-700 dark:text-white mt-2 space-y-1">
                        <div>Tej: <span class="font-medium">{item.modifiers.milk}</span></div>
                        <div>Cukor: <span class="font-medium">{item.modifiers.sugar}</span></div>
                      </div>
                    </div>
                    <div class="font-bold text-gray-800 dark:text-white text-lg ml-4">
                      {item.price * item.quantity} Ft
                    </div>
                  </Card.Content>
                </Card.Root>
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

