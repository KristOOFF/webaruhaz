/**
 * NeoCoffee Adatbázis Inicializáló Szkript
 *
 * Ez a szkript felelős az SQLite adatbázis létrehozásáért és inicializálásáért.
 * Futtatáskor létrehozza a szükséges táblákat a schema.sql fájl alapján,
 * majd létrehozza az alapértelmezett admin felhasználót biztonságos bcrypt hash-sel.
 *
 * @file init-db.cjs
 * @description Adatbázis inicializálás - táblák létrehozása és admin felhasználó beállítása
 *
 * Használat:
 *   npm run db:init
 *   vagy
 *   node init-db.cjs
 *
 * Létrehozott táblák:
 *   - termekek: Kávétermékek (id, nev, ar, kep_url)
 *   - rendelesek: Vásárlói rendelések (vevo adatok, szállítási cím, státusz)
 *   - rendeles_tetelek: Rendelés tételek (termék info, módosítók)
 *   - admin: Admin felhasználók (felhasznalonev, jelszo_hash)
 *
 * Admin alapértelmezett belépési adatok:
 *   - Felhasználónév: admin
 *   - Jelszó: Minad123!
 */

// ============================================================================
// MODULOK IMPORTÁLÁSA
// ============================================================================

/**
 * better-sqlite3: Szinkron SQLite adatbázis kezelő Node.js-hez
 * Előnyök: gyors, egyszerű API, natív kötések
 */
const Database = require('better-sqlite3');

/**
 * bcrypt: Jelszó hash-elő könyvtár
 * Biztonságos, egyirányú hash generálás jelszavakhoz
 * A 10-es salt rounds megfelelő biztonságot nyújt
 */
const bcrypt = require('bcrypt');

/**
 * fs: Node.js fájlrendszer modul
 * SQL séma fájl beolvasásához használjuk
 */
const fs = require('fs');

/**
 * path: Node.js útvonal kezelő modul
 * Platform-független fájl útvonalak kezeléséhez
 */
const path = require('path');

/**
 * crypto: Node.js kriptográfiai modul
 * Egyedi azonosítók (ID) generálásához használjuk
 */
const crypto = require('crypto');

// ============================================================================
// SEGÉDFÜGGVÉNYEK
// ============================================================================

/**
 * Egyedi azonosító generálása
 *
 * 8 karakteres hexadecimális string-et generál, ami egyedi azonosítóként
 * szolgál az adatbázis rekordokhoz. A crypto.randomBytes biztosítja
 * a kriptográfiailag biztonságos véletlenszám generálást.
 *
 * @returns {string} 8 karakteres hexadecimális azonosító (pl. "a1b2c3d4")
 *
 * @example
 * const id = generateId(); // "f7e8d9c0"
 */
function generateId() {
    return crypto.randomBytes(4).toString('hex');
}

// ============================================================================
// ADATBÁZIS KAPCSOLAT LÉTREHOZÁSA
// ============================================================================

/**
 * SQLite adatbázis kapcsolat
 *
 * A better-sqlite3 automatikusan létrehozza a fájlt, ha nem létezik.
 * Az adatbázis fájl a projekt gyökerében található: webaruhaz.db
 */
const db = new Database('webaruhaz.db');

/**
 * Foreign Keys (idegen kulcsok) engedélyezése
 *
 * SQLite-ban alapértelmezetten kikapcsolt a foreign key támogatás.
 * Ez a pragma parancs bekapcsolja, így a rendeles_tetelek tábla
 * rendeles_id mezője megfelelően hivatkozik a rendelesek táblára,
 * és a CASCADE törlés is működik.
 */
db.pragma('foreign_keys = ON');

// ============================================================================
// SQL SÉMA BEOLVASÁSA
// ============================================================================

/**
 * SQL séma fájl beolvasása
 *
 * A schema.sql fájl tartalmazza az összes CREATE TABLE utasítást,
 * az indexeket és a kezdő termékadatokat.
 * Az __dirname a jelenlegi fájl könyvtárára mutat.
 */
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

