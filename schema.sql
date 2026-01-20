-- termekek tábla
CREATE TABLE IF NOT EXISTS termekek (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nev TEXT NOT NULL,
    ar INTEGER NOT NULL,
    kep_url TEXT
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
INSERT OR IGNORE INTO termekek (id, nev, ar) VALUES
(1, 'Cappuccino', 850),
(2, 'Espresso', 650),
(3, 'Ristretto', 850),
(4, 'Latte', 900),
(5, 'Americano', 700),
(6, 'Doppio', 800);

-- Alapértelmezett admin felhasználó (ezt a JS kód kezeli, de a séma része lehet)
-- INSERT OR IGNORE INTO admin... (ez a rész rendben volt a JS kódban kezelve)

-- Indexek
CREATE INDEX IF NOT EXISTS idx_rendelesek_megrendelve ON rendelesek(megrendelve);
CREATE INDEX IF NOT EXISTS idx_rendelesek_postazva ON rendelesek(postazva);
CREATE INDEX IF NOT EXISTS idx_rendelesek_email ON rendelesek(email);
CREATE INDEX IF NOT EXISTS idx_rendeles_tetelek_rendeles_id ON rendeles_tetelek(rendeles_id);