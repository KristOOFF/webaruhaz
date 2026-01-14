# NeoCoffee Webáruház

Modern, glassmorphism stílusú kávé webshop alkalmazás SvelteKit és Tailwind CSS technológiákkal.

![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=flat&logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

## Funkciók

### Termékek

- 6 különböző kávé termék megjelenítése
- Termékek ára magyar forintban (Ft)
- Két kategória: kávé és eszpresszó alapú italok
- shadcn-svelte Card és Select komponensek használata

### Kosár kezelés

- Termékek hozzáadása a kosárhoz
- Mennyiség szabályozás (növelés/csökkentés)
- Testreszabás: tej típus (mandula, tehén, zab)
- Cukor mennyiség választás (nincs, 1 vagy 2 kanál)
- Valós idejű végösszeg számítás

### Pénztár (Checkout)

- **Rendelési űrlap** shadcn-svelte Input és Label komponensekkel:
  - Teljes név megadása
  - Email cím validáció
  - Telefonszám megadása
  - Irányítószám
  - Település
  - Pontos cím (utca, házszám)
- **Rendelés összesítő**:
  - Kosárban lévő összes termék részleteivel
  - Tej és cukor módosítók megjelenítése
  - Végösszeg kalkuláció
- **Rendelés leadása**:
  - Űrlap validáció
  - Rendelés mentése az admin rendszerbe
  - Kosár automatikus ürítése
  - Visszairányítás a főoldalra

### Admin felület

- **Rendelések kezelése** shadcn-svelte Table komponenssel:
  - Összes rendelés listázása táblázatos formában
  - Vevő adatok (név, email, telefon, cím)
  - Rendelés dátuma
  - Postázási státusz (feldolgozás alatt / postázva)
- **Rendelés műveletek** shadcn-svelte Button és Badge komponensekkel:
  - Rendelés tételeinek megtekintése (Dialog modal)
  - Postázás státusz váltása
  - Rendelés törlése
- **Admin link**: `/admin` útvonalon elérhető

### Téma rendszer

- Világos és sötét mód közötti váltás
- Automatikus localStorage mentés
- Sima átmenetek (700ms)
- Téma-specifikus dekorációk:
  - **Világos mód**: lebegő felhők, nap
  - **Sötét mód**: villogó csillagok, hold

### Vizuális Design

- **Glassmorphism**: Átlátszó, elmosódott háttérrel rendelkező felületek
- **Animációk**:
  - Csillagok villogása (twinkle)
  - Felhők lebegése (float)
  - Hover effektek
  - Téma váltás animációk
- **Színvilág**:
  - Világos: szürke-kék gradiens
  - Sötét: nagyon sötét kék-fekete gradiens rózsaszín/lila akcentusokkal

## Technológiai Stack

### Frontend Framework
- **SvelteKit 2.49.1** - Modern meta-framework
- **Svelte 5.45.6** - Reaktív komponens framework (Runes API)

### UI Komponens Könyvtár
- **shadcn-svelte 1.1.0** - Újrafelhasználható UI komponensek
  - Button, Badge, Card, Dialog, Table komponensek
  - Input, Label form komponensek
  - Select dropdown komponens
- **bits-ui** - Headless UI primitívek (shadcn alapja)
- **tailwind-variants** - Komponens variant rendszer

### Stílus
- **Tailwind CSS 4.1.17** - Utility-first CSS framework
- **@tailwindcss/vite 4.1.17** - Tailwind Vite plugin
- **tw-animate-css** - Tailwind animációs kiegészítések

### Build Tools
- **Vite 7.2.6** - Gyors build tool és dev szerver
- **TypeScript 5.9.3** - Típusbiztonság

### Ikonok
- **@lucide/svelte 0.562.0** - Modern ikonok
  - Coffee, ShoppingCart, Package (alkalmazás ikonok)
  - Sun, Moon (témaváltás)
  - Plus, Minus (mennyiség gombok)
  - ArrowLeft (navigáció)
  - Trash2, Eye (admin műveletek)

### Egyéb
- **@sveltejs/adapter-auto 7.0.0** - Automatikus deployment adapter
- **clsx** - CSS osztály kezelés
- **tailwind-merge** - Tailwind osztály egyesítés

### Dev Tools
- **svelte-check 4.3.4** - Típusellenőrzés
- **Svelte Vite Plugin** - Svelte támogatás Vite-ban

## Telepítés

### Előfeltételek

- **Node.js**: 18.x vagy újabb verzió
- **npm**, **pnpm** vagy **yarn** package manager

### Lépések

1. **Projekt klónozása vagy letöltése**

```bash
git clone <repository-url>
cd webaruhaz
```

2. **Függőségek telepítése**

```bash
npm install
# vagy
pnpm install
# vagy
yarn install
```

3. **Környezet ellenőrzése**

```bash
npm run check
```

## Fejlesztés

### Development szerver indítása

```bash
npm run dev
```

Az alkalmazás alapértelmezetten a `http://localhost:5173` címen érhető el.

### Dev szerver megnyitása böngészőben

```bash
npm run dev -- --open
```

### Típusellenőrzés

```bash
# Egyszeri ellenőrzés
npm run check

# Folyamatos ellenőrzés (watch mode)
npm run check:watch
```

### Fájlstruktúra navigáció

```
src/
├── lib/
│   ├── assets/
│   │   └── favicon.svg          # Alkalmazás ikon
│   ├── components/
│   │   ├── ui/                  # shadcn-svelte UI komponensek
│   │   │   ├── button/          # Button komponens (glassmorphism)
│   │   │   ├── badge/           # Badge komponens (success, warning, destructive)
│   │   │   ├── card/            # Card komponens (glassmorphism)
│   │   │   ├── dialog/          # Dialog modal komponens
│   │   │   ├── table/           # Table komponensek
│   │   │   ├── input/           # Input komponens (glassmorphism)
│   │   │   ├── label/           # Label komponens
│   │   │   └── select/          # Select dropdown komponens
│   │   └── ProductCard.svelte   # Termék kártya komponens (shadcn Card+Select)
│   ├── cart.ts                  # Kosár állapotkezelés (addToCart, cartTotal)
│   ├── orders.ts                # Rendelések store és mock adatok
│   ├── products.ts              # Termék katalógus
│   ├── theme.ts                 # Téma kezelés (isDarkMode store)
│   ├── types.ts                 # TypeScript típusdefiníciók
│   └── utils.ts                 # Utility függvények (cn - class merger)
└── routes/
    ├── admin/
    │   └── +page.svelte         # Admin felület (rendelések kezelése)
    ├── checkout/
    │   └── +page.svelte         # Pénztár oldal (rendelési űrlap)
    ├── +layout.svelte           # Gyökér layout (dark mode class)
    ├── +page.svelte             # Főoldal (termékek és kosár)
    └── layout.css               # Globális stílusok (Tailwind, glassmorphism)
```

## Build és Deployment

### Production build készítése

```bash
npm run build
```

A build kimenet a `.svelte-kit/output` mappába kerül.

### Production build előnézet

```bash
npm run preview
```

Egyedi adapter használatához módosítsd a [svelte.config.js](svelte.config.js) fájlt.

## Projekt Struktúra

```
webaruhaz/
├── src/
│   ├── lib/                     # Újrafelhasználható kód
│   │   ├── assets/              # Statikus asszetek (favicon)
│   │   ├── components/          # Svelte komponensek
│   │   ├── cart.ts              # Kosár store és logika
│   │   ├── products.ts          # Termék adatok
│   │   ├── theme.ts             # Téma store és logika
│   │   ├── types.ts             # TypeScript típusok
│   │   └── index.ts             # Library export pont
│   ├── routes/                  # SvelteKit oldalak
│   │   ├── +layout.svelte       # Globális layout
│   │   ├── +page.svelte         # Kezdőlap
│   │   └── layout.css           # Globális CSS
│   ├── app.d.ts                 # App típusdefiníciók
│   └── app.html                 # HTML sablon
├── static/                      # Publikus statikus fájlok
│   └── robots.txt               # SEO konfiguráció
├── .vscode/                     # VS Code beállítások
├── package.json                 # NPM függőségek
├── svelte.config.js             # SvelteKit konfiguráció
├── tsconfig.json                # TypeScript konfiguráció
├── vite.config.ts               # Vite konfiguráció
└── README.md                    # Ez a fájl
```

## Használat

### Vásárlási folyamat

#### 1. Termék hozzáadása a kosárhoz (Főoldal - `/`)

1. Válaszd ki a tej típusát a Select dropdown-ból (Mandula tej, Tehéntej, Zabtej)
2. Válaszd ki a cukor mennyiséget (Nincs, 1 kanál, 2 kanál)
3. Állítsd be a mennyiséget a +/- gombokkal
4. Kattints a "Kosárba" gombra
5. A kosár végösszege az oldal alján automatikusan frissül

#### 2. Rendelés leadása (Checkout - `/checkout`)

1. Kattints a főoldal alján lévő "Megrendelés" gombra
2. Töltsd ki az összes kötelező mezőt:
   - **Teljes név**: Vásárló teljes neve
   - **Email cím**: Email cím értesítésekhez
   - **Telefonszám**: Kapcsolattartási telefonszám
   - **Irányítószám**: Szállítási cím irányítószáma
   - **Település**: Város/Község neve
   - **Cím**: Utca, házszám (pl. "Fő utca 123.")
3. Ellenőrizd a rendelés összesítőt a jobb oldalon:
   - Kosárban lévő termékek listája
   - Választott módosítók (tej, cukor)
   - Végösszeg
4. Kattints a "Rendelés leadása" gombra
5. Sikeres rendelés után automatikus visszairányítás a főoldalra

#### 3. Rendelések kezelése (Admin - `/admin`)

1. Nyisd meg az admin felületet: `/admin` útvonalon
2. **Rendelések megtekintése**:
   - Táblázat összes rendeléssel
   - Vevő adatok (név, email, telefon, cím)
   - Rendelés dátuma és státusza
3. **Műveletek**:
   - **"Megjelenítés" gomb**: Rendelés tételeinek megtekintése modal ablakban
   - **"Postázás" gomb**: Rendelés postázottá jelölése (zöld badge)
   - **"Visszavonás" gomb**: Postázás visszavonása
   - **Törlés ikon**: Rendelés törlése a rendszerből

### Témaváltás

Kattints a jobb felső sarokban lévő nap/hold ikonra a világos és sötét téma között váltáshoz. A választásod automatikusan mentésre kerül a localStorage-ba és az oldal újratöltése után is megmarad.

## Konfigurációk

### Tailwind CSS

A Tailwind konfiguráció a [layout.css](src/routes/layout.css)-ben található:

```css
@import 'tailwindcss';
```

### TypeScript

Strict mode engedélyezve a [tsconfig.json](tsconfig.json)-ban a maximális típusbiztonságért.

### Vite

A [vite.config.ts](vite.config.ts) tartalmazza a Svelte és Tailwind plugin konfigurációkat.

### SvelteKit

Az [svelte.config.js](svelte.config.js) beállítja a Vite preprocessort és az auto adaptert.

## Design Rendszer

### Glassmorphism Implementáció

Az alkalmazás egyedi glassmorphism design rendszert használ, amely a `layout.css` fájlban van definiálva:

- **`.glass-light`**: Világos mód glassmorphism (fehér/30% átlátszóság, blur 60px)
- **`.glass-dark`**: Sötét mód glassmorphism (fehér/5% átlátszóság)
- **`.glass-interactive`**: Hover effektekkel rendelkező interaktív glassmorphism

Minden shadcn-svelte komponens testreszabásra került glassmorphism stílussal:
- Button, Badge, Card, Dialog, Input, Select komponensek
- Egységes vizuális megjelenés mindkét témában
- Smooth átmenetek (200-300ms) minden interakción