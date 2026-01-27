# Tailwind CSS Stílusok Magyarázata

Ez a dokumentáció a NeoCoffee Webáruház projektben használt összetett Tailwind CSS stílusokat magyarázza el.

## Tartalomjegyzék

1. [Glassmorphism (Üveghatás)](#1-glassmorphism-üveghatás)
2. [Sötét Téma Támogatás](#2-sötét-téma-támogatás)
3. [Kártya Komponens](#3-kártya-komponens)
4. [Input Mező](#4-input-mező)
5. [Gomb Stílusok](#5-gomb-stílusok)
6. [Dialog/Modal Ablak](#6-dialogmodal-ablak)
7. [Színátmenetek](#7-színátmenetek)
8. [Interaktív Állapotok](#8-interaktív-állapotok)
9. [Speciális Szelektorok](#9-speciális-szelektorok)
10. [Reszponzív Tervezés](#10-reszponzív-tervezés)

---

## 1. Glassmorphism (Üveghatás)

A projekt fő vizuális stílusa a **glassmorphism** (üveghatás), ami átlátszó, elmosódott hátteret használ.

### Alapvető osztályok:

```
backdrop-blur-xl bg-white/30 border-white/50
```

| Osztály | Magyarázat |
|---------|------------|
| `backdrop-blur-xl` | Extra nagy (24px) háttér-elmosás effekt |
| `bg-white/30` | Fehér háttér 30%-os átlátszósággal |
| `border-white/50` | Fehér szegély 50%-os átlátszósággal |

### Átlátszóság szintaxis:

- `bg-white/20` = `background-color: rgba(255, 255, 255, 0.2)`
- `bg-white/[0.08]` = `background-color: rgba(255, 255, 255, 0.08)` (egyedi érték)

---

## 2. Sötét Téma Támogatás

Minden komponens rendelkezik `dark:` prefixű variánsokkal.

### Példa:

```
bg-white/30 dark:bg-white/[0.08]
border-white/50 dark:border-white/[0.15]
text-gray-800 dark:text-gray-200
```

| Osztály | Világos téma | Sötét téma |
|---------|--------------|------------|
| `bg-white/30 dark:bg-white/[0.08]` | 30% fehér | 8% fehér |
| `text-gray-800 dark:text-white` | Sötétszürke szöveg | Fehér szöveg |
| `shadow-lg dark:shadow-[...]` | Normál árnyék | Egyedi sötét árnyék |

---

## 3. Kártya Komponens

**Fájl:** `src/lib/components/ui/card/card.svelte`

### Teljes stílus:

```
backdrop-blur-xl bg-white/30 border-white/50
dark:bg-white/[0.08] dark:border-white/[0.15]
text-card-foreground flex flex-col gap-6 rounded-xl border py-6
shadow-lg dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]
transition-all duration-300
hover:border-white/70 hover:shadow-xl
dark:hover:border-white/[0.25] dark:hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.5)]
```

### Részletes magyarázat:

| Osztály | Funkció |
|---------|---------|
| `backdrop-blur-xl` | Erős háttér-elmosás (üveghatás) |
| `bg-white/30` | 30%-os fehér háttér |
| `border-white/50` | Félig átlátszó fehér szegély |
| `dark:bg-white/[0.08]` | Sötét módban 8%-os fehér |
| `text-card-foreground` | CSS változóból jövő szövegszín |
| `flex flex-col` | Flexbox, függőleges irány |
| `gap-6` | 1.5rem (24px) térköz elemek között |
| `rounded-xl` | Extra nagy lekerekítés (12px) |
| `border` | 1px szegély |
| `py-6` | Függőleges padding: 1.5rem |
| `shadow-lg` | Nagy árnyék |
| `dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]` | Egyedi sötét árnyék |
| `transition-all duration-300` | Minden tulajdonság animálva 300ms alatt |
| `hover:border-white/70` | Hover-on erősebb szegély |
| `hover:shadow-xl` | Hover-on nagyobb árnyék |

---

## 4. Input Mező

**Fájl:** `src/lib/components/ui/input/input.svelte`

### Teljes stílus:

```
backdrop-blur-md bg-white/40 border-white/30
dark:bg-white/[0.1] dark:border-white/[0.15]
text-gray-800 dark:text-gray-200
placeholder:text-gray-600 dark:placeholder:text-gray-400
selection:bg-primary selection:text-primary-foreground
flex h-9 w-full min-w-0 rounded-md border px-3 py-1
text-base shadow-xs transition-all duration-200 outline-none
disabled:cursor-not-allowed disabled:opacity-50
md:text-sm
```

### Részletes magyarázat:

| Osztály | Funkció |
|---------|---------|
| `backdrop-blur-md` | Közepes háttér-elmosás (12px) |
| `bg-white/40` | 40%-os fehér háttér |
| `placeholder:text-gray-600` | Placeholder szöveg színe |
| `selection:bg-primary` | Kijelölt szöveg háttérszíne |
| `h-9` | Magasság: 2.25rem (36px) |
| `w-full` | Teljes szélesség |
| `min-w-0` | Minimum szélesség 0 (flexbox túlcsordulás megakadályozása) |
| `rounded-md` | Közepes lekerekítés (6px) |
| `px-3` | Vízszintes padding: 0.75rem |
| `py-1` | Függőleges padding: 0.25rem |
| `text-base` | Alap betűméret (16px) |
| `shadow-xs` | Extra kicsi árnyék |
| `outline-none` | Nincs outline |
| `disabled:cursor-not-allowed` | Tiltott állapotban tiltott kurzor |
| `disabled:opacity-50` | Tiltott állapotban 50% átlátszóság |
| `md:text-sm` | Medium képernyőn kisebb betű (14px) |

---

## 5. Gomb Stílusok

**Fájl:** `src/lib/components/ui/button/button.svelte`

### Alap gomb stílus:

```
focus-visible:border-ring focus-visible:ring-ring/50
aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40
aria-invalid:border-destructive
inline-flex shrink-0 items-center justify-center gap-2
rounded-lg text-sm font-medium whitespace-nowrap
transition-all duration-200 outline-none
focus-visible:ring-[3px]
disabled:pointer-events-none disabled:opacity-50
aria-disabled:pointer-events-none aria-disabled:opacity-50
[&_svg]:pointer-events-none [&_svg]:shrink-0
[&_svg:not([class*='size-'])]:size-4
backdrop-blur-xl border
```

### Részletes magyarázat:

| Osztály | Funkció |
|---------|---------|
| `focus-visible:border-ring` | Fókuszban látható szegélyszín |
| `focus-visible:ring-ring/50` | Fókusz gyűrű 50%-os átlátszósággal |
| `aria-invalid:ring-destructive/20` | Érvénytelen állapotban piros gyűrű |
| `inline-flex` | Inline flexbox megjelenítés |
| `shrink-0` | Nem zsugorodik flexbox-ban |
| `items-center justify-center` | Tartalom középre igazítva |
| `gap-2` | 0.5rem térköz gyerek elemek között |
| `rounded-lg` | Nagy lekerekítés (8px) |
| `text-sm` | Kis betűméret (14px) |
| `font-medium` | Közepes betűvastagság (500) |
| `whitespace-nowrap` | Nincs sortörés |
| `focus-visible:ring-[3px]` | 3px vastag fókusz gyűrű |
| `[&_svg]:pointer-events-none` | SVG-kre nincs pointer events |
| `[&_svg:not([class*='size-'])]:size-4` | SVG-k alapmérete 16px |

### Destruktív (törlés) gomb variáns:

```
bg-red-500/30 border-red-500/50 text-red-800
hover:bg-red-500/40 hover:border-red-500/70
dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-300
dark:hover:bg-red-500/30 dark:hover:border-red-500/40
shadow-lg dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]
```

---

## 6. Dialog/Modal Ablak

**Fájl:** `src/lib/components/ui/dialog/dialog-content.svelte`

### Teljes stílus:

```
backdrop-blur-xl bg-white/30 border-white/50
dark:bg-white/[0.08] dark:border-white/[0.15]
data-[state=open]:animate-in data-[state=closed]:animate-out
data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
fixed top-[50%] left-[50%] z-50
grid w-full max-w-[calc(100%-2rem)]
translate-x-[-50%] translate-y-[-50%]
gap-4 rounded-2xl border p-6
shadow-lg dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]
duration-200 sm:max-w-lg
```

### Részletes magyarázat:

| Osztály | Funkció |
|---------|---------|
| `data-[state=open]:animate-in` | Nyitáskor animáció be |
| `data-[state=closed]:animate-out` | Záráskor animáció ki |
| `data-[state=closed]:fade-out-0` | Záráskor kifakulás |
| `data-[state=open]:fade-in-0` | Nyitáskor befakulás |
| `data-[state=closed]:zoom-out-95` | Záráskor kicsinyítés 95%-ra |
| `data-[state=open]:zoom-in-95` | Nyitáskor nagyítás 95%-ról |
| `fixed` | Fix pozícionálás |
| `top-[50%] left-[50%]` | Középre pozícionálás |
| `z-50` | Z-index: 50 (más elemek fölött) |
| `translate-x-[-50%] translate-y-[-50%]` | Pontos középre igazítás |
| `max-w-[calc(100%-2rem)]` | Maximum szélesség számítással |
| `rounded-2xl` | Extra nagy lekerekítés (16px) |
| `p-6` | Padding minden oldalon: 1.5rem |
| `sm:max-w-lg` | Small+ képernyőn max 32rem széles |

---

## 7. Színátmenetek

### Főoldal/Checkout háttér:

```
bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500
dark:bg-gradient-to-br dark:from-[#0d0e1a] dark:via-[#0d0e1a] dark:to-[#0d0e1a]
```

| Osztály | Funkció |
|---------|---------|
| `bg-gradient-to-br` | Színátmenet bal felső → jobb alsó |
| `from-slate-700` | Kezdőszín: sötét szürke |
| `via-slate-600` | Középső szín: közép szürke |
| `to-slate-500` | Végszín: világos szürke |
| `dark:from-[#0d0e1a]` | Sötét módban egyedi HEX szín |

---

## 8. Interaktív Állapotok

### Hover állapotok:

```css
hover:bg-red-500/40     /* Háttér változás hover-on */
hover:shadow-xl         /* Nagyobb árnyék hover-on */
hover:border-white/70   /* Erősebb szegély hover-on */
hover:opacity-100       /* Teljes láthatóság hover-on */
```

### Focus állapotok:

```css
focus:ring-2           /* 2px fókusz gyűrű */
focus:ring-offset-2    /* 2px offset a gyűrűn */
focus:outline-hidden   /* Outline elrejtése */
focus-visible:ring-[3px] /* Csak billentyűzet fókusznál gyűrű */
```

### Disabled (tiltott) állapotok:

```css
disabled:opacity-50           /* 50% átlátszóság */
disabled:cursor-not-allowed   /* Tiltott kurzor */
disabled:pointer-events-none  /* Nincs kattintás */
```

### Aria állapotok (akadálymentesség):

```css
aria-invalid:ring-destructive/20  /* Érvénytelen mező jelzése */
aria-disabled:opacity-50          /* Aria disabled stílus */
```

---

## 9. Speciális Szelektorok

### Gyerek elemek stílusai:

```css
[&_svg]:pointer-events-none     /* Minden svg gyerekre */
[&_svg]:shrink-0                /* SVG-k ne zsugorodjanak */
[&_svg:not([class*='size-'])]:size-4  /* SVG-k alapmérete */
```

**Magyarázat:**
- `[&_svg]` = A komponensen belüli összes `<svg>` elemre
- `[&_svg:not([class*='size-'])]` = Azokra az SVG-kre, amiknek nincs `size-` osztálya

### Data attribútum szelektorok:

```css
data-[state=open]:animate-in    /* Ha data-state="open" */
data-[state=closed]:fade-out-0  /* Ha data-state="closed" */
```

---

## 10. Reszponzív Tervezés

A Tailwind CSS mobile-first megközelítést használ.

### Breakpoint prefixek:

| Prefix | Minimum szélesség | Eszköz |
|--------|-------------------|--------|
| (nincs) | 0px | Mobil |
| `sm:` | 640px | Kis tablet |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Laptop |
| `xl:` | 1280px | Desktop |
| `2xl:` | 1536px | Nagy képernyő |

### Példák a projektből:

```css
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
/* 1 oszlop mobilon, 2 tableten, 3 laptopon */

text-base md:text-sm
/* 16px mobilon, 14px tablettől */

max-w-[calc(100%-2rem)] sm:max-w-lg
/* Számított szélesség mobilon, 32rem tablettől */

px-4 md:px-8
/* 1rem padding mobilon, 2rem tablettől */
```

---

## Gyakran Használt Méretek

| Osztály | Érték | Pixel |
|---------|-------|-------|
| `p-1` | 0.25rem | 4px |
| `p-2` | 0.5rem | 8px |
| `p-3` | 0.75rem | 12px |
| `p-4` | 1rem | 16px |
| `p-6` | 1.5rem | 24px |
| `p-8` | 2rem | 32px |
| `gap-2` | 0.5rem | 8px |
| `gap-4` | 1rem | 16px |
| `gap-6` | 1.5rem | 24px |
| `rounded-md` | 0.375rem | 6px |
| `rounded-lg` | 0.5rem | 8px |
| `rounded-xl` | 0.75rem | 12px |
| `rounded-2xl` | 1rem | 16px |

---

## Összefoglaló

A projekt főbb Tailwind CSS mintái:

1. **Glassmorphism**: `backdrop-blur-xl bg-white/30 border-white/50`
2. **Sötét téma**: `dark:` prefix minden fő stílushoz
3. **Átlátszóság**: `/30`, `/50`, `/[0.08]` szintaxis
4. **Egyedi értékek**: `[érték]` szögletes zárójelben
5. **Interakció**: `hover:`, `focus:`, `disabled:` prefixek
6. **Reszponzivitás**: `sm:`, `md:`, `lg:` breakpointok
7. **Animációk**: `transition-all duration-300`
