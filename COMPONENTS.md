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
  id: string;
  name: string;
  price: number;
  image?: string | null;
}
```

**Mezők**:

| Mező | Típus | Leírás |
|------|-------|--------|
| `id` | `string` | A termék egyedi azonosítója (8 karakteres hex) |
| `name` | `string` | A termék megjelenítési neve (pl. "Cappuccino") |
| `price` | `number` | A termék ára magyar forintban |
| `image` | `string \| null` | A termék képének URL-je (opcionális) |

**Példa**:

```typescript
const product: Product = {
  id: 'a1b2c3d4',
  name: 'Cappuccino',
  price: 850,
  image: '/images/cappuccino.jpg'
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
| `milk` | `string` | Választott tej típus | "Almond", "Cow", "Oat" |
| `sugar` | `string` | Cukor mennyiség | "None", "1 spoon", "2 spoons" |

**Példa**:

```typescript
const modifiers: Modifiers = {
  milk: 'Oat',
  sugar: '1 spoon'
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
  id: 'a1b2c3d4',
  name: 'Cappuccino',
  price: 850,
  quantity: 2,
  modifiers: {
    milk: 'Oat',
    sugar: '1 spoon'
  }
};
```

---

### `OrderItem`

Egy rendelésben található termék adatai.

**Fájl**: [`src/lib/types.ts`](src/lib/types.ts)

```typescript
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  modifiers: Modifiers;
}
```

**Mezők**:

| Mező | Típus | Leírás |
|------|-------|--------|
| `name` | `string` | A termék neve |
| `quantity` | `number` | A rendelt mennyiség |
| `price` | `number` | A termék ára |
| `modifiers` | `Modifiers` | A termékhez választott módosítások |

---

### `Address`

A vásárló szállítási címének adatai.

**Fájl**: [`src/lib/types.ts`](src/lib/types.ts)

```typescript
interface Address {
  zip: string;
  city: string;
  street: string;
  house: string;
}
```

**Mezők**:

| Mező | Típus | Leírás |
|------|-------|--------|
| `zip` | `string` | Irányítószám |
| `city` | `string` | Város |
| `street` | `string` | Utca |
| `house` | `string` | Házszám |

---

### `Order`

Egy teljes rendelés összes adata az admin felület számára.

**Fájl**: [`src/lib/types.ts`](src/lib/types.ts)

```typescript
interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: Address;
  orderDate: string;
  shipped: boolean;
  shippedDate: string | null;
  items: OrderItem[];
}
```

**Mezők**:

| Mező | Típus | Leírás |
|------|-------|--------|
| `id` | `string` | A rendelés egyedi azonosítója |
| `customerName` | `string` | A vásárló neve |
| `email` | `string` | A vásárló email címe |
| `phone` | `string` | A vásárló telefonszáma |
| `address` | `Address` | A szállítási cím |
| `orderDate` | `string` | A rendelés dátuma (ISO formátum) |
| `shipped` | `boolean` | Postázási státusz |
| `shippedDate` | `string \| null` | A postázás dátuma |
| `items` | `OrderItem[]` | A rendelés tételei |

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

| ID | Név | Ár (Ft) |
|----|-----|---------|
| 1 | Cappuccino | 850 |
| 2 | Espresso | 650 |
| 3 | Ristretto | 850 |
| 4 | Latte | 900 |
| 5 | Americano | 700 |
| 6 | Doppio | 800 |

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

### `ThemeDecorations`

Téma dekorációk komponens - csillagok és felhők.

**Fájl**: [`src/lib/components/ThemeDecorations.svelte`](src/lib/components/ThemeDecorations.svelte)

#### Funkciók

- **100 csillag**: Véletlenszerű pozíció, villogó animáció (sötét mód)
- **5 felhő**: Véletlenszerű pozíció, lebegő animáció (világos mód)
- **Égi test**: Nap (világos) / Hold (sötét)

#### Használat

```svelte
<script>
  import ThemeDecorations from '$lib/components/ThemeDecorations.svelte';
</script>

<ThemeDecorations />
```

---

## Utility Függvények

### Validációs függvények

**Fájl**: [`src/lib/utils.ts`](src/lib/utils.ts)

A checkout űrlap mezőinek validálására szolgáló függvények.

| Függvény | Leírás |
|----------|--------|
| `validateEmail(email)` | Email cím formátum ellenőrzése |
| `validatePhone(phone)` | Magyar telefonszám formátum ellenőrzése (+36/06 + 20/30/70 + 7 számjegy) |
| `validateZip(zip)` | Irányítószám ellenőrzése (4 számjegy) |
| `validateCity(city)` | Település név ellenőrzése (magyar ékezetes betűk) |
| `validateStreet(street)` | Cím ellenőrzése (utca, házszám) |

**Hibaüzenetek**: A `validationErrors` objektum tartalmazza a magyar nyelvű hibaüzeneteket.

---

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

