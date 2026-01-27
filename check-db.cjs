/**
 * NeoCoffee Adatbázis Diagnosztikai Eszköz
 *
 * Ez a szkript részletes áttekintést nyújt az adatbázis tartalmáról és struktúrájáról.
 * Fejlesztés és hibakeresés során használható az adatok és a séma ellenőrzésére.
 *
 * @file check-db.cjs
 * @description Adatbázis tartalom és struktúra megjelenítése diagnosztikai célokra
 *
 * Használat:
 *   npm run db:check
 *   vagy
 *   node check-db.cjs
 *
 * Megjelenített információk:
 *   1. Termékek tábla tartalma (id, név, ár, típus, leírás)
 *   2. Rendelések tábla tartalma (vásárló adatok, cím, státusz)
 *   3. Admin felhasználók listája (jelszó nélkül!)
 *   4. Táblák sémái (oszlopok, típusok, megszorítások)
 *   5. Létrehozott indexek listája
 *
 * Kimenet:
 *   - Konzolra írja az összes információt formázott módon
 *   - Szekciók vizuálisan elkülönítve vonalakkal
 */

// ============================================================================
// MODULOK IMPORTÁLÁSA
// ============================================================================

/**
 * better-sqlite3: Szinkron SQLite adatbázis kezelő
 * Egyszerű és gyors lekérdezéseket tesz lehetővé
 */
const Database = require('better-sqlite3');

// ============================================================================
// ADATBÁZIS KAPCSOLAT
// ============================================================================

/**
 * SQLite adatbázis kapcsolat létrehozása
 * A projekt gyökerében lévő webaruhaz.db fájlt nyitja meg
 */
const db = new Database('webaruhaz.db');

// ============================================================================
// DIAGNOSZTIKAI KIMENET
// ============================================================================

console.log('=== NeoCoffee Adatbázis Struktúra ===\n');

// ----------------------------------------------------------------------------
// 1. TERMÉKEK TÁBLA
// ----------------------------------------------------------------------------

/**
 * Termékek megjelenítése
 *
 * A termekek tábla tartalmazza az összes elérhető kávéterméket.
 * Minden termék rendelkezik egyedi azonosítóval, névvel, árral és képpel.
 */
console.log(' TERMÉKEK TÁBLA');
console.log('─'.repeat(50));  // Vizuális elválasztó vonal

// Összes termék lekérdezése
const products = db.prepare('SELECT * FROM termekek').all();
console.log(`Termékek száma: ${products.length}\n`);

// Termékek részletes listázása
products.forEach(p => {
    console.log(`#${p.id} - ${p.nev} (${p.tipus})`);
    console.log(`   Ár: ${p.ar} Ft`);
    console.log(`   Leírás: ${p.leiras || 'Nincs'}`);
    console.log('');  // Üres sor a termékek között
});

// ----------------------------------------------------------------------------
// 2. RENDELÉSEK TÁBLA
// ----------------------------------------------------------------------------

/**
 * Rendelések megjelenítése
 *
 * A rendelesek tábla tartalmazza az összes vásárlói rendelést.
 * Minden rendeléshez tartozik vásárló adat, szállítási cím és státusz.
 */
console.log('\n RENDELÉSEK TÁBLA');
console.log('─'.repeat(50));

// Összes rendelés lekérdezése
const orders = db.prepare('SELECT * FROM rendelesek').all();
console.log(`Rendelések száma: ${orders.length}`);

// Rendelések részletes listázása (ha vannak)
if (orders.length > 0) {
    orders.forEach(o => {
        console.log(`\n#${o.id} - ${o.vevo_nev}`);
        console.log(`   Email: ${o.email}`);
        console.log(`   Telefon: ${o.telefon}`);
        console.log(`   Cím: ${o.iranyitoszam} ${o.telepules}, ${o.utca_hazszam}`);
        console.log(`   Megrendelve: ${o.megrendelve}`);
        // Postázási státusz megjelenítése (igen/nem és dátum)
        console.log(`   Postázva: ${o.postazva ? 'Igen (' + o.postazva_datum + ')' : 'Nem'}`);
    });
} else {
    console.log('(Még nincsenek rendelések)\n');
}

