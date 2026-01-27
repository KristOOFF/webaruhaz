/**
 * NeoCoffee Teszt Adatok Betöltő Szkript
 *
 * Ez a szkript teszt rendeléseket hoz létre az adatbázisban fejlesztési
 * és tesztelési célokra. Valósághű magyar vásárlói adatokat tartalmaz,
 * különböző rendelési státuszokkal és tételekkel.
 *
 * @file seed-test-data.cjs
 * @description Teszt rendelések és tételek beszúrása az adatbázisba
 *
 * Használat:
 *   npm run db:seed
 *   vagy
 *   node seed-test-data.cjs
 *
 * Fontos:
 *   - Futtatás előtt az adatbázisnak léteznie kell (npm run db:init)
 *   - A szkript 8 teszt rendelést hoz létre különböző adatokkal
 *   - Minden rendeléshez tartoznak tételek (1-3 db/rendelés)
 *   - Vegyes postázási státuszok: feldolgozás alatt és kiszállítva
 *
 * Teszt adatok tartalma:
 *   - 8 különböző vásárló (magyar nevek és címek)
 *   - Különböző magyar városok (Budapest, Szeged, Debrecen, stb.)
 *   - Vegyes rendelési dátumok
 *   - 3 kiszállított és 5 feldolgozás alatt lévő rendelés
 */

// ============================================================================
// MODULOK IMPORTÁLÁSA
// ============================================================================

/**
 * better-sqlite3: Szinkron SQLite adatbázis kezelő
 * Gyors és egyszerű API a teszt adatok beszúrásához
 */
const Database = require('better-sqlite3');

/**
 * path: Node.js útvonal kezelő modul
 * Az adatbázis fájl elérési útjának meghatározásához
 */
const path = require('path');

/**
 * crypto: Node.js kriptográfiai modul
 * Egyedi azonosítók generálásához a rendelésekhez és tételekhez
 */
const crypto = require('crypto');

// ============================================================================
// SEGÉDFÜGGVÉNYEK
// ============================================================================

/**
 * Egyedi azonosító generálása
 *
 * 8 karakteres hexadecimális string-et generál.
 * Minden rendelés és tétel egyedi ID-t kap.
 *
 * @returns {string} 8 karakteres hexadecimális azonosító
 */
function generateId() {
    return crypto.randomBytes(4).toString('hex');
}

// ============================================================================
// ADATBÁZIS KAPCSOLAT
// ============================================================================

/**
 * Adatbázis fájl elérési útja
 * A projekt gyökerében található webaruhaz.db fájl
 */
const dbPath = path.join(__dirname, 'webaruhaz.db');

/**
 * SQLite adatbázis kapcsolat létrehozása
 * A better-sqlite3 szinkron módon működik
 */
const db = new Database(dbPath);

/**
 * Foreign Keys engedélyezése
 * Szükséges a rendeles_tetelek -> rendelesek kapcsolathoz
 */
db.pragma('foreign_keys = ON');

console.log('Tesztadatok hozzáadása\n');

// ============================================================================
// TESZT RENDELÉSEK ADATAI
// ============================================================================

/**
 * Teszt rendelések tömbje
 *
 * Minden rendelés objektum tartalmazza:
 * - vevo_nev: Vásárló teljes neve
 * - telefon: Magyar formátumú telefonszám
 * - email: Email cím
 * - iranyitoszam: 4 számjegyű magyar irányítószám
 * - telepules: Település neve
 * - utca_hazszam: Utca és házszám (emelet, ajtó opcionális)
 * - megrendelve: Rendelés dátuma ISO formátumban
 * - postazva: Postázási státusz (0 = feldolgozás alatt, 1 = kiszállítva)
 * - postazva_datum: Kiszállítás dátuma (csak ha postazva = 1)
 * - tetelek: Rendelési tételek tömbje
 *
 * Minden tétel tartalmazza:
 * - termek_nev: Termék neve (a termekek táblából)
 * - termek_ar: Termék ára forintban
 * - mennyiseg: Rendelt mennyiség
 * - tej: Tej típusa (Tehéntej, Zabtej, Mandula tej, Tej nélkül)
 * - cukor: Cukor mennyisége (Cukor nélkül, 1 kanál, 2 kanál)
 */
