/**
 * Backend API integrációs tesztek
 *
 * FONTOS: Ezek a tesztek futó backend szervert igényelnek!
 * Indítsd el a szervert a tesztek futtatása előtt: npm run server
 *
 * Futtatás: npm run test:server (ha a szerver fut)
 *
 * Ez a fájl a server.cjs Express API végpontjait teszteli.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_BASE = 'http://localhost:3000/api';

// Helper függvény fetch hívásokhoz
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T; status: number }> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    const data = await response.json();
    return { data: data as T, status: response.status };
}

// ============================================================================
// TERMÉK VÉGPONTOK TESZTELÉSE
// ============================================================================

describe('Products API Endpoints', () => {
    describe('GET /api/products', () => {
        it('visszaadja az összes terméket', async () => {
            const { data, status } = await apiFetch<Array<{ id: string; nev: string; ar: number }>>('/products');

            expect(status).toBe(200);
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);

            // Ellenőrizzük a termék struktúráját
            const firstProduct = data[0];
            expect(firstProduct).toHaveProperty('id');
            expect(firstProduct).toHaveProperty('nev');
            expect(firstProduct).toHaveProperty('ar');
        });

        it('tartalmazza az alap termékeket (Cappuccino, Espresso, stb.)', async () => {
            const { data } = await apiFetch<Array<{ nev: string }>>('/products');

            const productNames = data.map(p => p.nev);
            expect(productNames).toContain('Cappuccino');
            expect(productNames).toContain('Espresso');
        });
    });

    describe('GET /api/products/:id', () => {
        it('visszaad egy létező terméket', async () => {
            // Először lekérjük az összes terméket, hogy legyen egy érvényes ID-nk
            const { data: products } = await apiFetch<Array<{ id: string }>>('/products');
            const testId = products[0].id;

            const { data, status } = await apiFetch<{ id: string; nev: string; ar: number }>(`/products/${testId}`);

            expect(status).toBe(200);
            expect(data.id).toBe(testId);
        });

        it('404-et ad vissza nem létező termékre', async () => {
            const { status } = await apiFetch('/products/nem-letezo-id');

            expect(status).toBe(404);
        });
    });
});

// ============================================================================
// ADMIN AUTENTIKÁCIÓ TESZTELÉSE
// ============================================================================

describe('Admin Authentication', () => {
    let adminToken: string;

    describe('POST /api/admin/login', () => {
        it('sikeres bejelentkezés helyes adatokkal', async () => {
            const { data, status } = await apiFetch<{ token: string; admin: { felhasznalonev: string } }>(
                '/admin/login',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        felhasznalonev: 'admin',
                        jelszo: 'Minad123!'
                    })
                }
            );

            expect(status).toBe(200);
            expect(data).toHaveProperty('token');
            expect(data.admin.felhasznalonev).toBe('admin');

            adminToken = data.token;
        });

        it('sikertelen bejelentkezés rossz jelszóval', async () => {
            const { status } = await apiFetch(
                '/admin/login',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        felhasznalonev: 'admin',
                        jelszo: 'rosszjelszo'
                    })
                }
            );

            expect(status).toBe(401);
        });

        it('sikertelen bejelentkezés nem létező felhasználóval', async () => {
            const { status } = await apiFetch(
                '/admin/login',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        felhasznalonev: 'nemletezik',
                        jelszo: 'valami'
                    })
                }
            );

            expect(status).toBe(401);
        });
    });

    describe('GET /api/admin/verify', () => {
        it('érvényes token ellenőrzése', async () => {
            // Először bejelentkezünk
            const loginResponse = await apiFetch<{ token: string }>(
                '/admin/login',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        felhasznalonev: 'admin',
                        jelszo: 'Minad123!'
                    })
                }
            );
            const token = loginResponse.data.token;

            const { data, status } = await apiFetch<{ valid: boolean }>(
                '/admin/verify',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            expect(status).toBe(200);
            expect(data.valid).toBe(true);
        });

        it('érvénytelen token elutasítása', async () => {
            const { status } = await apiFetch(
                '/admin/verify',
                {
                    headers: {
                        Authorization: 'Bearer invalid-token'
                    }
                }
            );

            expect(status).toBe(401);
        });

        it('token nélküli kérés elutasítása', async () => {
            const { status } = await apiFetch('/admin/verify');

            expect(status).toBe(401);
        });
    });
});

// ============================================================================
// RENDELÉS LÉTREHOZÁS TESZTELÉSE (PUBLIKUS VÉGPONT)
// ============================================================================

describe('Order Creation (Public)', () => {
    describe('POST /api/orders', () => {
        it('létrehoz egy új rendelést', async () => {
            const orderData = {
                vevo_nev: 'Teszt Vásárló',
                telefon: '+36301234567',
                email: 'teszt@example.com',
                iranyitoszam: '1051',
                telepules: 'Budapest',
                utca_hazszam: 'Teszt utca 1.',
                items: [
                    {
                        termek_nev: 'Cappuccino',
                        termek_ar: 850,
                        mennyiseg: 2,
                        tej: 'Oat',
                        cukor: '1 spoon'
                    }
                ]
            };

            const { data, status } = await apiFetch<{ id: string; vevo_nev: string }>(
                '/orders',
                {
                    method: 'POST',
                    body: JSON.stringify(orderData)
                }
            );

            expect(status).toBe(201);
            expect(data).toHaveProperty('id');
            expect(data.vevo_nev).toBe('Teszt Vásárló');
        });

        it('több tételt is elfogad egy rendelésben', async () => {
            const orderData = {
                vevo_nev: 'Teszt Vásárló 2',
                telefon: '+36301234567',
                email: 'teszt2@example.com',
                iranyitoszam: '6720',
                telepules: 'Szeged',
                utca_hazszam: 'Fő tér 5.',
                items: [
                    {
                        termek_nev: 'Cappuccino',
                        termek_ar: 850,
                        mennyiseg: 1,
                        tej: 'None',
                        cukor: 'None'
                    },
                    {
                        termek_nev: 'Espresso',
                        termek_ar: 650,
                        mennyiseg: 2,
                        tej: 'None',
                        cukor: '2 spoons'
                    }
                ]
            };

            const { data, status } = await apiFetch<{ id: string; items: Array<unknown> }>(
                '/orders',
                {
                    method: 'POST',
                    body: JSON.stringify(orderData)
                }
            );

            expect(status).toBe(201);
            expect(data.items).toHaveLength(2);
        });

        it('hibát ad vissza hiányzó kötelező mező esetén', async () => {
            const incompleteOrder = {
                vevo_nev: 'Teszt',
                // Hiányzik: telefon, email, irányítószám, stb.
                items: []
            };

            const { status } = await apiFetch(
                '/orders',
                {
                    method: 'POST',
                    body: JSON.stringify(incompleteOrder)
                }
            );

            expect(status).toBe(400);
        });

        it('hibát ad vissza üres tételek esetén', async () => {
            const orderWithNoItems = {
                vevo_nev: 'Teszt Vásárló',
                telefon: '+36301234567',
                email: 'teszt@example.com',
                iranyitoszam: '1051',
                telepules: 'Budapest',
                utca_hazszam: 'Teszt utca 1.',
                items: []
            };

            const { status } = await apiFetch(
                '/orders',
                {
                    method: 'POST',
                    body: JSON.stringify(orderWithNoItems)
                }
            );

            expect(status).toBe(400);
        });
    });
});

// ============================================================================
// ADMIN RENDELÉS KEZELÉS TESZTELÉSE (VÉDETT VÉGPONTOK)
// ============================================================================

describe('Order Management (Admin)', () => {
    let adminToken: string;
    let testOrderId: string;

    beforeAll(async () => {
        // Bejelentkezés admin tokenért
        const loginResponse = await apiFetch<{ token: string }>(
            '/admin/login',
            {
                method: 'POST',
                body: JSON.stringify({
                    felhasznalonev: 'admin',
                    jelszo: 'Minad123!'
                })
            }
        );
        adminToken = loginResponse.data.token;

        // Teszt rendelés létrehozása
        const orderResponse = await apiFetch<{ id: string }>(
            '/orders',
            {
                method: 'POST',
                body: JSON.stringify({
                    vevo_nev: 'Admin Teszt Vásárló',
                    telefon: '+36301234567',
                    email: 'admin.test@example.com',
                    iranyitoszam: '1051',
                    telepules: 'Budapest',
                    utca_hazszam: 'Admin utca 1.',
                    items: [{ termek_nev: 'Latte', termek_ar: 900, mennyiseg: 1, tej: 'Cow', cukor: 'None' }]
                })
            }
        );
        testOrderId = orderResponse.data.id;
    });

    describe('GET /api/orders', () => {
        it('lekéri az összes rendelést admin tokennel', async () => {
            const { data, status } = await apiFetch<Array<{ id: string }>>(
                '/orders',
                {
                    headers: { Authorization: `Bearer ${adminToken}` }
                }
            );

            expect(status).toBe(200);
            expect(Array.isArray(data)).toBe(true);
        });

        it('401-et ad vissza token nélkül', async () => {
            const { status } = await apiFetch('/orders');
            expect(status).toBe(401);
        });
    });

    describe('PATCH /api/orders/:id/ship', () => {
        it('postázottnak jelöli a rendelést', async () => {
            const { data, status } = await apiFetch<{ postazva: number }>(
                `/orders/${testOrderId}/ship`,
                {
                    method: 'PATCH',
                    headers: { Authorization: `Bearer ${adminToken}` },
                    body: JSON.stringify({ postazva: 1 })
                }
            );

            expect(status).toBe(200);
            expect(data.postazva).toBe(1);
        });

        it('visszaállítja a postázás státuszt', async () => {
            const { data, status } = await apiFetch<{ postazva: number }>(
                `/orders/${testOrderId}/ship`,
                {
                    method: 'PATCH',
                    headers: { Authorization: `Bearer ${adminToken}` },
                    body: JSON.stringify({ postazva: 0 })
                }
            );

            expect(status).toBe(200);
            expect(data.postazva).toBe(0);
        });
    });

    describe('DELETE /api/orders/:id', () => {
        it('törli a rendelést', async () => {
            // Először létrehozunk egy törlendő rendelést
            const createResponse = await apiFetch<{ id: string }>(
                '/orders',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        vevo_nev: 'Törlendő Rendelés',
                        telefon: '+36301234567',
                        email: 'torlendo@example.com',
                        iranyitoszam: '1051',
                        telepules: 'Budapest',
                        utca_hazszam: 'Törlés utca 1.',
                        items: [{ termek_nev: 'Espresso', termek_ar: 650, mennyiseg: 1, tej: 'None', cukor: 'None' }]
                    })
                }
            );
            const deleteId = createResponse.data.id;

            // Töröljük
            const { status } = await apiFetch(
                `/orders/${deleteId}`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${adminToken}` }
                }
            );

            expect(status).toBe(200);

            // Ellenőrizzük, hogy tényleg törlődött
            const verifyResponse = await apiFetch(
                `/orders/${deleteId}`,
                {
                    headers: { Authorization: `Bearer ${adminToken}` }
                }
            );
            expect(verifyResponse.status).toBe(404);
        });
    });
});
