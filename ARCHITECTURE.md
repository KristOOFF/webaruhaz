# Architektúra Dokumentáció

## Áttekintés

A NeoCoffee webáruház egy full-stack alkalmazás:
- **Frontend**: SvelteKit + Tailwind CSS
- **Backend**: Express.js REST API
- **Adatbázis**: SQLite

---

## Frontend Architektúra

### MVCS (Model-View-Controller-Store)

Az alkalmazás egy módosított MVCS mintát követ:

```
┌─────────────────────────────────────────────────┐
│                    View Layer                    │
│  ┌────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │ +page.svelte│  │ProductCard  │  │+layout    │ │
│  │  (HomePage) │  │   .svelte   │  │ .svelte   │ │
│  └──────┬──────┘  └──────┬──────┘  └─────┬─────┘ │
└─────────┼─────────────────┼───────────────┼───────┘
          │                 │               │
          ▼                 ▼               ▼
┌─────────────────────────────────────────────────┐
│                  Store Layer                     │
│  ┌────────────┐  ┌──────────┐  ┌─────────────┐ │
│  │ cartItems  │  │cartTotal │  │ isDarkMode  │ │
│  │ (Writable) │  │(Derived) │  │ (Writable)  │ │
│  └──────┬─────┘  └────┬─────┘  └──────┬──────┘ │
└─────────┼─────────────┼────────────────┼────────┘
          │             │                │
          ▼             ▼                ▼
┌─────────────────────────────────────────────────┐
│                  Logic Layer                     │
│  ┌────────────┐  ┌──────────────────────────┐  │
│  │ addToCart()│  │ localStorage sync        │  │
│  │            │  │ DOM manipulation         │  │
│  └────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│                   Model Layer                    │
│  ┌────────────┐  ┌──────────┐  ┌─────────────┐ │
│  │  Product   │  │Modifiers │  │  CartItem   │ │
│  │ (interface)│  │(interface)│ │ (interface) │ │
│  └────────────┘  └──────────┘  └─────────────┘ │
│  ┌────────────────────────────────────────────┐ │
│  │           products (konstans)              │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Rétegek felelősségei

**Model Layer** ([types.ts](src/lib/types.ts), [products.ts](src/lib/products.ts)):
- Adatstruktúrák definiálása
- Típusbiztonság biztosítása
- Statikus adatok tárolása

**Logic Layer** ([cart.ts](src/lib/cart.ts), [theme.ts](src/lib/theme.ts)):
- Üzleti logika implementálása
- Store műveletek (create, update)
- Side-effect kezelés (localStorage, DOM)

**Store Layer** (Svelte stores):
- Reaktív állapot menedzsment
- Automatikus komponens frissítés
- Derived value-k számítása

**View Layer** (Svelte komponensek):
- UI renderelés
- Felhasználói interakciók kezelése
- Store-ok feliratkozása és megjelenítése

## Adatfolyam

### Kosár művelet folyamata

```
[Felhasználó]
    │
    │ 1. Kiválaszt beállításokat
    ▼
[ProductCard komponens]
    │ - milk: "Zabtej"
    │ - sugar: "1 kanál"
    │ - quantity: 2
    │
    │ 2. Kattint "Kosárba" gombra
    ▼
[handleAddToCart()]
    │
    │ 3. Meghívja addToCart()
    ▼
[addToCart() függvény]
    │
    │ 4. Létrehozza CartItem objektumot
    │    { ...product, quantity, modifiers }
    │
    │ 5. cartItems.update()
    ▼
[cartItems Store]
    │ - Új elem hozzáadva: [...items, newItem]
    │
    │ 6. Store change event
    ▼
[cartTotal Derived Store]
    │
    │ 7. Újraszámítja az összeget
    │    reduce((sum, item) => sum + item.price * item.quantity, 0)
    ▼
[HomePage komponens]
    │
    │ 8. Automatikus re-render
    │    {$cartTotal} frissül
    ▼
[Felhasználó látja frissített végösszeget]
```

### Témaváltás folyamata

```
[Felhasználó]
    │
    │ 1. Kattint témaváltó gombra
    ▼
[toggleTheme() függvény]
    │
    │ 2. isDarkMode.update(v => !v)
    ▼
[isDarkMode Store]
    │ - Érték invertálva: true ↔ false
    │
    │ 3. Store change event
    ▼
[theme.ts subscriber]
    │
    │ 4a. document.documentElement.classList.add/remove('dark')
    │ 4b. localStorage.setItem('theme', 'dark'/'light')
    ▼
[Browser]
    │
    │ 5a. Tailwind CSS dark: osztályok aktiválása/deaktiválása
    │ 5b. 700ms transition animáció
    ▼