// ----------------------------------------------------------------------------
// 3. ADMIN FELHASZNÁLÓK
// ----------------------------------------------------------------------------

/**
 * Admin felhasználók megjelenítése
 *
 * FONTOS: A jelszó hash-t nem jelenítjük meg biztonsági okokból!
 * Csak az id, felhasználónév és létrehozás dátuma látható.
 */
console.log('\n ADMIN FELHASZNÁLÓK');
console.log('─'.repeat(50));

// Admin felhasználók lekérdezése (jelszó hash nélkül!)
const admins = db.prepare('SELECT id, felhasznalonev, letrehozva FROM admin').all();
console.log(`Admin felhasználók száma: ${admins.length}\n`);

// Admin felhasználók listázása
admins.forEach(a => {
    console.log(`#${a.id} - ${a.felhasznalonev}`);
    console.log(`   Létrehozva: ${a.letrehozva}`);
    console.log('');
});

// ----------------------------------------------------------------------------
// 4. TÁBLA SÉMÁK (STRUKTÚRA)
// ----------------------------------------------------------------------------

/**
 * Tábla sémák megjelenítése
 *
 * A PRAGMA table_info() parancs visszaadja a tábla oszlopainak részleteit:
 * - cid: Oszlop index
 * - name: Oszlop neve
 * - type: Adattípus (TEXT, INTEGER, stb.)
 * - notnull: NOT NULL megszorítás (0 vagy 1)
 * - dflt_value: Alapértelmezett érték
 * - pk: Primary Key (1 ha elsődleges kulcs)
 */
console.log('\n TÁBLA SÉMÁK');
console.log('─'.repeat(50));

// Ellenőrizendő táblák listája
const tables = ['termekek', 'rendelesek', 'rendeles_tetelek', 'admin'];

// Minden tábla sémájának megjelenítése
tables.forEach(tableName => {
    console.log(`\n${tableName.toUpperCase()}:`);

    // Tábla információk lekérdezése
    const schema = db.prepare(`PRAGMA table_info(${tableName})`).all();

    // Oszlopok részletes megjelenítése
    schema.forEach(col => {
        // Megszorítások összegyűjtése
        const notNull = col.notnull ? 'NOT NULL' : '';      // Kötelező mező
        const pk = col.pk ? 'PRIMARY KEY' : '';              // Elsődleges kulcs
        const dflt = col.dflt_value ? `DEFAULT ${col.dflt_value}` : '';  // Alapérték

        // Formázott kimenet: "- oszlopnév (típus) megszorítások"
        console.log(`  - ${col.name} (${col.type}) ${notNull} ${pk} ${dflt}`.trim());
    });
});

// ----------------------------------------------------------------------------
// 5. INDEXEK
// ----------------------------------------------------------------------------

/**
 * Adatbázis indexek megjelenítése
 *
 * Az indexek gyorsítják a kereséseket és rendezéseket.
 * A sqlite_master tábla tartalmazza az összes adatbázis objektumot.
 * Kiszűrjük a SQLite belső indexeit (sqlite_autoindex_*).
 */
console.log('\n\n INDEXEK');
console.log('─'.repeat(50));

// Felhasználói indexek lekérdezése (SQLite belső indexek kiszűrve)
const indexes = db.prepare("SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'").all();

// Indexek listázása
indexes.forEach(idx => {
    console.log(`  - ${idx.name} (${idx.tbl_name})`);  // Index neve és a tábla
});

// ============================================================================
// LEZÁRÁS
// ============================================================================

/**
 * Adatbázis kapcsolat lezárása
 * Fontos a kapcsolat megfelelő lezárása az erőforrások felszabadításához
 */
db.close();

console.log('\n\n Adatbázis ellenőrzés befejezve!');
