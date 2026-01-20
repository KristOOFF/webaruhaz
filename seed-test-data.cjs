const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'webaruhaz.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

console.log('=== Tesztadatok hozzáadása ===\n');

// Tesztrendelések adatai
const testOrders = [
  {
    vevo_nev: 'Kovács János',
    telefon: '+36301234567',
    email: 'kovacs.janos@example.com',
    iranyitoszam: '1051',
    telepules: 'Budapest',
    utca_hazszam: 'Váci utca 12.',
    megrendelve: '2026-01-15 10:30:00',
    postazva: 0,
    tetelek: [
      { termek_nev: 'Cappuccino', termek_ar: 850, mennyiseg: 2, tej: 'Tehéntej', cukor: '1 kanál' },
      { termek_nev: 'Latte', termek_ar: 900, mennyiseg: 1, tej: 'Zabtej', cukor: 'Cukor nélkül' }
    ]
  },
  {
    vevo_nev: 'Nagy Eszter',
    telefon: '+36209876543',
    email: 'nagy.eszter@gmail.com',
    iranyitoszam: '6720',
    telepules: 'Szeged',
    utca_hazszam: 'Kárász utca 5. 2/3',
    megrendelve: '2026-01-14 14:15:00',
    postazva: 1,
    postazva_datum: '2026-01-16 09:00:00',
    tetelek: [
      { termek_nev: 'Espresso', termek_ar: 650, mennyiseg: 3, tej: 'Tej nélkül', cukor: 'Cukor nélkül' },
      { termek_nev: 'Doppio', termek_ar: 800, mennyiseg: 1, tej: 'Tej nélkül', cukor: '2 kanál' }
    ]
  },
  {
    vevo_nev: 'Szabó Péter',
    telefon: '+36701112233',
    email: 'szabo.peter@company.hu',
    iranyitoszam: '4024',
    telepules: 'Debrecen',
    utca_hazszam: 'Piac utca 28.',
    megrendelve: '2026-01-18 08:45:00',
    postazva: 0,
    tetelek: [
      { termek_nev: 'Americano', termek_ar: 700, mennyiseg: 5, tej: 'Tej nélkül', cukor: '1 kanál' }
    ]
  },
  {
    vevo_nev: 'Tóth Mária',
    telefon: '+36305554444',
    email: 'toth.maria@freemail.hu',
    iranyitoszam: '9021',
    telepules: 'Győr',
    utca_hazszam: 'Baross Gábor út 15. fszt. 2.',
    megrendelve: '2026-01-10 16:20:00',
    postazva: 1,
    postazva_datum: '2026-01-12 11:30:00',
    tetelek: [
      { termek_nev: 'Latte', termek_ar: 900, mennyiseg: 2, tej: 'Mandula tej', cukor: '1 kanál' },
      { termek_nev: 'Cappuccino', termek_ar: 850, mennyiseg: 2, tej: 'Tehéntej', cukor: '2 kanál' },
      { termek_nev: 'Ristretto', termek_ar: 850, mennyiseg: 1, tej: 'Tej nélkül', cukor: 'Cukor nélkül' }
    ]
  },
  {
    vevo_nev: 'Horváth Gábor',
    telefon: '+36201234567',
    email: 'horvath.gabor@outlook.com',
    iranyitoszam: '7621',
    telepules: 'Pécs',
    utca_hazszam: 'Király utca 42.',
    megrendelve: '2026-01-19 11:00:00',
    postazva: 0,
    tetelek: [
      { termek_nev: 'Doppio', termek_ar: 800, mennyiseg: 2, tej: 'Tej nélkül', cukor: 'Cukor nélkül' },
      { termek_nev: 'Espresso', termek_ar: 650, mennyiseg: 4, tej: 'Tej nélkül', cukor: '1 kanál' }
    ]
  },
  {
    vevo_nev: 'Kiss Anna',
    telefon: '+36309998877',
    email: 'kiss.anna@yahoo.com',
    iranyitoszam: '3300',
    telepules: 'Eger',
    utca_hazszam: 'Dobó tér 8.',
    megrendelve: '2026-01-20 09:30:00',
    postazva: 0,
    tetelek: [
      { termek_nev: 'Cappuccino', termek_ar: 850, mennyiseg: 1, tej: 'Zabtej', cukor: '1 kanál' }
    ]
  },
  {
    vevo_nev: 'Varga László',
    telefon: '+36707778899',
    email: 'varga.laszlo@test.com',
    iranyitoszam: '8200',
    telepules: 'Veszprém',
    utca_hazszam: 'Óváros tér 3. 1/5',
    megrendelve: '2026-01-08 13:45:00',
    postazva: 1,
    postazva_datum: '2026-01-10 08:15:00',
    tetelek: [
      { termek_nev: 'Americano', termek_ar: 700, mennyiseg: 2, tej: 'Tehéntej', cukor: 'Cukor nélkül' },
      { termek_nev: 'Latte', termek_ar: 900, mennyiseg: 3, tej: 'Kókusz tej', cukor: '2 kanál' }
    ]
  },
  {
    vevo_nev: 'Molnár Katalin',
    telefon: '+36301112233',
    email: 'molnar.katalin@gmail.com',
    iranyitoszam: '2000',
    telepules: 'Szentendre',
    utca_hazszam: 'Fő tér 1.',
    megrendelve: '2026-01-17 15:00:00',
    postazva: 0,
    tetelek: [
      { termek_nev: 'Ristretto', termek_ar: 850, mennyiseg: 2, tej: 'Tej nélkül', cukor: 'Cukor nélkül' },
      { termek_nev: 'Espresso', termek_ar: 650, mennyiseg: 2, tej: 'Tej nélkül', cukor: '1 kanál' }
    ]
  }
];

