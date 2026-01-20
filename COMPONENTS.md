# Komponens és API Dokumentáció

Ez a dokumentum részletesen leírja az alkalmazás összes komponensét, típusát, store-ját és API-ját.

## Tartalomjegyzék

- [TypeScript Típusok](#typescript-típusok)
- [Svelte Stores](#svelte-stores)
- [Komponensek](#komponensek)
- [Utility Függvények](#utility-függvények)

---

## TypeScript Típusok

### `Product`

Egy kávétermék alapvető adatstruktúrája.

**Fájl**: [`src/lib/types.ts`](src/lib/types.ts)

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  type: 'coffee' | 'espresso';
}
```

**Mezők**:

| Mező | Típus | Leírás |
|------|-------|--------|
| `id` | `number` | A termék egyedi azonosítója |
| `name` | `string` | A termék megjelenítési neve (pl. "Cappuccino") |
| `price` | `number` | A termék ára magyar forintban |
| `type` | `'coffee' \| 'espresso'` | A termék kategóriája |

**Példa**:

```typescript
const product: Product = {
  id: 1,
  name: 'Cappuccino',
  price: 850,
  type: 'coffee'
};
```

---

### `Modifiers`

Termék testreszabási lehetőségek.

**Fájl**: [`src/lib/types.ts`](src/lib/types.ts)

```typescript
interface Modifiers {
  milk: string;
  sugar: string;
}
```

**Mezők**:

| Mező | Típus | Leírás | Lehetséges értékek |
|------|-------|--------|-------------------|
| `milk` | `string` | Választott tej típus | "Mandula tej", "Tehéntej", "Zabtej" |
| `sugar` | `string` | Cukor mennyiség | "Cukor mennyiség" (default), "Nincs", "1 kanál", "2 kanál" |

**Példa**:

```typescript
const modifiers: Modifiers = {
  milk: 'Zabtej',
  sugar: '1 kanál'
};
```

---

### `CartItem`

Kosárban lévő termék, amely kiterjeszti a `Product` típust.

**Fájl**: [`src/lib/types.ts`](src/lib/types.ts)

```typescript
interface CartItem extends Product {
  quantity: number;
  modifiers: Modifiers;
}
```

**Mezők** (a `Product` mezőkön felül):

| Mező | Típus | Leírás |
|------|-------|--------|
| `quantity` | `number` | Megrendelt mennyiség (min: 1) |
| `modifiers` | `Modifiers` | Választott testreszabások |

**Példa**:

```typescript
const cartItem: CartItem = {
  id: 1,
  name: 'Cappuccino',
  price: 850,
  type: 'coffee',
  quantity: 2,
  modifiers: {
    milk: 'Zabtej',
    sugar: '1 kanál'
  }
};
```

---

## Svelte Stores

### `cartItems`

Kosár elemek tárolója.

**Fájl**: [`src/lib/cart.ts`](src/lib/cart.ts)

**Típus**: `Writable<CartItem[]>`

**Alapértelmezett érték**: `[]`

**Leírás**: Írható store, amely tartalmazza a kosárban lévő összes terméket.

**Használat**:

```typescript
import { cartItems } from '$lib/cart';

// Feliratkozás (Svelte komponensben)
$: items = $cartItems;

// Direkt olvasás
cartItems.subscribe(items => {
  console.log('Kosár tartalma:', items);
});

// Módosítás
cartItems.update(items => [...items, newItem]);
```

---

### `cartTotal`

Kosár végösszeg számító.

**Fájl**: [`src/lib/cart.ts`](src/lib/cart.ts)

**Típus**: `Readable<number>`

**Leírás**: Származtatott (derived) store, amely automatikusan kiszámítja a kosár teljes értékét.

**Számítás**: `∑(termék_ára × mennyiség)` minden kosárelem esetén

**Használat**:

```svelte
<script>
  import { cartTotal } from '$lib/cart';
</script>

<p>Végösszeg: {$cartTotal} Ft</p>
```

---

### `isDarkMode`

Téma állapot store.

**Fájl**: [`src/lib/theme.ts`](src/lib/theme.ts)

**Típus**: `Writable<boolean>`

**Alapértelmezett érték**:
- `true` (dark mode) - szerveren
- localStorage alapján - kliensen

**Leírás**:
- Írható store a téma állapot kezelésére
- Automatikusan szinkronizálja a DOM-ot (`dark` CSS osztály)
- Automatikusan menti localStorage-ba

**Mellékhatások**:
- Frissíti `document.documentElement.classList` (`dark` osztály)
- Menti a `theme` kulcsot localStorage-ba (`'dark'` vagy `'light'`)

**Használat**:

```svelte
<script>
  import { isDarkMode } from '$lib/theme';

  function toggleTheme() {
    isDarkMode.update(v => !v);
  }
</script>

<button on:click={toggleTheme}>
  {$isDarkMode ? ' Világos' : ' Sötét'}
</button>
```

---

### `products`

Termék katalógus.

**Fájl**: [`src/lib/products.ts`](src/lib/products.ts)

**Típus**: `Product[]` (konstans, nem store)

**Leírás**: Statikus tömb, amely tartalmazza az összes elérhető terméket.

**Termékek listája**:

| ID | Név | Ár (Ft) | Típus |
|----|-----|---------|-------|
| 1 | Cappuccino | 850 | coffee |
| 2 | Espresso | 650 | espresso |
| 3 | Cappuccino | 850 | coffee |
| 4 | Latte | 900 | coffee |
| 5 | Americano | 700 | espresso |
| 6 | Doppio | 800 | espresso |

**Használat**:

```svelte
<script>
  import { products } from '$lib/products';
</script>

{#each products as product}
  <ProductCard {product} />
{/each}
```

---

## Komponensek

### `ProductCard`

Egyedi termék megjelenítő kártya komponens.

**Fájl**: [`src/lib/components/ProductCard.svelte`](src/lib/components/ProductCard.svelte)

#### Props

| Prop | Típus | Kötelező | Leírás |
|------|-------|----------|--------|
| `product` | `Product` |  Igen | A megjelenítendő termék objektum |

#### Helyi állapot

| Változó | Típus | Alapértelmezett | Leírás |
|---------|-------|-----------------|--------|
| `quantity` | `number` | `1` | Kiválasztott mennyiség |
| `milk` | `string` | `"Mandula tej"` | Kiválasztott tej típus |
| `sugar` | `string` | `"Cukor mennyiség"` | Kiválasztott cukor mennyiség |

#### Függvények

**`decrease()`**
- **Leírás**: Csökkenti a mennyiséget 1-gyel
- **Működés**: Csak akkor csökkent, ha `quantity > 1`

**`increase()`**
- **Leírás**: Növeli a mennyiséget 1-gyel
- **Működés**: Nincs felső limit

**`handleAddToCart()`**
- **Leírás**: Kosárba helyezi a terméket
- **Működés**:
  1. Meghívja `addToCart(product, quantity, { milk, sugar })`
  2. Visszaállítja `quantity`-t 1-re

#### UI Elemek

1. **Ikon kör**: Coffee ikon glassmorphism keretben
2. **Termék név és ár**: Félkövér név + ár forintban
3. **Tej választó**: Dropdown menü 3 opcióval
4. **Cukor választó**: Dropdown menü 4 opcióval (placeholder + 3 opció)
5. **Mennyiség választó**: Minus gomb + szám + Plus gomb
6. **Kosárba gomb**: Glassmorphism stílusú gomb

#### Stílus jellemzők

- Glassmorphism design (`backdrop-blur-xl`)
- Világos/sötét téma támogatás
- Hover animációk (border, shadow)
- Egyedi dropdown stílusok mindkét témában
- Responsive padding és spacing

#### Használat

```svelte
<script>
  import ProductCard from '$lib/components/ProductCard.svelte';
  import { products } from '$lib/products';
</script>

<!-- Egyedi termék -->
<ProductCard product={products[0]} />

<!-- Összes termék -->
{#each products as product (product.id)}
  <ProductCard {product} />
{/each}
```

---

### `HomePage` (+page.svelte)

Főoldal komponens - termék katalógus és kosár összesítés.

**Fájl**: [`src/routes/+page.svelte`](src/routes/+page.svelte)

#### Props

Nincs (ez egy route komponens, nem prop-okat fogad).

#### Helyi állapot

**Csillagok** (`stars: Star[]`):
- 100 véletlenszerű pozíciójú csillag
- Villogó animációval (dark mode-ban látható)

**Felhők** (`clouds: Cloud[]`):
- 5 véletlenszerű pozíciójú felhő
- Lebegő animációval (light mode-ban látható)

#### Függvények

**`toggleTheme()`**
- **Leírás**: Váltás világos és sötét téma között
- **Működés**: Invertálja `isDarkMode` store értékét

#### Layout struktúra

```
┌─────────────────────────────────────┐
│ Dekorációk (csillagok/felhők, nap/hold) │
├─────────────────────────────────────┤
│ Header                              │
│  ├─ Cím + Coffee ikon              │
│  └─ Témaváltó gomb (jobb felül)    │
├─────────────────────────────────────┤
│ Main - Termék Grid                 │
│  └─ ProductCard × 6 (1-3 oszlop)   │
├─────────────────────────────────────┤
│ Checkout Bar                        │
│  ├─ Összesen: {$cartTotal} Ft      │
│  └─ Megrendelés gomb               │
├─────────────────────────────────────┤
│ Footer (copyright)                  │
└─────────────────────────────────────┘
```

#### Reszponzív grid

| Képernyőméret | Oszlopok | Breakpoint |
|---------------|----------|------------|
| Mobil | 1 | < 768px |
| Tablet | 2 | 768px - 1024px |
| Desktop | 3 | ≥ 1024px |

#### Animációk

**Twinkle** (csillagok):
```css
@keyframes twinkle {
  0%, 100% { opacity: var(--base-opacity); }
  50% { opacity: calc(var(--base-opacity) * 0.3); }
}
```
- Időtartam: 4s
- Véletlenszerű késleltetés: 0-4s

**Float** (felhők):
```css
@keyframes float {
  0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
  25% { transform: translateY(-15px) translateX(10px) scale(1.05); }
  50% { transform: translateY(-25px) translateX(5px) scale(1.1); }
  75% { transform: translateY(-15px) translateX(-5px) scale(1.05); }
}
```
- Időtartam: 20s
- Véletlenszerű késleltetés: 0-20s

#### Használat

Ez egy route komponens, automatikusan renderelődik a `/` útvonalon.

---

### `RootLayout` (+layout.svelte)

Gyökér layout komponens.

**Fájl**: [`src/routes/+layout.svelte`](src/routes/+layout.svelte)

#### Props

| Prop | Típus | Leírás |
|------|-------|--------|
| `children` | `Snippet` | Gyerek komponensek (SvelteKit által átadott) |

#### Funkciók

1. **Globális CSS betöltés**: `layout.css` import (Tailwind)
2. **Favicon beállítás**: `<svelte:head>` segítségével
3. **Children renderelés**: `{@render children()}`

#### Használat

Automatikusan alkalmazódik minden route-ra. Nincs szükség manuális használatra.

---

## Utility Függvények

### `addToCart`

Termék hozzáadása a kosárhoz.

**Fájl**: [`src/lib/cart.ts`](src/lib/cart.ts)

**Szignatura**:

```typescript
function addToCart(
  product: Product,
  quantity: number,
  modifiers: Modifiers
): void
```

**Paraméterek**:

| Paraméter | Típus | Leírás |
|-----------|-------|--------|
| `product` | `Product` | A hozzáadandó termék |
| `quantity` | `number` | Mennyiség (min: 1) |
| `modifiers` | `Modifiers` | Testreszabási beállítások |

**Működés**:

1. Létrehoz egy új `CartItem` objektumot
2. Hozzáfűzi a `cartItems` store-hoz
3. **Megjegyzés**: Nem ellenőrzi duplikációt, minden hívás új elemet ad hozzá

**Példa**:

```typescript
import { addToCart } from '$lib/cart';
import { products } from '$lib/products';

addToCart(
  products[0],  // Cappuccino
  2,            // 2 darab
  {
    milk: 'Zabtej',
    sugar: '1 kanál'
  }
);
```

**Mellékhatások**:
- Frissíti a `cartItems` store-t
- Automatikusan frissül a `cartTotal` (derived store miatt)

---

## Adatfolyam Diagram

```
┌──────────────┐
│   products   │ (konstans tömb)
└──────┬───────┘
       │
       ▼
┌─────────────────┐
│  ProductCard    │
│  - milk         │
│  - sugar        │
│  - quantity     │
└────────┬────────┘
         │ addToCart()
         ▼
┌─────────────────┐
│   cartItems     │ (Writable Store)
└────────┬────────┘
         │ derived
         ▼
┌─────────────────┐
│   cartTotal     │ (Readable Store)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  HomePage       │
│  (megjelenítés) │
└─────────────────┘
```

---

## Témázás

### Színpaletta

**Világos mód**:
- Háttér: Szürke-kék gradiens (`slate-700` → `slate-500`)
- Kártyák: `bg-white/30` + `border-white/50`
- Szöveg: `text-gray-800`
- Hover: `border-white/70`, erősebb árnyék

**Sötét mód**:
- Háttér: Nagyon sötét kék-fekete (`#0d0e1a`)
- Kártyák: `bg-white/[0.08]` + `border-white/[0.15]`
- Szöveg: `text-white` / `text-gray-200`
- Akcentus: Rózsaszín-lila (`pink-500`, `purple-500`)
- Hover: `border-white/[0.25]`, sötétebb árnyék

### Glassmorphism hatás

Minden kártya és panel glassmorphism stílust használ:

```css
backdrop-blur-xl          /* Elmosódott háttér */
bg-white/[0.08]          /* Átlátszó fehér overlay */
border-white/[0.15]      /* Vékony világos keret */
shadow-[...]             /* Árnyék */
```