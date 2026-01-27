/**
 * NeoCoffee Admin API Server
 *
 * Ez a fájl tartalmazza a webáruház backend szerverét, amely Express.js
 * keretrendszerre épül. A szerver REST API végpontokat biztosít a frontend
 * számára a termékek, rendelések és admin funkciók kezeléséhez.
 *
 * @file server.cjs
 * @description Express.js REST API szerver - admin funkciók és publikus végpontok
 *
 * Használat:
 *   npm run server
 *   vagy
 *   node server.cjs
 *
 * A szerver a http://localhost:3000 címen fut (alapértelmezetten)
 *
 * =============================================================================
 * API VÉGPONTOK ÁTTEKINTÉSE
 * =============================================================================
 *
 * PUBLIKUS VÉGPONTOK (autentikáció nélkül elérhetők):
 *   GET  /api/products      - Összes termék listázása
 *   GET  /api/products/:id  - Egy termék lekérdezése
 *   POST /api/orders        - Új rendelés létrehozása (vásárlók számára)
 *
 * ADMIN AUTENTIKÁCIÓ:
 *   POST /api/admin/login   - Admin bejelentkezés (JWT token generálás)
 *   POST /api/admin/logout  - Admin kijelentkezés
 *   GET  /api/admin/verify  - Token érvényesség ellenőrzése
 *
 * VÉDETT VÉGPONTOK (admin token szükséges):
 *   POST   /api/products      - Új termék létrehozása
 *   PUT    /api/products/:id  - Termék módosítása
 *   DELETE /api/products/:id  - Termék törlése
 *   GET    /api/orders        - Összes rendelés listázása
 *   GET    /api/orders/:id    - Egy rendelés részletei
 *   PATCH  /api/orders/:id/ship - Rendelés postázási státusz módosítása
 *   DELETE /api/orders/:id    - Rendelés törlése
 *
 * =============================================================================
 * TECHNOLÓGIÁK
 * =============================================================================
 *
 * - Express.js 4.x: Web framework
 * - better-sqlite3: SQLite adatbázis kezelő
 * - bcrypt: Jelszó hash-elés
 * - jsonwebtoken (JWT): Autentikáció
 * - cors: Cross-Origin Resource Sharing
 */

// =============================================================================
// MODULOK IMPORTÁLÁSA
// =============================================================================

/**
 * express: Node.js web framework
 * A REST API végpontok kezeléséhez és middleware-ek használatához
 */
const express = require('express');

/**
 * cors: Cross-Origin Resource Sharing middleware
 * Lehetővé teszi, hogy a frontend (localhost:5173) elérje a backend API-t (localhost:3000)
 * Fejlesztési környezetben minden origin engedélyezett
 */
const cors = require('cors');

/**
 * better-sqlite3: Szinkron SQLite adatbázis kezelő
 * Egyszerű és gyors API az adatbázis műveletekhez
 */
const Database = require('better-sqlite3');

/**
 * bcrypt: Jelszó hash-elő könyvtár
 * Biztonságos jelszó ellenőrzés bejelentkezéskor
 * A hash összehasonlítás időzítés-biztos (timing-safe)
 */
const bcrypt = require('bcrypt');

/**
 * jsonwebtoken: JWT token kezelő
 * Admin autentikációhoz használjuk
 * A token tartalmazza az admin azonosítóját és felhasználónevét
 */
const jwt = require('jsonwebtoken');

/**
 * path: Node.js útvonal kezelő modul
 * Az adatbázis fájl elérési útjának meghatározásához
 */
const path = require('path');

/**
 * crypto: Node.js kriptográfiai modul
 * Egyedi azonosítók generálásához (termékek, rendelések)
 */
const crypto = require('crypto');

// =============================================================================
// SEGÉDFÜGGVÉNYEK
// =============================================================================

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

// =============================================================================
// KONFIGURÁCIÓ
// =============================================================================

/**
 * Szerver port száma
 * Alapértelmezetten 3000, de felülírható a PORT környezeti változóval
 */
const PORT = process.env.PORT || 3000;

/**
 * JWT titkos kulcs
 * FONTOS: Production környezetben ezt környezeti változóból kell beállítani!
 * Iskolai projekt lévén itt egy egyszerű default értéket használunk
 */
const JWT_SECRET = process.env.JWT_SECRET || 'neocoffee-secret-key-change-in-production';