const testOrders = [
  // --------------------------------------------------------------------
  // 1. RENDELÉS - Budapest, feldolgozás alatt
  // --------------------------------------------------------------------
  {
    vevo_nev: 'Kovács János',           // Magyar férfi név
    telefon: '+36301234567',            // Telekom mobil
    email: 'kovacs.janos@example.com',
    iranyitoszam: '1051',               // Budapest, Belváros
    telepules: 'Budapest',
    utca_hazszam: 'Váci utca 12.',
    megrendelve: '2026-01-15 10:30:00', // Reggeli rendelés
    postazva: 0,                        // Még nem postázva
    tetelek: [
      { termek_nev: 'Cappuccino', termek_ar: 850, mennyiseg: 2, tej: 'Tehéntej', cukor: '1 kanál' },
      { termek_nev: 'Latte', termek_ar: 900, mennyiseg: 1, tej: 'Zabtej', cukor: 'Cukor nélkül' }
    ]
  },

  // --------------------------------------------------------------------
  // 2. RENDELÉS - Szeged, kiszállítva
  // --------------------------------------------------------------------
  {
    vevo_nev: 'Nagy Eszter',            // Magyar női név
    telefon: '+36209876543',            // Telenor mobil
    email: 'nagy.eszter@gmail.com',
    iranyitoszam: '6720',               // Szeged, Belváros
    telepules: 'Szeged',
    utca_hazszam: 'Kárász utca 5. 2/3', // Emeletes lakás
    megrendelve: '2026-01-14 14:15:00', // Délutáni rendelés
    postazva: 1,                        // Kiszállítva
    postazva_datum: '2026-01-16 09:00:00', // 2 nappal később
    tetelek: [
      { termek_nev: 'Espresso', termek_ar: 650, mennyiseg: 3, tej: 'Tej nélkül', cukor: 'Cukor nélkül' },
      { termek_nev: 'Doppio', termek_ar: 800, mennyiseg: 1, tej: 'Tej nélkül', cukor: '2 kanál' }
    ]
  },

  // --------------------------------------------------------------------
  // 3. RENDELÉS - Debrecen, feldolgozás alatt
  // --------------------------------------------------------------------
  {
    vevo_nev: 'Szabó Péter',            // Céges rendelés
    telefon: '+36701112233',            // Vodafone mobil
    email: 'szabo.peter@company.hu',    // Céges email
    iranyitoszam: '4024',               // Debrecen, központ
    telepules: 'Debrecen',
    utca_hazszam: 'Piac utca 28.',
    megrendelve: '2026-01-18 08:45:00', // Reggeli rendelés
    postazva: 0,
    tetelek: [
      { termek_nev: 'Americano', termek_ar: 700, mennyiseg: 5, tej: 'Tej nélkül', cukor: '1 kanál' }
    ]
  },

  // --------------------------------------------------------------------
  // 4. RENDELÉS - Győr, kiszállítva (nagy rendelés)
  // --------------------------------------------------------------------
  {
    vevo_nev: 'Tóth Mária',
    telefon: '+36305554444',
    email: 'toth.maria@freemail.hu',    // Freemail cím
    iranyitoszam: '9021',               // Győr, központ
    telepules: 'Győr',
    utca_hazszam: 'Baross Gábor út 15. fszt. 2.', // Földszinti lakás
    megrendelve: '2026-01-10 16:20:00',
    postazva: 1,
    postazva_datum: '2026-01-12 11:30:00',
    tetelek: [
      { termek_nev: 'Latte', termek_ar: 900, mennyiseg: 2, tej: 'Mandula tej', cukor: '1 kanál' },
      { termek_nev: 'Cappuccino', termek_ar: 850, mennyiseg: 2, tej: 'Tehéntej', cukor: '2 kanál' },
      { termek_nev: 'Ristretto', termek_ar: 850, mennyiseg: 1, tej: 'Tej nélkül', cukor: 'Cukor nélkül' }
    ]
  },

  // --------------------------------------------------------------------
  // 5. RENDELÉS - Pécs, feldolgozás alatt
  // --------------------------------------------------------------------
  {
    vevo_nev: 'Horváth Gábor',
    telefon: '+36201234567',            // Telenor mobil
    email: 'horvath.gabor@outlook.com', // Outlook email
    iranyitoszam: '7621',               // Pécs, központ
    telepules: 'Pécs',
    utca_hazszam: 'Király utca 42.',
    megrendelve: '2026-01-19 11:00:00',
    postazva: 0,
    tetelek: [
      { termek_nev: 'Doppio', termek_ar: 800, mennyiseg: 2, tej: 'Tej nélkül', cukor: 'Cukor nélkül' },
      { termek_nev: 'Espresso', termek_ar: 650, mennyiseg: 4, tej: 'Tej nélkül', cukor: '1 kanál' }
    ]
  },

  // --------------------------------------------------------------------
  // 6. RENDELÉS - Eger, feldolgozás alatt (kis rendelés)
  // --------------------------------------------------------------------
  {
    vevo_nev: 'Kiss Anna',
    telefon: '+36309998877',
    email: 'kiss.anna@yahoo.com',       // Yahoo email
    iranyitoszam: '3300',               // Eger
    telepules: 'Eger',
    utca_hazszam: 'Dobó tér 8.',        // Központi tér
    megrendelve: '2026-01-20 09:30:00',
    postazva: 0,
    tetelek: [
      { termek_nev: 'Cappuccino', termek_ar: 850, mennyiseg: 1, tej: 'Zabtej', cukor: '1 kanál' }
    ]
  },

  // --------------------------------------------------------------------
  // 7. RENDELÉS - Veszprém, kiszállítva
  // --------------------------------------------------------------------
  {
    vevo_nev: 'Varga László',
    telefon: '+36707778899',
    email: 'varga.laszlo@test.com',
    iranyitoszam: '8200',               // Veszprém
    telepules: 'Veszprém',
    utca_hazszam: 'Óváros tér 3. 1/5',  // 1. emelet, 5. ajtó
    megrendelve: '2026-01-08 13:45:00',
    postazva: 1,
    postazva_datum: '2026-01-10 08:15:00',
    tetelek: [
      { termek_nev: 'Americano', termek_ar: 700, mennyiseg: 2, tej: 'Tehéntej', cukor: 'Cukor nélkül' },
      { termek_nev: 'Latte', termek_ar: 900, mennyiseg: 3, tej: 'Kókusz tej', cukor: '2 kanál' }
    ]
  },

  // --------------------------------------------------------------------
  // 8. RENDELÉS - Szentendre, feldolgozás alatt
  // --------------------------------------------------------------------
  {
    vevo_nev: 'Molnár Katalin',
    telefon: '+36301112233',
    email: 'molnar.katalin@gmail.com',
    iranyitoszam: '2000',               // Szentendre
    telepules: 'Szentendre',
    utca_hazszam: 'Fő tér 1.',          // Főtéren
    megrendelve: '2026-01-17 15:00:00',
    postazva: 0,
    tetelek: [
      { termek_nev: 'Ristretto', termek_ar: 850, mennyiseg: 2, tej: 'Tej nélkül', cukor: 'Cukor nélkül' },
      { termek_nev: 'Espresso', termek_ar: 650, mennyiseg: 2, tej: 'Tej nélkül', cukor: '1 kanál' }
    ]
  }
];

