const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

console.log('Adatbázis újrainicializálása...');

// Adatbázis megnyitása
const db = new Database('webaruhaz.db');

try {
    // Régi táblák törlése
    console.log('Régi táblák törlése...');
    db.prepare('DROP TABLE IF EXISTS rendeles_tetelek').run();
    db.prepare('DROP TABLE IF EXISTS rendelesek').run();
    db.prepare('DROP TABLE IF EXISTS termekek').run();
    db.prepare('DROP TABLE IF EXISTS admin').run();
    console.log('✓ Régi táblák törölve');

    // SQL séma beolvasása
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    // SQL parancsok futtatása
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);

    console.log('\nÚj táblák létrehozása...');
    for (const statement of statements) {
        db.prepare(statement).run();
    }
    console.log('✓ Táblák sikeresen létrehozva!');

    // Táblák listázása
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
    console.log('\nLétrehozott táblák:');
    tables.forEach(table => {
        console.log(`  - ${table.name}`);
    });

    // Termékek számának ellenőrzése
    const productCount = db.prepare('SELECT COUNT(*) as count FROM termekek').get();
    console.log(`\n✓ ${productCount.count} termék betöltve`);

    // Admin felhasználók számának ellenőrzése
    const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin').get();
    console.log(`✓ ${adminCount.count} admin felhasználó létrehozva`);

} catch (error) {
    console.error('Hiba történt az adatbázis újrainicializálása során:', error);
    process.exit(1);
} finally {
    db.close();
}

console.log('\n✅ Adatbázis sikeresen újrainicializálva!');