/**
 * SQL utasítások feldolgozása
 *
 * 1. A séma fájlt pontosvesszőnél daraboljuk fel
 * 2. Kiszűrjük az üres utasításokat
 * 3. Kihagyjuk az admin INSERT utasítást, mert azt programmatikusan
 *    kezeljük biztonságos bcrypt hash-sel
 */
const statements = schema.split(';')
    .filter(stmt => stmt.trim().length > 0)
    .filter(stmt => !stmt.includes("INSERT OR IGNORE INTO admin"));

console.log('Adatbázis inicializálása...');

// ============================================================================
// FŐ INICIALIZÁLÓ FÜGGVÉNY
// ============================================================================

/**
 * Adatbázis inicializáló aszinkron függvény
 *
 * Ez a függvény végzi el az adatbázis teljes inicializálását:
 * 1. Lefuttatja az összes SQL utasítást a séma fájlból
 * 2. Létrehozza vagy frissíti az admin felhasználót bcrypt hash-sel
 * 3. Listázza a létrehozott táblákat
 *
 * @async
 * @throws {Error} Ha bármilyen hiba történik az inicializálás során
 */
async function init() {
    try {
        // --------------------------------------------------------------------
        // 1. LÉPÉS: SQL UTASÍTÁSOK VÉGREHAJTÁSA
        // --------------------------------------------------------------------

        /**
         * Végigmegyünk az összes SQL utasításon és végrehajtjuk őket.
         * Ez létrehozza a táblákat, indexeket és beszúrja a kezdő termékeket.
         */
        for (const statement of statements) {
            db.prepare(statement).run();
        }
        console.log('Táblák sikeresen létrehozva!');

        // --------------------------------------------------------------------
        // 2. LÉPÉS: ADMIN FELHASZNÁLÓ KEZELÉSE
        // --------------------------------------------------------------------

        /**
         * Biztonságos jelszó hash generálása bcrypt-tel
         *
         * A bcrypt.hash() aszinkron függvény, ami:
         * - Automatikusan generál egy véletlenszerű salt-ot
         * - A 10-es cost factor megfelelő biztonságot nyújt
         * - Az eredmény egy 60 karakteres hash string
         *
         * Fontos: Soha ne tároljunk plain text jelszavakat!
         */
        const hash = await bcrypt.hash('Minad123!', 10);

        /**
         * Ellenőrizzük, hogy létezik-e már admin felhasználó
         * Ha igen, frissítjük a jelszót, ha nem, létrehozzuk
         */
        const existingAdmin = db.prepare('SELECT id FROM admin WHERE felhasznalonev = ?').get('admin');

        if (!existingAdmin) {
            // Új admin felhasználó létrehozása egyedi ID-val
            const adminId = generateId();
            db.prepare('INSERT INTO admin (id, felhasznalonev, jelszo_hash) VALUES (?, ?, ?)').run(adminId, 'admin', hash);
            console.log('Admin felhasználó létrehozva');
        } else {
            // Meglévő admin jelszavának frissítése
            db.prepare('UPDATE admin SET jelszo_hash = ? WHERE felhasznalonev = ?').run(hash, 'admin');
            console.log('Admin jelszó frissítve');
        }

        // --------------------------------------------------------------------
        // 3. LÉPÉS: LÉTREHOZOTT TÁBLÁK LISTÁZÁSA
        // --------------------------------------------------------------------

        /**
         * Lekérdezzük az összes létrehozott táblát az sqlite_master rendszer táblából
         * Ez megerősítésül szolgál, hogy minden tábla sikeresen létrejött
         */
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
        console.log('\nLétrehozott táblák:');
        tables.forEach(table => {
            console.log(`  - ${table.name}`);
        });

    } catch (error) {
        // Hiba esetén kiírjuk a részleteket és kilépünk 1-es hibakóddal
        console.error('Hiba történt az adatbázis inicializálása során:', error);
        process.exit(1);
    } finally {
        // Mindig lezárjuk az adatbázis kapcsolatot, hiba esetén is
        db.close();
    }

    console.log('\nAdatbázis inicializálás befejezve.');
}

// ============================================================================
// SZKRIPT INDÍTÁSA
// ============================================================================

/**
 * Az init() függvény meghívása
 * Ez a szkript belépési pontja
 */
init();
