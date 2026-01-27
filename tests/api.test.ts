/**
 * API modul tesztjei
 *
 * Ez a fájl a src/lib/api.ts modulját teszteli.
 * A fetch hívásokat mock-oljuk, így nem szükséges a backend futtatása.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    setToken,
    getToken,
    clearToken,
    isLoggedIn,
    getProducts,
    getProduct,
    createOrder,
    type ApiProduct,
    type CreateOrderInput
} from '../src/lib/api';

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock fetch globálisan
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock localStorage
const localStorageMock: Record<string, string> = {};
vi.stubGlobal('localStorage', {
    getItem: (key: string) => localStorageMock[key] ?? null,
    setItem: (key: string, value: string) => { localStorageMock[key] = value; },
    removeItem: (key: string) => { delete localStorageMock[key]; },
    clear: () => { Object.keys(localStorageMock).forEach(k => delete localStorageMock[k]); }
});

// ============================================================================
// TESZT ADATOK
// ============================================================================

const mockApiProducts: ApiProduct[] = [
    { id: '001', nev: 'Cappuccino', ar: 850, kep_url: '/images/cappuccino.webp' },
    { id: '002', nev: 'Espresso', ar: 650, kep_url: '/images/espresso.webp' },
    { id: '003', nev: 'Latte', ar: 900, kep_url: null }
];

const mockOrderInput: CreateOrderInput = {
    vevo_nev: 'Teszt Felhasználó',
    telefon: '+36 30 123 4567',
    email: 'teszt@email.hu',
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

// ============================================================================
// TOKEN KEZELÉS TESZTEK
// ============================================================================

describe('Token Management', () => {
    beforeEach(() => {
        // Töröljük a localStorage-t minden teszt előtt
        Object.keys(localStorageMock).forEach(k => delete localStorageMock[k]);
    });

    describe('setToken', () => {
        it('elmenti a tokent localStorage-ba', () => {
            setToken('test-token-123');
            expect(localStorageMock['admin_token']).toBe('test-token-123');
        });
    });

    describe('getToken', () => {
        it('visszaadja a tárolt tokent', () => {
            localStorageMock['admin_token'] = 'stored-token';
            expect(getToken()).toBe('stored-token');
        });

        it('null-t ad vissza ha nincs token', () => {
            expect(getToken()).toBeNull();
        });
    });

    describe('clearToken', () => {
        it('törli a tokent', () => {
            localStorageMock['admin_token'] = 'token-to-delete';
            clearToken();
            expect(localStorageMock['admin_token']).toBeUndefined();
        });
    });

    describe('isLoggedIn', () => {
        it('true ha van token', () => {
            localStorageMock['admin_token'] = 'valid-token';
            expect(isLoggedIn()).toBe(true);
        });

        it('false ha nincs token', () => {
            expect(isLoggedIn()).toBe(false);
        });

        it('false üres token esetén', () => {
            localStorageMock['admin_token'] = '';
            expect(isLoggedIn()).toBe(false);
        });
    });
});

// ============================================================================
// TERMÉK API TESZTEK
// ============================================================================

describe('Products API', () => {
    beforeEach(() => {
        mockFetch.mockReset();
        Object.keys(localStorageMock).forEach(k => delete localStorageMock[k]);
    });

    describe('getProducts', () => {
        it('lekéri az összes terméket és átalakítja frontend formátumra', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockApiProducts
            });

            const products = await getProducts();

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/products',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json'
                    })
                })
            );

            expect(products).toHaveLength(3);
            expect(products[0]).toEqual({
                id: '001',
                name: 'Cappuccino',
                price: 850,
                image: '/images/cappuccino.webp'
            });
        });

        it('hibát dob ha a szerver hibát ad vissza', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Szerver hiba' })
            });

            await expect(getProducts()).rejects.toThrow('Szerver hiba');
        });
    });

    describe('getProduct', () => {
        it('lekér egy terméket ID alapján', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockApiProducts[0]
            });

            const product = await getProduct('001');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/products/001',
                expect.any(Object)
            );

            expect(product).toEqual({
                id: '001',
                name: 'Cappuccino',
                price: 850,
                image: '/images/cappuccino.webp'
            });
        });

        it('null kép értéket is helyesen kezeli', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockApiProducts[2] // Latte, nincs képe
            });

            const product = await getProduct('003');

            expect(product.image).toBeNull();
        });
    });
});

// ============================================================================
// RENDELÉS API TESZTEK
// ============================================================================

describe('Orders API', () => {
    beforeEach(() => {
        mockFetch.mockReset();
        Object.keys(localStorageMock).forEach(k => delete localStorageMock[k]);
    });

    describe('createOrder', () => {
        it('létrehoz egy új rendelést', async () => {
            const mockResponse = {
                id: 'order-001',
                ...mockOrderInput,
                megrendelve: '2024-01-15T10:30:00.000Z',
                postazva: 0,
                postazva_datum: null,
                items: mockOrderInput.items.map(item => ({
                    ...item,
                    id: 'item-001',
                    rendeles_id: 'order-001'
                }))
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const order = await createOrder(mockOrderInput);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/orders',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(mockOrderInput)
                })
            );

            expect(order.id).toBe('order-001');
            expect(order.vevo_nev).toBe('Teszt Felhasználó');
        });

        it('hibát dob validációs hiba esetén', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Hiányzó kötelező mező: email' })
            });

            await expect(createOrder(mockOrderInput)).rejects.toThrow('Hiányzó kötelező mező: email');
        });

        it('hibát dob üres kosár esetén', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'A rendelésnek tartalmaznia kell legalább egy tételt' })
            });

            const emptyOrder: CreateOrderInput = {
                ...mockOrderInput,
                items: []
            };

            await expect(createOrder(emptyOrder)).rejects.toThrow('A rendelésnek tartalmaznia kell legalább egy tételt');
        });
    });
});

// ============================================================================
// AUTHORIZATION HEADER TESZTEK
// ============================================================================

describe('Authorization Headers', () => {
    beforeEach(() => {
        mockFetch.mockReset();
        Object.keys(localStorageMock).forEach(k => delete localStorageMock[k]);
    });

    it('token nélkül nem küld Authorization header-t', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockApiProducts
        });

        await getProducts();

        const fetchCall = mockFetch.mock.calls[0];
        expect(fetchCall[1].headers.Authorization).toBeUndefined();
    });

    it('tokennel elküldi az Authorization header-t', async () => {
        localStorageMock['admin_token'] = 'test-jwt-token';

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockApiProducts
        });

        await getProducts();

        const fetchCall = mockFetch.mock.calls[0];
        expect(fetchCall[1].headers.Authorization).toBe('Bearer test-jwt-token');
    });
});
