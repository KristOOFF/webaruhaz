const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Adatbázis megnyitása vagy létrehozása
const db = new Database('webaruhaz.db');
db.pragma('foreign_keys = ON');

// SQL séma beolvasása (admin INSERT nélkül)
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

// SQL parancsok futtatása (admin INSERT kihagyása - majd programmatikusan)
const statements = schema.split(';')
    .filter(stmt => stmt.trim().length > 0)
    .filter(stmt => !stmt.includes("INSERT OR IGNORE INTO admin"));

console.log('Adatbázis inicializálása...');

async function init() {
    try {
        for (const statement of statements) {
            db.prepare(statement).run();
        }
        console.log('Táblák sikeresen létrehozva!');

        // Admin felhasználó létrehozása/frissítése valódi bcrypt hash-sel
        const hash = await bcrypt.hash('Minad123!', 10);
        const existingAdmin = db.prepare('SELECT id FROM admin WHERE felhasznalonev = ?').get('admin');
        if (!existingAdmin) {
            db.prepare('INSERT INTO admin (felhasznalonev, jelszo_hash) VALUES (?, ?)').run('admin', hash);
            console.log('Admin felhasználó létrehozva');
        } else {
            db.prepare('UPDATE admin SET jelszo_hash = ? WHERE felhasznalonev = ?').run(hash, 'admin');
            console.log('Admin jelszó frissítve');
        }

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
}

init();