/**
 * JWT token lejárati ideje
 * 24 óra múlva a tokenek érvénytelenné válnak
 * Az admin felhasználónak újra be kell jelentkeznie
 */
const JWT_EXPIRES_IN = '24h';

// =============================================================================
// ADATBÁZIS INICIALIZÁLÁS
// =============================================================================

/**
 * SQLite adatbázis kapcsolat létrehozása
 *
 * A webaruhaz.db fájl a projekt gyökerében található.
 * A __dirname a server.cjs fájl könyvtárára mutat.
 */
const db = new Database(path.join(__dirname, 'webaruhaz.db'));

/**
 * Write-Ahead Logging (WAL) mód bekapcsolása
 *
 * A WAL mód javítja a teljesítményt és megbízhatóságot:
 * - Gyorsabb írási műveletek
 * - Jobb konkurens hozzáférés (olvasás és írás egyszerre)
 * - Biztonságosabb: kevesebb adatvesztés áramkimaradáskor
 */
db.pragma('journal_mode = WAL');

/**
 * Foreign Keys (idegen kulcsok) engedélyezése
 *
 * SQLite-ban alapértelmezetten kikapcsolt a foreign key támogatás.
 * Bekapcsolásával biztosítjuk a rendeles_tetelek → rendelesek kapcsolat
 * integritását és a CASCADE törlés működését.
 */
db.pragma('foreign_keys = ON');

// =============================================================================
// EXPRESS ALKALMAZÁS LÉTREHOZÁSA
// =============================================================================

/**
 * Express alkalmazás példány
 * Ez az alkalmazás kezeli az összes HTTP kérést
 */
const app = express();

// =============================================================================
// MIDDLEWARE-EK KONFIGURÁLÁSA
// =============================================================================

/**
 * CORS (Cross-Origin Resource Sharing) middleware
 *
 * Beállítások:
 * - origin: true - minden origin engedélyezett (fejlesztési célokra)
 * - credentials: true - cookie-k és auth headerek engedélyezése
 * - methods: összes szükséges HTTP metódus
 * - allowedHeaders: a frontend által küldött headerek engedélyezése
 *
 * A frontend (localhost:5173) és backend (localhost:3000) különböző porton fut,
 * ezért CORS nélkül a böngésző blokkolná a kéréseket.
 */
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

/**
 * JSON body parser middleware
 *
 * A POST, PUT, PATCH kérések body-ját JSON formátumból JavaScript objektummá
 * alakítja. A feldolgozott adat a req.body-ban lesz elérhető.
 */
app.use(express.json());

// =============================================================================
// SEGÉDFÜGGVÉNYEK
// =============================================================================

/**
 * JWT token generálása az admin felhasználónak
 *
 * A token payload-ja tartalmazza:
 * - id: admin egyedi azonosítója
 * - felhasznalonev: admin felhasználóneve
 *
 * A token aláírva van a JWT_SECRET kulccsal és 24 óráig érvényes.
 *
 * @param {Object} admin - Az admin felhasználó objektum
 * @param {string} admin.id - Admin azonosító
 * @param {string} admin.felhasznalonev - Admin felhasználónév
 * @returns {string} Aláírt JWT token
 */
