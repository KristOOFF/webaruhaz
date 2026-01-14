# NeoCoffee Webáruház - Adatbázis Dokumentáció

## Tartalomjegyzék

- [Áttekintés](#áttekintés)
- [Adatbázis Struktúra](#adatbázis-struktúra)
- [Használat](#használat)
- [Scriptek](#scriptek)
- [Példa Lekérdezések](#példa-lekérdezések)

## Áttekintés

Ez a projekt SQLite adatbázist használ a webáruház adatainak tárolására. Az adatbázis tartalmazza a termékeket, rendeléseket és admin felhasználókat.

**Adatbázis típus**: SQLite 3
**Adatbázis fájl**: `webaruhaz.db`
**Séma fájl**: `schema.sql`

## Adatbázis Struktúra

### Táblák

#### 1. `termekek` - Termék katalógus

Tartalmazza az összes elérhető kávéterméket.

| Mező | Típus | Megszorítás | Leírás |
|------|-------|-------------|--------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Egyedi azonosító |
| `nev` | TEXT | NOT NULL | Termék neve (pl. "Cappuccino") |
| `leiras` | TEXT | - | Termék leírása |
| `ar` | INTEGER | NOT NULL | Termék ára (Ft) |
| `tipus` | TEXT | NOT NULL, CHECK | Termék típusa: 'coffee' vagy 'espresso' |
| `kep_url` | TEXT | - | Termék kép URL-je (opcionális) |
| `letrehozva` | TEXT | DEFAULT CURRENT_TIMESTAMP | Létrehozás dátuma |
| `frissitve` | TEXT | DEFAULT CURRENT_TIMESTAMP | Utolsó módosítás dátuma |

**Indexek**:
- `idx_termekek_tipus` - Gyors szűrés típus szerint

#### 2. `rendelesek` - Vásárlói rendelések

A vásárlói rendelések fő adatait tartalmazza.

| Mező | Típus | Megszorítás | Leírás |
|------|-------|-------------|--------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Egyedi rendelésazonosító |
| `vevo_nev` | TEXT | NOT NULL | Vevő teljes neve |
| `telefon` | TEXT | NOT NULL | Vevő telefonszáma |
| `email` | TEXT | NOT NULL | Vevő email címe |
| `iranyitoszam` | TEXT | NOT NULL | Szállítási cím - irányítószám |
| `telepules` | TEXT | NOT NULL | Szállítási cím - település |
| `utca_hazszam` | TEXT | NOT NULL | Szállítási cím - utca és házszám |
| `megrendelve` | TEXT | DEFAULT CURRENT_TIMESTAMP | Rendelés leadásának dátuma/ideje |
| `postazva` | INTEGER | DEFAULT 0, CHECK(0 or 1) | Postázási státusz (0=nem, 1=igen) |
| `postazva_datum` | TEXT | - | Postázás dátuma (NULL ha még nincs postázva) |

**Indexek**:
- `idx_rendelesek_megrendelve` - Rendelések időrendi sorrendhez
- `idx_rendelesek_postazva` - Szűrés postázási státusz szerint
- `idx_rendelesek_email` - Keresés email alapján

#### 3. `rendeles_tetelek` - Rendelés tételei

A rendelésekhez tartozó termékek részleteit tartalmazza, módosítókkal együtt.

| Mező | Típus | Megszorítás | Leírás |
|------|-------|-------------|--------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Egyedi tétel azonosító |
| `rendeles_id` | INTEGER | NOT NULL, FOREIGN KEY | Kapcsolódó rendelés ID |
| `termek_nev` | TEXT | NOT NULL | Termék neve (snapshot) |
| `termek_ar` | INTEGER | NOT NULL | Termék ára a rendeléskor (snapshot) |
| `mennyiseg` | INTEGER | NOT NULL | Rendelt mennyiség |
| `tej` | TEXT | NOT NULL | Választott tej típusa |
| `cukor` | TEXT | NOT NULL | Választott cukor mennyiség |

**Foreign Key**: `rendeles_id` → `rendelesek(id)` CASCADE DELETE

**Indexek**:
- `idx_rendeles_tetelek_rendeles_id` - Gyors rendelésenkénti szűrés

**Megjegyzés**: A termék neve és ára snapshot-ként van tárolva, hogy árváltozások esetén is megmaradjon a rendeléskor érvényes ár.

#### 4. `admin` - Admin felhasználók

Admin felhasználók autentikációs adatai.

| Mező | Típus | Megszorítás | Leírás |
|------|-------|-------------|--------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Egyedi felhasználói azonosító |
| `felhasznalonev` | TEXT | NOT NULL, UNIQUE | Admin felhasználónév |
| `jelszo_hash` | TEXT | NOT NULL | Bcrypt hash-elt jelszó |
| `letrehozva` | TEXT | DEFAULT CURRENT_TIMESTAMP | Felhasználó létrehozásának dátuma |

**Alapértelmezett admin**:
- Felhasználónév: `admin`
- Jelszó: `admin123` (**Éles környezetben változtasd meg!**)

## Használat

### Adatbázis inicializálása

Az adatbázis első létrehozásához vagy üres adatbázis létrehozásához:

```bash
node init-db.cjs
```

### Adatbázis újrainicializálása

Ha törölni szeretnéd az összes adatot és újra létrehozni az adatbázist:

```bash
node reset-db.cjs
```

**Figyelem**: Ez az összes adatot törli!

### Adatbázis ellenőrzése

Az adatbázis struktúrájának és tartalmának megtekintéséhez:

```bash
node check-db.cjs
```

## Scriptek

### `init-db.cjs`

Létrehozza az adatbázist és táblákat, ha még nem léteznek.

- Biztonságos: nem törli a meglévő adatokat
- Idempotens: többször is futtatható
- Seed adatok: alapértelmezett termékeket és admin felhasználót hoz létre

### `reset-db.cjs`

Teljesen újrainicializálja az adatbázist.

- **VESZÉLYES**: Törli az összes táblát
- Fejlesztői eszköz: teszteléshez ideális
- Tiszta állapot: új kezdőpont

### `check-db.cjs`

Diagnosztikai eszköz az adatbázis ellenőrzéséhez.

-  Tábla tartalom: listázza az összes adatot
-  Séma: megmutatja a táblastruktúrát
-  Statisztika: termékek, rendelések száma