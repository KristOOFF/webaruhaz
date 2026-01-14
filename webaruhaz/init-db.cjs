const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Adatbázis megnyitása vagy létrehozása
const db = new Database('webaruhaz.db');

// SQL séma beolvasása
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

// SQL parancsok futtatása
const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);

console.log('Adatbázis inicializálása...');

try {
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

} catch (error) {
    console.error('Hiba történt az adatbázis inicializálása során:', error);
    process.exit(1);
} finally {
    db.close();
}

console.log('\nAdatbázis inicializálás befejezve.');
