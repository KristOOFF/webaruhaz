# NeoCoffee Webáruház

Modern, glassmorphism stílusú kávé webshop alkalmazás SvelteKit frontend és Express.js backend technológiákkal.

![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=flat&logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)

## Bevezetés

A NeoCoffee egy kávé webáruház, amely lehetővé teszi a felhasználók számára kávék rendelését testreszabható opciókkal (tej típus, cukor mennyiség). Az admin felületen a rendelések kezelhetők.

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

- **Bejelentkezés**: JWT token alapú autentikáció
  - Felhasználónév: `admin`
  - Jelszó: `Minad123!`
- **Rendelések kezelése** shadcn-svelte Table komponenssel:
  - Összes rendelés listázása táblázatos formában (API-ból)
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

### Frontend
- **SvelteKit 2.49.1** - Modern meta-framework
- **Svelte 5.45.6** - Reaktív komponens framework (Runes API)
- **Tailwind CSS 4.1.17** - Utility-first CSS framework
- **shadcn-svelte 1.1.0** - Újrafelhasználható UI komponensek
- **@lucide/svelte** - Ikon könyvtár
- **TypeScript 5.9.3** - Típusbiztonság

### Backend
- **Express.js 4.22.1** - REST API szerver
- **better-sqlite3** - SQLite adatbázis driver
- **bcrypt** - Jelszó hash-elés
- **jsonwebtoken** - JWT token kezelés

### Build Tools
- **Vite 7.2.6** - Gyors build tool és dev szerver

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

3. **Adatbázis inicializálása**

```bash
npm run db:init
```

## Fejlesztés

### Development szerver indítása (frontend + backend)

```bash
npm run dev:all
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

### Csak frontend indítása

```bash
npm run dev
```

### Csak backend indítása

```bash
npm run server
```

### Adatbázis parancsok

```bash
npm run db:init    # Adatbázis inicializálása
npm run db:reset   # Adatbázis visszaállítása
npm run db:check   # Adatbázis ellenőrzése
npm run db:seed    # Tesztadatok hozzáadása
```

## Projekt Struktúra

```
webaruhaz/
├── src/                         # Frontend forráskód
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn-svelte UI komponensek
│   │   │   ├── ProductCard.svelte
│   │   │   └── ThemeDecorations.svelte
│   │   ├── api.ts               # Backend API kliens
│   │   ├── cart.ts              # Kosár store
│   │   ├── orders.ts            # Rendelések store
│   │   ├── products.ts          # Termék adatok
│   │   ├── theme.ts             # Téma store
│   │   └── types.ts             # TypeScript típusok
│   └── routes/
│       ├── +page.svelte         # Főoldal
│       ├── checkout/+page.svelte # Pénztár
│       └── admin/+page.svelte   # Admin felület
├── server.cjs                   # Express backend szerver
├── schema.sql                   # Adatbázis séma
├── webaruhaz.db                 # SQLite adatbázis
├── package.json
├── svelte.config.js
├── vite.config.ts
└── tsconfig.json
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
2. **Bejelentkezés**: Felhasználónév: `admin`, Jelszó: `Minad123!`
3. **Rendelések megtekintése**:
   - Táblázat összes rendeléssel
   - Vevő adatok (név, email, telefon, cím)
   - Rendelés dátuma és státusza
4. **Műveletek**:
   - **"Megjelenítés" gomb**: Rendelés tételeinek megtekintése modal ablakban
   - **"Postázás" gomb**: Rendelés postázottá jelölése (zöld badge)
   - **"Visszavonás" gomb**: Postázás visszavonása
   - **Törlés ikon**: Rendelés törlése a rendszerből

### Témaváltás

Kattints a jobb felső sarokban lévő nap/hold ikonra a világos és sötét téma között váltáshoz. A választásod automatikusan mentésre kerül a localStorage-ba.