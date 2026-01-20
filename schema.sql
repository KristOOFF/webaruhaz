-- NeoCoffee Webáruház - SQLite Adatbázis Séma
-- Frissítve: 2026-01-14
--
-- Ez a séma tartalmazza a webáruház működéséhez szükséges táblákat:
-- - termekek: kávétermékek katalógusa
-- - rendelesek: vásárlói rendelések fő adatai
-- - rendeles_tetelek: rendeléshez tartozó tételek (termékek, módosítók)
-- - admin: admin felhasználók autentikációhoz

-- termekek tábla
CREATE TABLE IF NOT EXISTS termekek (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nev TEXT NOT NULL,
    leiras TEXT,
    ar INTEGER NOT NULL,
    tipus TEXT NOT NULL CHECK(tipus IN ('coffee', 'espresso')),
    kep_url TEXT,
    letrehozva TEXT DEFAULT CURRENT_TIMESTAMP,
    frissitve TEXT DEFAULT CURRENT_TIMESTAMP
);

-- rendelesek tábla
CREATE TABLE IF NOT EXISTS rendelesek (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vevo_nev TEXT NOT NULL,
    telefon TEXT NOT NULL,
    email TEXT NOT NULL,
    iranyitoszam TEXT NOT NULL,
    telepules TEXT NOT NULL,
    utca_hazszam TEXT NOT NULL,
    megrendelve TEXT DEFAULT CURRENT_TIMESTAMP,
    postazva INTEGER DEFAULT 0 CHECK(postazva IN (0, 1)),
    postazva_datum TEXT
);

-- rendeles_tetelek tábla
CREATE TABLE IF NOT EXISTS rendeles_tetelek (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rendeles_id INTEGER NOT NULL,
    termek_nev TEXT NOT NULL,
    termek_ar INTEGER NOT NULL,
    mennyiseg INTEGER NOT NULL,
    tej TEXT NOT NULL,
    cukor TEXT NOT NULL,
    FOREIGN KEY(rendeles_id) REFERENCES rendelesek(id) ON DELETE CASCADE
);

-- admin tábla
CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    felhasznalonev TEXT NOT NULL UNIQUE,
    jelszo_hash TEXT NOT NULL,
    letrehozva TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Kezdő termékek beszúrása
INSERT OR IGNORE INTO termekek (id, nev, leiras, ar, tipus) VALUES
(1, 'Cappuccino', 'Klasszikus olasz kávé tejhabbal', 850, 'coffee'),
(2, 'Espresso', 'Erős, tömény kávé', 650, 'espresso'),
(3, 'Cappuccino', 'Klasszikus olasz kávé tejhabbal', 850, 'coffee'),
(4, 'Latte', 'Kávé sok tejjel', 900, 'coffee'),
(5, 'Americano', 'Espresso vízzel hígítva', 700, 'espresso'),
(6, 'Doppio', 'Dupla espresso', 800, 'espresso');

-- Alapértelmezett admin felhasználó
-- Jelszó: admin123 (bcrypt hash - éles környezetben változtasd meg!)
INSERT OR IGNORE INTO admin (id, felhasznalonev, jelszo_hash) VALUES
(1, 'admin', '$2a$10$rZGKvE7LQVQXfN5wD7Jv6.kxYKvZHZD6Z0mZYZGBPZ0ZGBPZGBPZGe');

-- Indexek a teljesítmény javítására
CREATE INDEX IF NOT EXISTS idx_termekek_tipus ON termekek(tipus);
CREATE INDEX IF NOT EXISTS idx_rendelesek_megrendelve ON rendelesek(megrendelve);
CREATE INDEX IF NOT EXISTS idx_rendelesek_postazva ON rendelesek(postazva);
CREATE INDEX IF NOT EXISTS idx_rendelesek_email ON rendelesek(email);
CREATE INDEX IF NOT EXISTS idx_rendeles_tetelek_rendeles_id ON rendeles_tetelek(rendeles_id);
