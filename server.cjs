/**
 * NeoCoffee Admin API Server
 *
 * Express alapú REST API az admin funkcionalitáshoz.
 * Csak admin endpoint-ok: autentikáció, termékek CRUD, rendelések kezelése.
 */

const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

// ============================================================================
// KONFIGURÁCIÓ
// ============================================================================

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'neocoffee-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

// ============================================================================
// ADATBÁZIS INICIALIZÁLÁS
// ============================================================================

const db = new Database(path.join(__dirname, 'webaruhaz.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ============================================================================
// EXPRESS ALKALMAZÁS
// ============================================================================

const app = express();

// CORS middleware
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use(express.json());

// ============================================================================
// SEGÉDFÜGGVÉNYEK
// ============================================================================

/**
 * JWT token generálása
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
 */
function now() {
    return new Date().toISOString();
}

// ============================================================================
// AUTH MIDDLEWARE
// ============================================================================

/**
 * Admin autentikációs middleware
 * Bearer token ellenőrzés a védett route-okhoz
 */
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Hiányzó vagy érvénytelen token' });
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Érvénytelen vagy lejárt token' });
    }
}

// ============================================================================
// ADMIN AUTENTIKÁCIÓ ENDPOINT-OK
// ============================================================================

/**
 * POST /api/admin/login
 * Admin bejelentkezés
 */
app.post('/api/admin/login', async (req, res) => {
    try {
        const { felhasznalonev, jelszo } = req.body;

        if (!felhasznalonev || !jelszo) {
            return res.status(400).json({ error: 'Felhasználónév és jelszó megadása kötelező' });
        }

        const admin = db.prepare('SELECT * FROM admin WHERE felhasznalonev = ?').get(felhasznalonev);

        if (!admin) {
            return res.status(401).json({ error: 'Hibás felhasználónév vagy jelszó' });
        }

        const validPassword = await bcrypt.compare(jelszo, admin.jelszo_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Hibás felhasználónév vagy jelszó' });
        }

        const token = generateToken(admin);

        res.json({
            token,
            admin: {
                id: admin.id,
                felhasznalonev: admin.felhasznalonev,
                letrehozva: admin.letrehozva
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Szerver hiba' });
    }
});

/**
 * POST /api/admin/logout
 * Admin kijelentkezés (token alapú rendszernél csak kliens oldali törlés)
 */
app.post('/api/admin/logout', (req, res) => {
    res.json({ message: 'Sikeres kijelentkezés' });
});

/**
 * GET /api/admin/verify
 * Token érvényesség ellenőrzése
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

// ============================================================================
// TERMÉKEK ENDPOINT-OK (ADMIN)
// ============================================================================

/**
 * GET /api/products
 * Összes termék listázása (publikus)
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
 * Egy termék lekérdezése (publikus)
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
 * Új termék létrehozása (Admin)
 */
app.post('/api/products', authMiddleware, (req, res) => {
    try {
        const { nev, ar, kep_url } = req.body;

        if (!nev || !ar) {
            return res.status(400).json({ error: 'Név és ár megadása kötelező' });
        }

        if (!['coffee', 'espresso'].includes(tipus)) {
            return res.status(400).json({ error: 'Típus csak "coffee" vagy "espresso" lehet' });
        }

        const timestamp = now();
        const result = db.prepare(`
            INSERT INTO termekek (nev, leiras, ar, kep_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(nev, leiras || null, ar, tipus, kep_url || null, timestamp, timestamp);

        const newProduct = db.prepare('SELECT * FROM termekek WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(newProduct);
    } catch (err) {
        console.error('Create product error:', err);
        res.status(500).json({ error: 'Szerver hiba' });
    }
});

/**
 * PUT /api/products/:id
 * Termék módosítása (Admin)
 */
app.put('/api/products/:id', authMiddleware, (req, res) => {
    try {
        const { nev, ar, kep_url } = req.body;
        const productId = req.params.id;

        const existing = db.prepare('SELECT * FROM termekek WHERE id = ?').get(productId);
        if (!existing) {
            return res.status(404).json({ error: 'Termék nem található' });
        }

        db.prepare(`
            UPDATE termekek
            SET nev = ?, ar = ?, kep_url = ?,
            WHERE id = ?
        `).run(
            nev || existing.nev,
            ar || existing.ar,
            kep_url !== undefined ? kep_url : existing.kep_url,
            now(),
            productId
        );

        const updatedProduct = db.prepare('SELECT * FROM termekek WHERE id = ?').get(productId);
        res.json(updatedProduct);
    } catch (err) {
        console.error('Update product error:', err);
        res.status(500).json({ error: 'Szerver hiba' });
    }
});

/**
 * DELETE /api/products/:id
 * Termék törlése (Admin)
 */
app.delete('/api/products/:id', authMiddleware, (req, res) => {
    try {
        const result = db.prepare('DELETE FROM termekek WHERE id = ?').run(req.params.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Termék nem található' });
        }

        res.json({ message: 'Termék sikeresen törölve' });
    } catch (err) {
        console.error('Delete product error:', err);
        res.status(500).json({ error: 'Szerver hiba' });
    }
});

// ============================================================================
// RENDELÉSEK ENDPOINT-OK (ADMIN)
// ============================================================================

/**
 * Rendelés tételek lekérdezése
 */
function getOrderItems(orderId) {
    return db.prepare('SELECT * FROM rendeles_tetelek WHERE rendeles_id = ?').all(orderId);
}

/**
 * Rendelés objektum összeállítása tételekkel
 */
function buildOrderResponse(order) {
    return {
        ...order,
        items: getOrderItems(order.id)
    };
}

/**
 * GET /api/orders
 * Összes rendelés listázása szűrési lehetőségekkel (Admin)
 */
app.get('/api/orders', authMiddleware, (req, res) => {
    try {
        const { postazva, email } = req.query;
        let query = 'SELECT * FROM rendelesek WHERE 1=1';
        const params = [];

        if (postazva !== undefined) {
            query += ' AND postazva = ?';
            params.push(parseInt(postazva));
        }

        if (email) {
            query += ' AND email = ?';
            params.push(email);
        }

        query += ' ORDER BY id ASC';

        const orders = db.prepare(query).all(...params);
        const ordersWithItems = orders.map(buildOrderResponse);

        res.json(ordersWithItems);
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).json({ error: 'Szerver hiba' });
    }
});

/**
 * GET /api/orders/:id
 * Egy rendelés részletei (Admin)
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
 * Rendelés postázási státuszának módosítása (Admin)
 */
app.patch('/api/orders/:id/ship', authMiddleware, (req, res) => {
    try {
        const orderId = req.params.id;
        const { postazva } = req.body;

        if (postazva === undefined || ![0, 1].includes(postazva)) {
            return res.status(400).json({ error: 'postazva értéke 0 vagy 1 kell legyen' });
        }

        const existing = db.prepare('SELECT * FROM rendelesek WHERE id = ?').get(orderId);
        if (!existing) {
            return res.status(404).json({ error: 'Rendelés nem található' });
        }

        const postazva_datum = postazva === 1 ? now() : null;

        db.prepare(`
            UPDATE rendelesek
            SET postazva = ?, postazva_datum = ?
            WHERE id = ?
        `).run(postazva, postazva_datum, orderId);

        res.json({
            id: parseInt(orderId),
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
 * Rendelés törlése (Admin)
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

// ============================================================================
// SZERVER INDÍTÁS
// ============================================================================

app.listen(PORT, () => {
    console.log(`Szerver fut ezen a címen: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close();
    process.exit(0);
});