// SQL statements
const insertOrder = db.prepare(`
  INSERT INTO rendelesek (vevo_nev, telefon, email, iranyitoszam, telepules, utca_hazszam, megrendelve, postazva, postazva_datum)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertItem = db.prepare(`
  INSERT INTO rendeles_tetelek (rendeles_id, termek_nev, termek_ar, mennyiseg, tej, cukor)
  VALUES (?, ?, ?, ?, ?, ?)
`);

// Transaction
const insertAll = db.transaction(() => {
  for (const order of testOrders) {
    const result = insertOrder.run(
      order.vevo_nev,
      order.telefon,
      order.email,
      order.iranyitoszam,
      order.telepules,
      order.utca_hazszam,
      order.megrendelve,
      order.postazva,
      order.postazva_datum || null
    );

    const orderId = result.lastInsertRowid;
    console.log(`✓ Rendelés hozzáadva: #${orderId} - ${order.vevo_nev} (${order.telepules})`);

    for (const item of order.tetelek) {
      insertItem.run(
        orderId,
        item.termek_nev,
        item.termek_ar,
        item.mennyiseg,
        item.tej,
        item.cukor
      );
      console.log(`  └─ ${item.mennyiseg}x ${item.termek_nev} (${item.tej}, ${item.cukor})`);
    }
  }
});

try {
  insertAll();

  // Összesítés
  const orderCount = db.prepare('SELECT COUNT(*) as count FROM rendelesek').get().count;
  const itemCount = db.prepare('SELECT COUNT(*) as count FROM rendeles_tetelek').get().count;
  const shippedCount = db.prepare('SELECT COUNT(*) as count FROM rendelesek WHERE postazva = 1').get().count;
  const pendingCount = db.prepare('SELECT COUNT(*) as count FROM rendelesek WHERE postazva = 0').get().count;

  console.log('\n=== Összesítés ===');
  console.log(`Összes rendelés: ${orderCount}`);
  console.log(`Összes tétel: ${itemCount}`);
  console.log(`Postázott: ${shippedCount}`);
  console.log(`Függőben: ${pendingCount}`);
  console.log('\n✓ Tesztadatok sikeresen hozzáadva!');

} catch (error) {
  console.error('Hiba történt:', error.message);
  process.exit(1);
} finally {
  db.close();
}
