/**
 * NeoCoffee Adatbázis Újrainicializáló Szkript
 *
 * Ez a szkript törli az összes meglévő táblát és újra létrehozza őket
 * a schema.sql fájl alapján. Hasznos fejlesztés során, amikor tiszta
 * adatbázisra van szükség.
 *
 * @file reset-db.cjs
 * @description Adatbázis teljes újrainicializálása - táblák törlése és újralétrehozása
 *
 * Használat:
 *   npm run db:reset
 *   vagy
 *   node reset-db.cjs
 *
 * FIGYELEM:
 *   - Ez a szkript TÖRLI az összes meglévő adatot!
 *   - A rendelések, tételek és admin felhasználók elvesznek!
 *   - Csak a kezdő termékek és a schema.sql-ben definiált adatok maradnak meg!
 *   - Production környezetben NE használd!
 *
 * A szkript lépései:
 *   1. Meglévő táblák törlése (DROP TABLE)
 *   2. Új táblák létrehozása a schema.sql alapján
 *   3. Kezdő termékek beszúrása
 *   4. Ellenőrzés és összesítés
 *
 * Fontos különbség az init-db.cjs-hez képest:
 *   - Az init-db.cjs csak létrehozza a táblákat, ha nem léteznek (CREATE IF NOT EXISTS)
 *   - A reset-db.cjs TÖRLI és újra létrehozza a táblákat (DROP + CREATE)
 */

// ============================================================================
// MODULOK IMPORTÁLÁSA
// ============================================================================

/**
 * better-sqlite3: Szinkron SQLite adatbázis kezelő
 * Gyors és egyszerű API az adatbázis műveletek végrehajtásához
 */
const Database = require('better-sqlite3');

/**
 * fs: Node.js fájlrendszer modul
 * A schema.sql fájl beolvasásához használjuk
 */
const fs = require('fs');

/**
 * path: Node.js útvonal kezelő modul
 * Platform-független fájl útvonalak kezeléséhez
 */
const path = require('path');

// ============================================================================
// SZKRIPT INDÍTÁSA
// ============================================================================

console.log('Adatbázis újrainicializálása...');

// ============================================================================
// ADATBÁZIS KAPCSOLAT
// ============================================================================

/**
 * SQLite adatbázis kapcsolat létrehozása
 * A projekt gyökerében lévő webaruhaz.db fájlt nyitja meg
 * Ha a fájl nem létezik, a better-sqlite3 automatikusan létrehozza
 */
const db = new Database('webaruhaz.db');

// ============================================================================
// FŐ LOGIKA - TRY-CATCH-FINALLY BLOKK
// ============================================================================

try {
    // ------------------------------------------------------------------------
    // 1. LÉPÉS: RÉGI TÁBLÁK TÖRLÉSE
    // ------------------------------------------------------------------------

    /**
     * Táblák törlése meghatározott sorrendben
     *
     * FONTOS: A törlési sorrend számít a foreign key megszorítások miatt!
     * Először a gyermek táblákat kell törölni (amelyek idegen kulcsot tartalmaznak),
     * majd csak utána a szülő táblákat.
     *
     * Törlési sorrend:
     * 1. rendeles_tetelek - hivatkozik a rendelesek táblára
     * 2. rendelesek - független tábla
     * 3. termekek - független tábla
     * 4. admin - független tábla
     *
     * Az IF EXISTS biztosítja, hogy nem lesz hiba, ha a tábla nem létezik
     */
    console.log('Régi táblák törlése...');

    // Gyermek tábla törlése először (idegen kulcs miatt)
    db.prepare('DROP TABLE IF EXISTS rendeles_tetelek').run();

    // Szülő táblák törlése
    db.prepare('DROP TABLE IF EXISTS rendelesek').run();
    db.prepare('DROP TABLE IF EXISTS termekek').run();
    db.prepare('DROP TABLE IF EXISTS admin').run();

    console.log('Régi táblák törölve');

    // ------------------------------------------------------------------------
    // 2. LÉPÉS: SQL SÉMA BEOLVASÁSA ÉS FELDOLGOZÁSA
    // ------------------------------------------------------------------------

    /**
     * A schema.sql fájl beolvasása
     *
     * A fájl tartalmazza:
     * - CREATE TABLE utasítások
     * - INDEX létrehozások
     * - Kezdő termékek INSERT utasításai
     */
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    /**
     * SQL utasítások feldolgozása
     *
     * A séma fájlt pontosvesszőknél daraboljuk szét,
     * majd kiszűrjük az üres utasításokat.
     */
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);

    // ------------------------------------------------------------------------
    // 3. LÉPÉS: ÚJ TÁBLÁK LÉTREHOZÁSA
    // ------------------------------------------------------------------------

    /**
     * SQL utasítások végrehajtása
     *
     * Minden utasítást külön futtatunk a db.prepare().run() metódussal.
     * Ez létrehozza a táblákat, indexeket és beszúrja a kezdő termékeket.
     */
    console.log('\n Új táblák létrehozása...');

    for (const statement of statements) {
        db.prepare(statement).run();
    }

    console.log('Táblák sikeresen létrehozva!');

    // ------------------------------------------------------------------------
    // 4. LÉPÉS: ELLENŐRZÉS ÉS ÖSSZESÍTÉS
    // ------------------------------------------------------------------------

    /**
     * Létrehozott táblák listázása
     *
     * Az sqlite_master rendszer tábla tartalmazza az összes adatbázis objektumot.
     * A type='table' szűrő csak a táblákat adja vissza.
     */
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
    console.log('\n Létrehozott táblák:');
    tables.forEach(table => {
        console.log(`  - ${table.name}`);
    });

    /**
     * Termékek számának ellenőrzése
     *
     * A schema.sql tartalmazza a kezdő termékek INSERT utasításait,
     * így itt ellenőrizzük, hogy sikeresen betöltődtek-e.
     */
    const productCount = db.prepare('SELECT COUNT(*) as count FROM termekek').get();
    console.log(`\n${productCount.count} termék betöltve`);

    /**
     * Admin felhasználók számának ellenőrzése
     *
     * Megjegyzés: A reset-db.cjs nem hoz létre admin felhasználót automatikusan!
     * Az admin felhasználó létrehozásához futtasd az init-db.cjs szkriptet.
     */
    const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin').get();
    console.log(`${adminCount.count} admin felhasználó létrehozva`);

} catch (error) {
    // ------------------------------------------------------------------------
    // HIBAKEZELÉS
    // ------------------------------------------------------------------------

    /**
     * Hiba esetén kiírjuk a részletes hibaüzenetet és kilépünk 1-es kóddal.
     * A 1-es kilépési kód jelzi a hívó folyamatnak, hogy hiba történt.
     */
    console.error('Hiba történt az adatbázis újrainicializálása során:', error);
    process.exit(1);

} finally {
    // ------------------------------------------------------------------------
    // LEZÁRÁS (MINDIG LEFUT)
    // ------------------------------------------------------------------------

    /**
     * Adatbázis kapcsolat lezárása
     *
     * A finally blokk biztosítja, hogy a kapcsolat mindig lezáródik,
     * függetlenül attól, hogy hiba történt-e vagy sem.
     * Ez fontos az erőforrások megfelelő felszabadításához.
     */
    db.close();
}

// ============================================================================
// BEFEJEZÉS
// ============================================================================

console.log('\n Adatbázis sikeresen újrainicializálva!');