[Felhasználó látja új témát]
```

---

## Komponens Hierarchia

```
RootLayout (+layout.svelte)
│
└─── HomePage (+page.svelte)
     │
     ├─── Dekorációk (nem komponensek)
     │    ├─── Csillagok (dark mode)
     │    ├─── Felhők (light mode)
     │    └─── Égi test (nap/hold)
     │
     ├─── Header
     │    ├─── Cím box (glassmorphism)
     │    └─── Témaváltó gomb
     │
     ├─── Main - Product Grid
     │    └─── ProductCard × 6
     │         ├─── Icon kör
     │         ├─── Termék név/ár
     │         ├─── Tej dropdown
     │         ├─── Cukor dropdown
     │         ├─── Mennyiség control
     │         └─── Kosárba gomb
     │
     ├─── Checkout Bar
     │    ├─── Végösszeg
     │    └─── Megrendelés gomb
     │
     └─── Footer
```

### Komponens kapcsolatok

```
┌────────────────────────────────────────┐
│           RootLayout                   │
│  - Globális CSS                        │
│  - Favicon                             │
│  - Children renderelés                 │
└────────────┬───────────────────────────┘
             │
             ▼
┌────────────────────────────────────────┐
│           HomePage                     │
│  - Témaváltás logika                  │
│  - Dekoráció generálás                │
│  - Layout struktúra                   │
└────────┬──────────┬────────────────────┘
         │          │
         ▼          ▼
┌─────────────┐  ┌──────────────────────┐
│ ProductCard │  │  Store-ok:           │
│ × 6 példány │  │  - cartTotal         │
│             │  │  - isDarkMode        │
└─────────────┘  └──────────────────────┘
```

---

## Állapotkezelés

### Store típusok és szerepük

#### 1. Writable Stores

**`cartItems`** (cart.ts):
```typescript
const cartItems = writable<CartItem[]>([]);
```

- **Célkitűzés**: Kosár tartalmának tárolása
- **Inicializálás**: Üres tömb
- **Módosítás**: `update()` metódussal (új elem hozzáfűzése)
- **Perzisztencia**: Nincs (session-only)

**`isDarkMode`** (theme.ts):
```typescript
const isDarkMode = writable<boolean>(defaultValue);
```

- **Célkitűzés**: Téma állapot tárolása
- **Inicializálás**: localStorage vagy true (server)
- **Módosítás**: `update()` vagy `set()` metódussal
- **Perzisztencia**: localStorage ('theme' kulcs)
- **Side-effects**: DOM manipulation (classList), localStorage sync

#### 2. Derived Stores

**`cartTotal`** (cart.ts):
```typescript
const cartTotal = derived(cartItems, ($items) => {
  return $items.reduce((total, item) =>
    total + (item.price * item.quantity), 0);
});
```

- **Célkitűzés**: Kosár végösszeg automatikus számítása
- **Függőségek**: `cartItems` store
- **Újraszámítás**: Automatikus, minden `cartItems` változásnál
- **Módosítás**: Nem módosítható közvetlenül (read-only)

### Állapot Persist Stratégia

| Store | Perzisztálva? | Hol? | Miért? |
|-------|---------------|------|--------|
| `cartItems` |  Nem | - | Session-based, nincs backend |
| `isDarkMode` |  Igen | localStorage | Felhasználói preferencia megőrzése |
| `cartTotal` |  Nem | - | Derived value, újraszámítható |

**Jövőbeli fejlesztés**: `cartItems` perzisztencia localStorage-ba vagy backend API-ba.

### Reaktív frissítések

Svelte automatikusan újrarendereli a komponenseket, amikor egy feliratkozott store megváltozik:

```svelte
<script>
  import { cartTotal } from '$lib/cart';
</script>

<!-- Automatikusan frissül cartTotal változásakor -->
<span>{$cartTotal} Ft</span>
```

**Hogyan működik**:
1. `$` prefix auto-subscribe-ot készít
2. Store változáskor Svelte invalidálja a függő komponens részt
3. Csak a szükséges DOM rész frissül (fine-grained reactivity)

---

## Stílus Architektúra

### Tailwind + Inline Classes

Az alkalmazás **utility-first inline classes** megközelítést használ:

**Előnyök**:
-  Gyors fejlesztés
-  Komponens-szintű stílusok
-  Nincs CSS class névütközés
-  Automatikus tree-shaking

**Hátrányok**:
-  Hosszú class listák
-  Nehezebb karbantartás komplex stílusoknál

### Glassmorphism Implementáció

A glassmorphism hatás következő rétegekből áll:

```css
/* 1. Háttér blur */
backdrop-blur-xl          /* 24px blur */

/* 2. Áttetsző háttér */
bg-white/[0.08]          /* 8% fehér overlay */

/* 3. Vékony border */
border-white/[0.15]      /* 15% fehér border */

/* 4. Árnyék */
shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]  /* Puha árnyék */

