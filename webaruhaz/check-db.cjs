const Database = require('better-sqlite3');

const db = new Database('webaruhaz.db');

console.log('=== NeoCoffee Adatbázis Struktúra ===\n');

// Termékek tábla
console.log('📦 TERMÉKEK TÁBLA');
console.log('─'.repeat(50));
const products = db.prepare('SELECT * FROM termekek').all();
console.log(`Termékek száma: ${products.length}\n`);
products.forEach(p => {
    console.log(`#${p.id} - ${p.nev} (${p.tipus})`);
    console.log(`   Ár: ${p.ar} Ft`);
    console.log(`   Leírás: ${p.leiras || 'Nincs'}`);
    console.log('');
});

// Rendelések tábla
console.log('\n📋 RENDELÉSEK TÁBLA');
console.log('─'.repeat(50));
const orders = db.prepare('SELECT * FROM rendelesek').all();
console.log(`Rendelések száma: ${orders.length}`);
if (orders.length > 0) {
    orders.forEach(o => {
        console.log(`\n#${o.id} - ${o.vevo_nev}`);
        console.log(`   Email: ${o.email}`);
        console.log(`   Telefon: ${o.telefon}`);
        console.log(`   Cím: ${o.iranyitoszam} ${o.telepules}, ${o.utca_hazszam}`);
        console.log(`   Megrendelve: ${o.megrendelve}`);
        console.log(`   Postázva: ${o.postazva ? 'Igen (' + o.postazva_datum + ')' : 'Nem'}`);
    });
} else {
    console.log('(Még nincsenek rendelések)\n');
}

// Admin tábla
console.log('\n👤 ADMIN FELHASZNÁLÓK');
console.log('─'.repeat(50));
const admins = db.prepare('SELECT id, felhasznalonev, letrehozva FROM admin').all();
console.log(`Admin felhasználók száma: ${admins.length}\n`);
admins.forEach(a => {
    console.log(`#${a.id} - ${a.felhasznalonev}`);
    console.log(`   Létrehozva: ${a.letrehozva}`);
    console.log('');
});

// Tábla sémák
console.log('\n🔧 TÁBLA SÉMÁK');
console.log('─'.repeat(50));

const tables = ['termekek', 'rendelesek', 'rendeles_tetelek', 'admin'];
tables.forEach(tableName => {
    console.log(`\n${tableName.toUpperCase()}:`);
    const schema = db.prepare(`PRAGMA table_info(${tableName})`).all();
    schema.forEach(col => {
        const notNull = col.notnull ? 'NOT NULL' : '';
        const pk = col.pk ? 'PRIMARY KEY' : '';
        const dflt = col.dflt_value ? `DEFAULT ${col.dflt_value}` : '';
        console.log(`  - ${col.name} (${col.type}) ${notNull} ${pk} ${dflt}`.trim());
    });
});

// Indexek
console.log('\n\n📊 INDEXEK');
console.log('─'.repeat(50));
const indexes = db.prepare("SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'").all();
indexes.forEach(idx => {
    console.log(`  - ${idx.name} (${idx.tbl_name})`);
});

db.close();

console.log('\n\n✅ Adatbázis ellenőrzés befejezve!');