function generateToken(admin) {
    return jwt.sign(
        { id: admin.id, felhasznalonev: admin.felhasznalonev },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

/**
 * Aktuális időbélyeg ISO formátumban
 *
 * Az adatbázisban az időpontokat ISO 8601 formátumban tároljuk.
 * Példa: "2026-01-20T15:30:00.000Z"
 *
 * @returns {string} ISO 8601 formátumú dátum string
 */
function now() {
    return new Date().toISOString();
}

// =============================================================================
// AUTENTIKÁCIÓS MIDDLEWARE
// =============================================================================

/**
 * Admin autentikációs middleware
 *
 * Ez a middleware ellenőrzi, hogy a kérés tartalmaz-e érvényes JWT tokent.
 * A védett végpontok előtt kell használni.
 *
 * Ellenőrzések:
 * 1. Van-e Authorization header?
 * 2. Bearer token formátumú-e?
 * 3. Érvényes és nem lejárt-e a token?
 *
 * Sikeres ellenőrzés esetén a dekódolt token adatai a req.admin-ban lesznek.
 *
 * @param {Object} req - Express request objektum
 * @param {Object} res - Express response objektum
 * @param {Function} next - Következő middleware hívása
 */
function authMiddleware(req, res, next) {
    // Authorization header ellenőrzése
    const authHeader = req.headers.authorization;

    // Ha nincs header vagy nem Bearer formátumú
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Hiányzó vagy érvénytelen token' });
    }

    // Token kinyerése a headerből (a "Bearer " prefix után)
    const token = authHeader.substring(7);

    try {
        // Token ellenőrzése és dekódolása
        // Ha a token érvénytelen vagy lejárt, kivételt dob
        const decoded = jwt.verify(token, JWT_SECRET);

        // Admin adatok hozzáadása a request objektumhoz
        req.admin = decoded;

        // Tovább a következő middleware-hez vagy route handler-hez
        next();
    } catch (err) {
        // Token érvénytelen vagy lejárt
        return res.status(401).json({ error: 'Érvénytelen vagy lejárt token' });
    }
}

// =============================================================================
// ADMIN AUTENTIKÁCIÓ VÉGPONTOK
// =============================================================================

/**
 * POST /api/admin/login
 *
 * Admin bejelentkezés végpont.
 *
 * Request body:
 *   - felhasznalonev: string (kötelező)
 *   - jelszo: string (kötelező)
 *
 * Response (200 OK):
 *   - token: JWT token string
 *   - admin: { id, felhasznalonev, letrehozva }
 *
 * Hibák:
 *   - 400: Hiányzó felhasználónév vagy jelszó
 *   - 401: Hibás belépési adatok
 *   - 500: Szerver hiba
 *
 * @async
 */
app.post('/api/admin/login', async (req, res) => {
    try {
        const { felhasznalonev, jelszo } = req.body;

        // Input validáció
        if (!felhasznalonev || !jelszo) {
            return res.status(400).json({ error: 'Felhasználónév és jelszó megadása kötelező' });
        }

        // Admin keresése az adatbázisban
        const admin = db.prepare('SELECT * FROM admin WHERE felhasznalonev = ?').get(felhasznalonev);

        // Ha nincs ilyen felhasználó
        if (!admin) {
            return res.status(401).json({ error: 'Hibás felhasználónév vagy jelszó' });
        }

        // Jelszó ellenőrzése bcrypt-tel
        // A bcrypt.compare() összehasonlítja a plain text jelszót a hash-sel
        const validPassword = await bcrypt.compare(jelszo, admin.jelszo_hash);

        // Ha a jelszó nem egyezik
        if (!validPassword) {
            return res.status(401).json({ error: 'Hibás felhasználónév vagy jelszó' });
        }

        // JWT token generálása
        const token = generateToken(admin);

        // Sikeres bejelentkezés - token és admin adatok visszaküldése
        // Fontos: a jelszo_hash-t NEM küldjük vissza!
        res.json({
            token,
            admin: {
                id: admin.id,
                felhasznalonev: admin.felhasznalonev,
                letrehozva: admin.letrehozva
            }
        });
    } catch (err) {
        // Váratlan hiba logolása és általános hibaüzenet küldése
        console.error('Login error:', err);
        res.status(500).json({ error: 'Szerver hiba' });
    }
});

/**
 * POST /api/admin/logout
 *
 * Admin kijelentkezés végpont.
 *
 * Megjegyzés: JWT token alapú rendszernél a kijelentkezés valójában
 * kliens oldalon történik (token törlése). Ez a végpont csak egy
 * megerősítő üzenetet küld vissza.
 *
 * Response (200 OK):
 *   - message: "Sikeres kijelentkezés"
 */
app.post('/api/admin/logout', (req, res) => {
    res.json({ message: 'Sikeres kijelentkezés' });
});

/**
 * GET /api/admin/verify
 *
 * Token érvényesség ellenőrzése.
 * Védett végpont - authMiddleware szükséges.
 *
 * Response (200 OK):
 *   - valid: true
 *   - admin: { id, felhasznalonev }
 *
 * Hibák:
 *   - 401: Érvénytelen vagy lejárt token (authMiddleware kezeli)
 */
app.get('/api/admin/verify', authMiddleware, (req, res) => {
    res.json({
        valid: true,
        admin: {
            id: req.admin.id,
            felhasznalonev: req.admin.felhasznalonev
        }
    });
});

// =============================================================================
// TERMÉKEK VÉGPONTOK
// =============================================================================

/**
 * GET /api/products
 *
 * Összes termék listázása.
 * Publikus végpont - nem igényel autentikációt.
 *
 * Response (200 OK):
 *   Array of products: [{ id, nev, ar, kep_url }, ...]
 *
 * Hibák:
 *   - 500: Adatbázis hiba
 */
app.get('/api/products', (req, res) => {
    try {
        const products = db.prepare('SELECT * FROM termekek ORDER BY id').all();
        res.json(products);
    } catch (err) {
        console.error('Get products error:', err);
        res.status(500).json({ error: 'Szerver hiba' });
    }
});

/**
 * GET /api/products/:id
 *
 * Egy termék lekérdezése azonosító alapján.
 * Publikus végpont - nem igényel autentikációt.
 *
 * URL paraméter:
 *   - id: termék azonosító
 *
 * Response (200 OK):
 *   { id, nev, ar, kep_url }
 *
 * Hibák:
 *   - 404: Termék nem található
 *   - 500: Adatbázis hiba
 */
app.get('/api/products/:id', (req, res) => {
    try {
        const product = db.prepare('SELECT * FROM termekek WHERE id = ?').get(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Termék nem található' });
        }

        res.json(product);
    } catch (err) {
        console.error('Get product error:', err);
        res.status(500).json({ error: 'Szerver hiba' });
    }
});

/**
 * POST /api/products
 *
 * Új termék létrehozása.
 * Védett végpont - admin token szükséges.
 *
 * Request body:
 *   - nev: string (kötelező) - termék neve
 *   - ar: number (kötelező) - termék ára Ft-ban
 *   - kep_url: string (opcionális) - kép URL
 *
 * Response (201 Created):
 *   { id, nev, ar, kep_url }
 *
 * Hibák:
 *   - 400: Hiányzó név vagy ár
 *   - 401: Nincs jogosultság
 *   - 500: Adatbázis hiba
 */
app.post('/api/products', authMiddleware, (req, res) => {
    try {
        const { nev, ar, kep_url } = req.body;

        // Input validáció
        if (!nev || !ar) {
            return res.status(400).json({ error: 'Név és ár megadása kötelező' });
        }

        // Egyedi azonosító generálása
        const productId = generateId();

        // Termék beszúrása az adatbázisba
        db.prepare(`
            INSERT INTO termekek (id, nev, ar, kep_url)
            VALUES (?, ?, ?, ?)
        `).run(productId, nev, ar, kep_url || null);

        // Az újonnan létrehozott termék lekérdezése és visszaküldése
        const newProduct = db.prepare('SELECT * FROM termekek WHERE id = ?').get(productId);
        res.status(201).json(newProduct);
    } catch (err) {
        console.error('Create product error:', err);
        res.status(500).json({ error: 'Szerver hiba' });
    }
});

/**
 * PUT /api/products/:id
 *
 * Termék módosítása.
 * Védett végpont - admin token szükséges.
 *
 * URL paraméter:
 *   - id: termék azonosító
 *
 * Request body (minden mező opcionális):
 *   - nev: string - új név
 *   - ar: number - új ár
 *   - kep_url: string - új kép URL
 *
 * Response (200 OK):
 *   { id, nev, ar, kep_url }
 *
 * Hibák:
 *   - 401: Nincs jogosultság
 *   - 404: Termék nem található
 *   - 500: Adatbázis hiba
 */
app.put('/api/products/:id', authMiddleware, (req, res) => {
    try {
        const { nev, ar, kep_url } = req.body;
        const productId = req.params.id;

        // Ellenőrizzük, hogy létezik-e a termék
        const existing = db.prepare('SELECT * FROM termekek WHERE id = ?').get(productId);
        if (!existing) {
            return res.status(404).json({ error: 'Termék nem található' });
        }

        // Termék frissítése - ha nincs megadva új érték, a régit használjuk
        db.prepare(`
            UPDATE termekek
            SET nev = ?, ar = ?, kep_url = ?
            WHERE id = ?
        `).run(
            nev || existing.nev,
            ar || existing.ar,
            kep_url !== undefined ? kep_url : existing.kep_url,
            productId
        );

        // Frissített termék lekérdezése és visszaküldése
        const updatedProduct = db.prepare('SELECT * FROM termekek WHERE id = ?').get(productId);
        res.json(updatedProduct);
    } catch (err) {
        console.error('Update product error:', err);
        res.status(500).json({ error: 'Szerver hiba' });
    }
});

/**
 * DELETE /api/products/:id
 *
 * Termék törlése.
 * Védett végpont - admin token szükséges.
 *
 * URL paraméter:
 *   - id: termék azonosító
 *
 * Response (200 OK):
 *   { message: "Termék sikeresen törölve" }
 *
 * Hibák:
 *   - 401: Nincs jogosultság
 *   - 404: Termék nem található
 *   - 500: Adatbázis hiba
 */
app.delete('/api/products/:id', authMiddleware, (req, res) => {
    try {
        const result = db.prepare('DELETE FROM termekek WHERE id = ?').run(req.params.id);

        // Ellenőrizzük, hogy történt-e törlés
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Termék nem található' });
        }

        res.json({ message: 'Termék sikeresen törölve' });
    } catch (err) {
        console.error('Delete product error:', err);
        res.status(500).json({ error: 'Szerver hiba' });
    }
});