/* 5. Hover hatás */
hover:bg-white/[0.15]    /* Erősebb overlay */
hover:shadow-xl          /* Nagyobb árnyék */
```

### Színpaletta Rendszer

**Világos mód változók**:
```
Háttér gradiens:
  - from-slate-700 (#334155)
  - via-slate-600  (#475569)
  - to-slate-500   (#64748b)

Overlay:
  - bg-white/30 (30% átlátszó fehér)

Szöveg:
  - text-gray-800 (#1f2937)
```

**Sötét mód változók**:
```
Háttér gradiens:
  - from/via/to-[#0d0e1a] (egységes nagyon sötét)

Overlay:
  - bg-white/[0.08] (8% átlátszó fehér)

Szöveg:
  - text-white (#ffffff)
  - text-gray-200 (#e5e7eb)

Akcentus:
  - from-pink-500 (#ec4899)
  - to-purple-600 (#9333ea)
```

### Animációk

**CSS Keyframes** (+page.svelte `<style>` blokkban):

```css
/* Csillag villogás */
@keyframes twinkle {
  0%, 100% { opacity: var(--base-opacity); }
  50% { opacity: calc(var(--base-opacity) * 0.3); }
}

/* Felhő lebegés */
@keyframes float {
  0%, 100% { transform: translateY(0) translateX(0) scale(1); }
  25% { transform: translateY(-15px) translateX(10px) scale(1.05); }
  50% { transform: translateY(-25px) translateX(5px) scale(1.1); }
  75% { transform: translateY(-15px) translateX(-5px) scale(1.05); }
}
```

**Tailwind Transitions**:
```css
transition-all duration-300   /* Komponens hover */
transition-colors duration-300 /* Témaváltás szín */
transition-opacity duration-700 /* Dekoráció fade */
```

### Responsive Design

**Breakpoint stratégia**:

```css
/* Mobil (default) */
grid-cols-1               /* 1 oszlop */

/* Tablet (md: 768px+) */
md:grid-cols-2           /* 2 oszlop */

/* Desktop (lg: 1024px+) */
lg:grid-cols-3           /* 3 oszlop */
```

**Layout containerek**:
```css
max-w-6xl mx-auto        /* Maximális szélesség + centrálás */
px-4                     /* Oldalirányú padding */
```

---

## Performance Megfontolások

### 1. Svelte Compile-Time Optimalizáció

**Előny**: Svelte a build során optimalizált JavaScript-et generál:
- Nincs runtime framework overhead
- Kisebb bundle méret (~10-30% kevesebb mint React/Vue)
- Gyorsabb first paint

**Benchmarks** (elméleti, Svelte vs React):
```
Bundle size:    Svelte 15KB  |  React 45KB
First paint:    Svelte 80ms  |  React 150ms
Update time:    Svelte 5ms   |  React 10ms
```

### 2. CSS Performance

**Glassmorphism CPU használat**:
- `backdrop-blur-xl` GPU-accelerált (modern böngészőkben)
- CSS transitions GPU-n futnak (transform, opacity)
- Animációk `will-change` optimalizációval

**Trade-off**:
-  Gyengébb mobilokon lassabb lehet a blur
-  Desktop/modern mobilon sima 60fps

### 3. Store Optimalizáció

**Derived store cache**:
```typescript
const cartTotal = derived(cartItems, ($items) => {
  // Ez a számítás csak akkor fut, ha $items változik
  return $items.reduce(...);
});
```

- Automatikus cache-elés
- Csak dirty check-nél fut újra

### 4. Bundle Size

**Jelenlegi bundle méret** (becsült):
```
Vendor (SvelteKit, deps):   ~80 KB (gzipped)
App code:                    ~15 KB (gzipped)
CSS (Tailwind):              ~5 KB (gzipped)
────────────────────────────────────────
Összesen:                    ~100 KB
```

**Optimalizációk**:
-  Vite tree-shaking
-  Tailwind unused class purge
-  Lazy loading (ha több route lenne)

### 5. Runtime Performance

**Virtual DOM vs Svelte**:
- React/Vue: Diff algoritmus minden render-nél
- Svelte: Compile-time generated update code

**Példa (konceptuális)**:

React update:
```javascript
// Runtime diff calculation
if (prevCount !== nextCount) {
  updateDOM(element, nextCount);
}
```

Svelte update:
```javascript
// Compile-time generated
$$invalidate('count', count = count + 1);
element.textContent = count; // Direct DOM update
```

---

## Backend Architektúra

### Express.js REST API

A backend az `server.cjs` fájlban található és az alábbi funkciókat biztosítja:

- **Termékek kezelése**: CRUD műveletek
- **Rendelések kezelése**: Listázás, státusz módosítás, törlés
- **Admin autentikáció**: JWT token alapú

### Adatbázis (SQLite)

**Táblák**:

1. **termekek** - Termék katalógus
2. **rendelesek** - Rendelések fő adatai
3. **rendeles_tetelek** - Rendelés tételek
4. **admin** - Admin felhasználók

A séma a `schema.sql` fájlban található.

### API Endpoint-ok

```
GET  /api/products           - Termékek listázása
GET  /api/products/:id       - Termék részletei
POST /api/products           - Új termék (Admin)
PUT  /api/products/:id       - Termék módosítása (Admin)
DELETE /api/products/:id     - Termék törlése (Admin)

GET  /api/orders             - Rendelések listázása (Admin)
GET  /api/orders/:id         - Rendelés részletei (Admin)
PATCH /api/orders/:id/ship   - Postázás státusz (Admin)
DELETE /api/orders/:id       - Rendelés törlése (Admin)

POST /api/admin/login        - Bejelentkezés
POST /api/admin/logout       - Kijelentkezés
GET  /api/admin/verify       - Token ellenőrzés
```