-- termekek tábla
CREATE TABLE IF NOT EXISTS termekek (
    id TEXT PRIMARY KEY,
    nev TEXT NOT NULL,
    ar INTEGER NOT NULL,
    kep_url TEXT
);

-- rendelesek tábla
CREATE TABLE IF NOT EXISTS rendelesek (
    id TEXT PRIMARY KEY,
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
    id TEXT PRIMARY KEY,
    rendeles_id TEXT NOT NULL,
    termek_nev TEXT NOT NULL,
    termek_ar INTEGER NOT NULL,
    mennyiseg INTEGER NOT NULL,
    tej TEXT NOT NULL,
    cukor TEXT NOT NULL,
    FOREIGN KEY(rendeles_id) REFERENCES rendelesek(id) ON DELETE CASCADE
);

-- admin tábla
CREATE TABLE IF NOT EXISTS admin (
    id TEXT PRIMARY KEY,
    felhasznalonev TEXT NOT NULL UNIQUE,
    jelszo_hash TEXT NOT NULL,
    letrehozva TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Kezdő termékek beszúrása (fix rövid ID-kkal)
INSERT OR IGNORE INTO termekek (id, nev, ar, kep_url) VALUES
('a1b2c3d4', 'Cappuccino', 850, '/images/cappuccino.jpg'),
('b2c3d4e5', 'Espresso', 650, '/images/espresso.webp'),
('c3d4e5f6', 'Ristretto', 850, '/images/ristretto.jpg'),
('d4e5f6a7', 'Latte', 900, '/images/latte.jpg'),
('e5f6a7b8', 'Americano', 700, '/images/americano.jpg'),
('f6a7b8c9', 'Doppio', 800, '/images/doppio.webp');

-- Alapértelmezett admin felhasználó (ezt a JS kód kezeli, de a séma része lehet)
-- INSERT OR IGNORE INTO admin... (ez a rész rendben volt a JS kódban kezelve)

-- Indexek
CREATE INDEX IF NOT EXISTS idx_rendelesek_megrendelve ON rendelesek(megrendelve);
CREATE INDEX IF NOT EXISTS idx_rendelesek_postazva ON rendelesek(postazva);
CREATE INDEX IF NOT EXISTS idx_rendelesek_email ON rendelesek(email);
CREATE INDEX IF NOT EXISTS idx_rendeles_tetelek_rendeles_id ON rendeles_tetelek(rendeles_id);