// =============================================================================
// RENDELÉSEK VÉGPONTOK (ADMIN)
// =============================================================================

/**
 * Rendelési tételek lekérdezése egy rendeléshez
 *
 * Segédfüggvény a rendelések összeállításához.
 *
 * @param {string} orderId - A rendelés azonosítója
 * @returns {Array} A rendelés tételeinek tömbje
 */
function getOrderItems(orderId) {
    return db.prepare('SELECT * FROM rendeles_tetelek WHERE rendeles_id = ?').all(orderId);
}

/**
 * Rendelés objektum összeállítása tételekkel
 *
 * Segédfüggvény ami a rendeléshez hozzáadja a tételek tömbjét.
 *
 * @param {Object} order - A rendelés alap objektum
 * @returns {Object} A rendelés objektum az items tömbbel kiegészítve
 */
function buildOrderResponse(order) {
    return {
        ...order,
        items: getOrderItems(order.id)
    };
}

/**
 * GET /api/orders
 *
 * Összes rendelés listázása szűrési lehetőségekkel.
 * Védett végpont - admin token szükséges.
 *
 * Query paraméterek (opcionális):
 *   - postazva: 0 vagy 1 - szűrés postázási státuszra
 *   - email: string - szűrés vásárló email címére
 *
 * Response (200 OK):
 *   Array of orders with items
 *
 * Hibák:
 *   - 401: Nincs jogosultság
 *   - 500: Adatbázis hiba
 */
