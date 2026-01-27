-- =============================================================================
-- NeoCoffee Webáruház - Adatbázis Séma
-- =============================================================================
--
-- Ez a fájl tartalmazza a NeoCoffee webáruház SQLite adatbázis sémáját.
-- A szkriptek (init-db.cjs, reset-db.cjs) ezt a fájlt olvassák be
-- az adatbázis struktúra létrehozásához.
--
-- Adatbázis: SQLite 3
-- Fájl: webaruhaz.db
--
-- =============================================================================
-- TÁBLÁK ÁTTEKINTÉSE
-- =============================================================================
--
-- 1. termekek       - Kávétermékek katalógusa (6 kezdő termék)
-- 2. rendelesek     - Vásárlói rendelések (szállítási adatok, státusz)
-- 3. rendeles_tetelek - Rendelési tételek (termékek, mennyiség, módosítók)
-- 4. admin          - Admin felhasználók (autentikációhoz)
--
-- =============================================================================
-- KAPCSOLATOK (RELÁCIÓK)
-- =============================================================================
--
--   rendelesek (1) ──────< (N) rendeles_tetelek
--       │                          │
--       └── id                     └── rendeles_id (FK)
--
-- Egy rendeléshez több tétel tartozhat (1:N kapcsolat)
-- A tételek törlése CASCADE módon történik (rendelés törlésekor a tételek is törlődnek)
--
-- =============================================================================


-- =============================================================================
-- TERMÉKEK TÁBLA (termekek)
-- =============================================================================
-- A webáruházban elérhető kávétermékek tárolására szolgál.
-- Minden terméknek van egyedi azonosítója, neve, ára és opcionális képe.
-- =============================================================================

CREATE TABLE IF NOT EXISTS termekek (
    -- Elsődleges kulcs: 8 karakteres hexadecimális azonosító
    -- Példa: 'a1b2c3d4'
    id TEXT PRIMARY KEY,

    -- Termék neve (kötelező)
    -- Példa: 'Cappuccino', 'Espresso', 'Latte'
    nev TEXT NOT NULL,

    -- Termék ára magyar forintban (kötelező)
    -- Egész szám, nincs tizedes
    -- Példa: 850, 650, 900
    ar INTEGER NOT NULL,

    -- Termék képének URL-je (opcionális)
    -- Lehet abszolút URL vagy relatív elérési út
    -- Példa: '/images/cappuccino.jpg'
    kep_url TEXT
);


-- =============================================================================
-- RENDELÉSEK TÁBLA (rendelesek)
-- =============================================================================
-- A vásárlói rendelések fő adatait tárolja: vásárló adatok, szállítási cím,
-- rendelés dátuma és postázási státusz.
-- =============================================================================

CREATE TABLE IF NOT EXISTS rendelesek (
    -- Elsődleges kulcs: 8 karakteres hexadecimális azonosító
    id TEXT PRIMARY KEY,

    -- Vásárló teljes neve (kötelező)
    -- Példa: 'Kovács János'
    vevo_nev TEXT NOT NULL,

    -- Vásárló telefonszáma (kötelező)
    -- Magyar formátum: '+36301234567' vagy '06301234567'
    telefon TEXT NOT NULL,

    -- Vásárló email címe (kötelező)
    -- Értesítések és visszaigazolás küldéséhez
    email TEXT NOT NULL,

    -- Szállítási cím - Irányítószám (kötelező)
    -- 4 számjegyű magyar irányítószám
    -- Példa: '1051' (Budapest)
    iranyitoszam TEXT NOT NULL,

    -- Szállítási cím - Település (kötelező)
    -- Példa: 'Budapest', 'Szeged', 'Debrecen'
    telepules TEXT NOT NULL,

    -- Szállítási cím - Utca és házszám (kötelező)
    -- Tartalmazhat emelet/ajtó számot is
    -- Példa: 'Váci utca 12.' vagy 'Fő tér 1. 2/3'
    utca_hazszam TEXT NOT NULL,

    -- Rendelés létrehozásának időpontja
    -- Alapértelmezetten az aktuális időbélyeg
    -- ISO 8601 formátum: 'YYYY-MM-DD HH:MM:SS'
    megrendelve TEXT DEFAULT CURRENT_TIMESTAMP,

    -- Postázási státusz (kötelező)
    -- 0 = feldolgozás alatt (még nem postázva)
    -- 1 = postázva (kiszállítva)
    -- CHECK megszorítás biztosítja, hogy csak 0 vagy 1 lehet az érték
    postazva INTEGER DEFAULT 0 CHECK(postazva IN (0, 1)),

    -- Postázás dátuma (opcionális)
    -- NULL, ha még nem postázva
    -- ISO 8601 formátum, ha már postázva
    postazva_datum TEXT
);


-- =============================================================================
-- RENDELÉSI TÉTELEK TÁBLA (rendeles_tetelek)
-- =============================================================================
-- A rendelésekhez tartozó termékeket és azok részleteit tárolja.
-- Minden tétel egy rendeléshez tartozik (idegen kulcs kapcsolat).
-- A tételek tartalmazzák a termék adatait és a vásárló által választott módosítókat.
-- =============================================================================