// ============================================================================
// SQL PREPARED STATEMENTS (ELŐKÉSZÍTETT UTASÍTÁSOK)
// ============================================================================

/**
 * Rendelés beszúró utasítás
 *
 * A ? helyőrzők sorrendben:
 * 1. id - egyedi azonosító
 * 2. vevo_nev - vásárló neve
 * 3. telefon - telefonszám
 * 4. email - email cím
 * 5. iranyitoszam - irányítószám
 * 6. telepules - település
 * 7. utca_hazszam - utca és házszám
 * 8. megrendelve - rendelés időpontja
 * 9. postazva - postázási státusz (0 vagy 1)
 * 10. postazva_datum - postázás időpontja (lehet null)
 */
const insertOrder = db.prepare(`
  INSERT INTO rendelesek (id, vevo_nev, telefon, email, iranyitoszam, telepules, utca_hazszam, megrendelve, postazva, postazva_datum)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

/**
 * Rendelési tétel beszúró utasítás
 *
 * A ? helyőrzők sorrendben:
 * 1. id - tétel egyedi azonosítója
 * 2. rendeles_id - a rendelés azonosítója (idegen kulcs)
 * 3. termek_nev - termék neve
 * 4. termek_ar - termék ára
 * 5. mennyiseg - rendelt mennyiség
 * 6. tej - tej típusa
 * 7. cukor - cukor mennyisége
 */
const insertItem = db.prepare(`
  INSERT INTO rendeles_tetelek (id, rendeles_id, termek_nev, termek_ar, mennyiseg, tej, cukor)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

// ============================================================================
// TRANZAKCIÓ - ADATOK BESZÚRÁSA
// ============================================================================

/**
 * Tranzakciós beszúrás függvény
 *
 * A db.transaction() biztosítja, hogy vagy minden adat beszúrásra kerül,
 * vagy hiba esetén semmi sem. Ez az "all-or-nothing" megközelítés garantálja
 * az adatbázis konzisztenciáját.
 *
 * A tranzakció előnyei:
 * - Atomicitás: minden művelet egyszerre hajtódik végre
 * - Gyorsabb végrehajtás: egyetlen commit a végén
 * - Hibakezelés: hiba esetén automatikus rollback
 */
const insertAll = db.transaction(() => {
  // Végigmegyünk minden teszt rendelésen
  for (const order of testOrders) {
    // Egyedi azonosító generálása a rendeléshez
    const orderId = generateId();

    // Rendelés beszúrása az adatbázisba
    insertOrder.run(
      orderId,
      order.vevo_nev,
      order.telefon,
      order.email,
      order.iranyitoszam,
      order.telepules,
      order.utca_hazszam,
      order.megrendelve,
      order.postazva,
      order.postazva_datum || null  // null, ha nincs postázva
    );

    // Konzol kimenet a rendelésről
    console.log(`Rendelés hozzáadva: #${orderId} - ${order.vevo_nev} (${order.telepules})`);

    // Rendelési tételek beszúrása
    for (const item of order.tetelek) {
      // Egyedi azonosító minden tételhez
      const itemId = generateId();

      // Tétel beszúrása
      insertItem.run(
        itemId,
        orderId,          // Kapcsolat a rendeléshez
        item.termek_nev,
        item.termek_ar,
        item.mennyiseg,
        item.tej,
        item.cukor
      );

      // Konzol kimenet a tételről
      console.log(`${item.mennyiseg} ${item.termek_nev} (${item.tej}, ${item.cukor})`);
    }
  }
});

// ============================================================================
// SZKRIPT VÉGREHAJTÁSA
// ============================================================================

try {
  // Tranzakció futtatása - minden adat beszúrása
  insertAll();

  // ------------------------------------------------------------------------
  // ÖSSZESÍTŐ STATISZTIKÁK
  // ------------------------------------------------------------------------

  /**
   * Statisztikák lekérdezése a beszúrt adatokról
   * COUNT(*) lekérdezések a különböző táblákból
   */

  // Összes rendelés száma
  const orderCount = db.prepare('SELECT COUNT(*) as count FROM rendelesek').get().count;

  // Összes rendelési tétel száma
  const itemCount = db.prepare('SELECT COUNT(*) as count FROM rendeles_tetelek').get().count;

  // Kiszállított rendelések száma
  const shippedCount = db.prepare('SELECT COUNT(*) as count FROM rendelesek WHERE postazva = 1').get().count;

  // Feldolgozás alatt lévő rendelések száma
  const pendingCount = db.prepare('SELECT COUNT(*) as count FROM rendelesek WHERE postazva = 0').get().count;

  // Összesítés megjelenítése
  console.log('\n Összesítés');
  console.log(`Összes rendelés: ${orderCount}`);
  console.log(`Összes tétel: ${itemCount}`);
  console.log(`Postázott: ${shippedCount}`);
  console.log(`Függőben: ${pendingCount}`);
  console.log('\n Tesztadatok sikeresen hozzáadva!');

} catch (error) {
  // Hiba esetén hibaüzenet és kilépés 1-es kóddal
  console.error('Hiba történt:', error.message);
  process.exit(1);
} finally {
  // Adatbázis kapcsolat lezárása (mindig lefut)
  db.close();
}