app.get('/api/orders', authMiddleware, (req, res) => {
    try {
        const { postazva, email } = req.query;

        // SQL lekérdezés dinamikus felépítése
        let query = 'SELECT * FROM rendelesek WHERE 1=1';
        const params = [];

        // Postázási státusz szűrő
        if (postazva !== undefined) {
            query += ' AND postazva = ?';
            params.push(parseInt(postazva));
        }

        // Email szűrő
        if (email) {
            query += ' AND email = ?';
            params.push(email);
        }

        // Rendezés dátum szerint (legrégebbi először)
        query += ' ORDER BY megrendelve ASC';

        // Lekérdezés végrehajtása
        const orders = db.prepare(query).all(...params);

        // Minden rendeléshez hozzáadjuk a tételeket
        const ordersWithItems = orders.map(buildOrderResponse);

        res.json(ordersWithItems);
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).json({ error: 'Szerver hiba' });
    }
});

/**
 * GET /api/orders/:id
 *
 * Egy rendelés részleteinek lekérdezése.
 * Védett végpont - admin token szükséges.
 *
 * URL paraméter:
 *   - id: rendelés azonosító
 *
 * Response (200 OK):
 *   Order object with items array
 *
 * Hibák:
 *   - 401: Nincs jogosultság
 *   - 404: Rendelés nem található
 *   - 500: Adatbázis hiba
 */
app.get('/api/orders/:id', authMiddleware, (req, res) => {
    try {
        const order = db.prepare('SELECT * FROM rendelesek WHERE id = ?').get(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Rendelés nem található' });
        }

        res.json(buildOrderResponse(order));
    } catch (err) {
        console.error('Get order error:', err);
        res.status(500).json({ error: 'Szerver hiba' });
    }
});