CREATE TABLE IF NOT EXISTS rendeles_tetelek (
    -- Elsődleges kulcs: 8 karakteres hexadecimális azonosító
    id TEXT PRIMARY KEY,

    -- Idegen kulcs: a rendelés azonosítója (kötelező)
    -- Hivatkozik a rendelesek tábla id mezőjére
    -- ON DELETE CASCADE: rendelés törlésekor a tételek is törlődnek
    rendeles_id TEXT NOT NULL,

    -- Termék neve a rendelés időpontjában (kötelező)
    -- Denormalizált adat: a termék nevét tároljuk, nem csak az ID-t
    -- Ez biztosítja, hogy a rendelés historikus adatai megmaradjanak
    -- akkor is, ha a termék neve később megváltozik
    termek_nev TEXT NOT NULL,

    -- Termék ára a rendelés időpontjában (kötelező)
    -- Denormalizált adat: az árat tároljuk, nem számítjuk újra
    -- Ez biztosítja, hogy az ár ne változzon utólag
    termek_ar INTEGER NOT NULL,

    -- Rendelt mennyiség (kötelező)
    -- Minimum 1, maximum nincs korlátozva
    mennyiseg INTEGER NOT NULL,

    -- Tej típusa - vásárló választása (kötelező)
    -- Lehetséges értékek: 'Nincs', 'Tehéntej', 'Zabtej', 'Mandula tej', 'Kókusz tej'
    tej TEXT NOT NULL,

    -- Cukor mennyisége - vásárló választása (kötelező)
    -- Lehetséges értékek: 'Nincs', '1 kanál', '2 kanál'
    cukor TEXT NOT NULL,

    -- Idegen kulcs megszorítás
    -- Biztosítja, hogy a rendeles_id mindig létező rendelésre mutasson
    -- ON DELETE CASCADE: ha a rendelés törlődik, a tételek is törlődnek
    FOREIGN KEY(rendeles_id) REFERENCES rendelesek(id) ON DELETE CASCADE
);


-- =============================================================================
-- ADMIN FELHASZNÁLÓK TÁBLA (admin)
-- =============================================================================
-- Az admin felhasználók adatait tárolja a bejelentkezéshez.
-- A jelszavak bcrypt hash formátumban vannak tárolva (biztonság!).
-- =============================================================================

CREATE TABLE IF NOT EXISTS admin (
    -- Elsődleges kulcs: 8 karakteres hexadecimális azonosító
    id TEXT PRIMARY KEY,

    -- Felhasználónév (kötelező, egyedi)
    -- UNIQUE megszorítás: nem lehet két azonos felhasználónév
    felhasznalonev TEXT NOT NULL UNIQUE,

    -- Jelszó hash (kötelező)
    -- bcrypt hash formátum: $2b$10$... (60 karakter)
    -- SOHA ne tároljunk plain text jelszavakat!
    jelszo_hash TEXT NOT NULL,

    -- Felhasználó létrehozásának időpontja
    -- Alapértelmezetten az aktuális időbélyeg
    letrehozva TEXT DEFAULT CURRENT_TIMESTAMP
);


-- =============================================================================
-- KEZDŐ TERMÉKEK BESZÚRÁSA
-- =============================================================================
-- A webáruház induló termékei - 6 különböző kávé
-- INSERT OR IGNORE: nem dob hibát, ha a termék már létezik (id alapján)
-- =============================================================================

INSERT OR IGNORE INTO termekek (id, nev, ar, kep_url) VALUES
-- Cappuccino: olasz klasszikus, eszpresszó tejhabbal
('a1b2c3d4', 'Cappuccino', 850, '/images/cappuccino.jpg'),

-- Espresso: tömény, rövid kávé
('b2c3d4e5', 'Espresso', 650, '/images/espresso.webp'),

-- Ristretto: még rövidebb és töményebb, mint az espresso
('c3d4e5f6', 'Ristretto', 850, '/images/ristretto.jpg'),

-- Latte: eszpresszó sok tejjel, lágyabb íz
('d4e5f6a7', 'Latte', 900, '/images/latte.jpg'),

-- Americano: eszpresszó forró vízzel hígítva
('e5f6a7b8', 'Americano', 700, '/images/americano.jpg'),

-- Doppio: dupla adag espresso
('f6a7b8c9', 'Doppio', 800, '/images/doppio.webp');


-- =============================================================================
-- ADMIN FELHASZNÁLÓ MEGJEGYZÉS
-- =============================================================================
-- Az alapértelmezett admin felhasználót az init-db.cjs hozza létre
-- programmatikusan, biztonságos bcrypt hash-sel.
--
-- Alapértelmezett belépési adatok:
--   Felhasználónév: admin
--   Jelszó: Minad123!
--
-- A jelszó hash-t a bcrypt.hash() függvény generálja 10-es salt rounds értékkel.
-- =============================================================================


-- =============================================================================
-- INDEXEK (TELJESÍTMÉNY OPTIMALIZÁLÁS)
-- =============================================================================
-- Az indexek gyorsítják a gyakori lekérdezéseket.
-- CREATE INDEX IF NOT EXISTS: nem dob hibát, ha az index már létezik.
-- =============================================================================

-- Index a rendelés dátumára
-- Használat: rendelések időrendi rendezése (ORDER BY megrendelve)
CREATE INDEX IF NOT EXISTS idx_rendelesek_megrendelve ON rendelesek(megrendelve);

-- Index a postázási státuszra
-- Használat: szűrés postázott/nem postázott rendelésekre (WHERE postazva = 0/1)
CREATE INDEX IF NOT EXISTS idx_rendelesek_postazva ON rendelesek(postazva);

-- Index az email címre
-- Használat: vásárló rendeléseinek keresése email alapján
CREATE INDEX IF NOT EXISTS idx_rendelesek_email ON rendelesek(email);

-- Index a rendelési tételek rendelés azonosítójára
-- Használat: egy rendelés tételeinek gyors lekérdezése (JOIN műveletek)
CREATE INDEX IF NOT EXISTS idx_rendeles_tetelek_rendeles_id ON rendeles_tetelek(rendeles_id);