/**
 * PATCH /api/orders/:id/ship
 *
 * Rendelés postázási státuszának módosítása.
 * Védett végpont - admin token szükséges.
 *
 * URL paraméter:
 *   - id: rendelés azonosító
 *
 * Request body:
 *   - postazva: 0 vagy 1 (kötelező)
 *
 * Response (200 OK):
 *   { id, postazva, postazva_datum }
 *
 * Viselkedés:
 *   - Ha postazva = 1, a postazva_datum az aktuális időpontra állítódik
 *   - Ha postazva = 0, a postazva_datum null-ra állítódik
 *
 * Hibák:
 *   - 400: Érvénytelen postazva érték
 *   - 401: Nincs jogosultság
 *   - 404: Rendelés nem található
 *   - 500: Adatbázis hiba
 */
app.patch('/api/orders/:id/ship', authMiddleware, (req, res) => {
    try {
        const orderId = req.params.id;
        const { postazva } = req.body;

        // Input validáció - csak 0 vagy 1 lehet
        if (postazva === undefined || ![0, 1].includes(postazva)) {
            return res.status(400).json({ error: 'postazva értéke 0 vagy 1 kell legyen' });
        }

        // Ellenőrizzük, hogy létezik-e a rendelés
        const existing = db.prepare('SELECT * FROM rendelesek WHERE id = ?').get(orderId);
        if (!existing) {
            return res.status(404).json({ error: 'Rendelés nem található' });
        }

        // Postázás dátum: aktuális időpont ha postázva, null ha visszavonva
        const postazva_datum = postazva === 1 ? now() : null;

        // Státusz frissítése
        db.prepare(`
            UPDATE rendelesek
            SET postazva = ?, postazva_datum = ?
            WHERE id = ?
        `).run(postazva, postazva_datum, orderId);

        // Frissített adatok visszaküldése
        res.json({
            id: orderId,
            postazva,
            postazva_datum
        });
    } catch (err) {
        console.error('Ship order error:', err);
        res.status(500).json({ error: 'Szerver hiba' });
    }
});

/**
 * DELETE /api/orders/:id
 *
 * Rendelés törlése (és a hozzá tartozó tételek CASCADE törlése).
 * Védett végpont - admin token szükséges.
 *
 * URL paraméter:
 *   - id: rendelés azonosító
 *
 * Response (200 OK):
 *   { message: "Rendelés sikeresen törölve" }
 *
 * Megjegyzés:
 *   A rendeles_tetelek táblában lévő kapcsolódó tételek automatikusan
 *   törlődnek a FOREIGN KEY ON DELETE CASCADE beállítás miatt.
 *
 * Hibák:
 *   - 401: Nincs jogosultság
 *   - 404: Rendelés nem található
 *   - 500: Adatbázis hiba
 */
app.delete('/api/orders/:id', authMiddleware, (req, res) => {
    try {
        const result = db.prepare('DELETE FROM rendelesek WHERE id = ?').run(req.params.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Rendelés nem található' });
        }

        res.json({ message: 'Rendelés sikeresen törölve' });
    } catch (err) {
        console.error('Delete order error:', err);
        res.status(500).json({ error: 'Szerver hiba' });
    }
});

// =============================================================================
// RENDELÉS LÉTREHOZÁSA (PUBLIKUS - VÁSÁRLÓK SZÁMÁRA)
// =============================================================================

/**
 * POST /api/orders
 *
 * Új rendelés létrehozása a vásárlók számára.
 * Publikus végpont - nem igényel autentikációt.
 *
 * Request body:
 *   - vevo_nev: string (kötelező) - vásárló neve
 *   - telefon: string (kötelező) - telefonszám
 *   - email: string (kötelező) - email cím
 *   - iranyitoszam: string (kötelező) - irányítószám
 *   - telepules: string (kötelező) - település
 *   - utca_hazszam: string (kötelező) - utca és házszám
 *   - items: Array (kötelező) - rendelési tételek
 *     - termek_nev: string (kötelező)
 *     - termek_ar: number (kötelező)
 *     - mennyiseg: number (kötelező)
 *     - tej: string (kötelező)
 *     - cukor: string (kötelező)
 *
 * Response (201 Created):
 *   Complete order object with items
 *
 * Hibák:
 *   - 400: Hiányzó kötelező mezők
 *   - 500: Adatbázis hiba
 */
app.post('/api/orders', (req, res) => {
    try {
        const { vevo_nev, telefon, email, iranyitoszam, telepules, utca_hazszam, items } = req.body;

        // ------------------------------------------------------------------------
        // INPUT VALIDÁCIÓ
        // ------------------------------------------------------------------------

        // Szállítási adatok ellenőrzése
        if (!vevo_nev || !telefon || !email || !iranyitoszam || !telepules || !utca_hazszam) {
            return res.status(400).json({ error: 'Minden szállítási adat megadása kötelező' });
        }

        // Rendelési tételek ellenőrzése
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Legalább egy terméket kell rendelni' });
        }

        // Minden tétel mezőinek ellenőrzése
        for (const item of items) {
            if (!item.termek_nev || !item.termek_ar || !item.mennyiseg || !item.tej || !item.cukor) {
                return res.status(400).json({ error: 'Minden tétel mezője kötelező' });
            }
        }

        // ------------------------------------------------------------------------
        // TRANZAKCIÓ - RENDELÉS ÉS TÉTELEK BESZÚRÁSA
        // ------------------------------------------------------------------------

        /**
         * Prepared statement-ek a beszúrásokhoz
         * A prepared statement-ek biztonságosabbak (SQL injection védelem)
         * és gyorsabbak is ismétlődő műveleteknél
         */
        const insertOrder = db.prepare(`
            INSERT INTO rendelesek (id, vevo_nev, telefon, email, iranyitoszam, telepules, utca_hazszam, megrendelve, postazva)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
        `);

        const insertItem = db.prepare(`
            INSERT INTO rendeles_tetelek (id, rendeles_id, termek_nev, termek_ar, mennyiseg, tej, cukor)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        /**
         * Tranzakció definíció
         *
         * A db.transaction() biztosítja, hogy vagy minden művelet sikerül,
         * vagy egyik sem. Ha bármelyik beszúrás hibát dob, az összes
         * korábbi beszúrás visszavonásra kerül (rollback).
         *
         * Ez kritikus fontosságú: nem szeretnénk, ha egy rendelés létrejönne
         * tételek nélkül, vagy fordítva.
         */
        const transaction = db.transaction((orderData, orderItems) => {
            // 1. Rendelés beszúrása
            const orderId = generateId();
            insertOrder.run(
                orderId,
                orderData.vevo_nev,
                orderData.telefon,
                orderData.email,
                orderData.iranyitoszam,
                orderData.telepules,
                orderData.utca_hazszam,
                now()  // megrendelve dátum
            );

            // 2. Tételek beszúrása
            for (const item of orderItems) {
                const itemId = generateId();
                insertItem.run(
                    itemId,
                    orderId,  // kapcsolat a rendeléshez
                    item.termek_nev,
                    item.termek_ar,
                    item.mennyiseg,
                    item.tej,
                    item.cukor
                );
            }

            return orderId;
        });

        // Tranzakció végrehajtása
        const orderId = transaction({ vevo_nev, telefon, email, iranyitoszam, telepules, utca_hazszam }, items);

        // ------------------------------------------------------------------------
        // VÁLASZ ÖSSZEÁLLÍTÁSA
        // ------------------------------------------------------------------------

        // A teljes rendelés lekérdezése a tételekkel együtt
        const newOrder = db.prepare('SELECT * FROM rendelesek WHERE id = ?').get(orderId);
        const orderWithItems = buildOrderResponse(newOrder);

        // 201 Created státusz - sikeres létrehozás
        res.status(201).json(orderWithItems);
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ error: 'Szerver hiba' });
    }
});

// =============================================================================
// SZERVER INDÍTÁS
// =============================================================================

/**
 * Express szerver indítása
 *
 * A szerver a megadott porton figyel bejövő HTTP kérésekre.
 * Sikeres indítás után konzol üzenetet ír ki.
 */
app.listen(PORT, () => {
    console.log(`Szerver fut ezen a címen: http://localhost:${PORT}`);
});

// =============================================================================
// GRACEFUL SHUTDOWN (SZABÁLYOS LEÁLLÍTÁS)
// =============================================================================

/**
 * SIGINT signal kezelése (Ctrl+C)
 *
 * Amikor a felhasználó Ctrl+C-vel leállítja a szervert, fontos
 * szabályosan lezárni az adatbázis kapcsolatot. Ez biztosítja,
 * hogy minden függőben lévő írási művelet befejeződjön és ne
 * sérüljön az adatbázis.
 */
process.on('SIGINT', () => {
    db.close();
    process.exit(0);
});