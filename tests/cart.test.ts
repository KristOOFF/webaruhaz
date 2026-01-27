/**
 * Kosár (cart) modul tesztjei
 *
 * Ez a fájl a src/lib/cart.ts modulját teszteli,
 * beleértve a kosár elemeket, végösszeget és az addToCart függvényt.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { cartItems, cartTotal, addToCart } from '../src/lib/cart';
import type { Product, Modifiers } from '../src/lib/types';

// ============================================================================
// TESZT ADATOK
// ============================================================================

const mockProduct: Product = {
    id: 'test-001',
    name: 'Teszt Cappuccino',
    price: 850,
    image: null
};

const mockProduct2: Product = {
    id: 'test-002',
    name: 'Teszt Espresso',
    price: 650,
    image: '/images/espresso.webp'
};

const mockModifiers: Modifiers = {
    milk: 'Oat',
    sugar: '1 spoon'
};

const mockModifiers2: Modifiers = {
    milk: 'None',
    sugar: 'None'
};

// ============================================================================
// KOSÁR TESZTEK
// ============================================================================

describe('Cart Store', () => {
    // Minden teszt előtt töröljük a kosár tartalmát
    beforeEach(() => {
        cartItems.set([]);
    });

    describe('cartItems store', () => {
        it('kezdetben üres a kosár', () => {
            const items = get(cartItems);
            expect(items).toEqual([]);
        });

        it('közvetlenül állítható a kosár tartalma', () => {
            const testItem = {
                ...mockProduct,
                quantity: 2,
                modifiers: mockModifiers
            };
            cartItems.set([testItem]);

            const items = get(cartItems);
            expect(items).toHaveLength(1);
            expect(items[0]).toEqual(testItem);
        });
    });

    describe('addToCart függvény', () => {
        it('hozzáad egy terméket a kosárhoz', () => {
            addToCart(mockProduct, 1, mockModifiers);

            const items = get(cartItems);
            expect(items).toHaveLength(1);
            expect(items[0].id).toBe('test-001');
            expect(items[0].name).toBe('Teszt Cappuccino');
            expect(items[0].price).toBe(850);
            expect(items[0].quantity).toBe(1);
            expect(items[0].modifiers).toEqual(mockModifiers);
        });

        it('több terméket is hozzá lehet adni', () => {
            addToCart(mockProduct, 1, mockModifiers);
            addToCart(mockProduct2, 2, mockModifiers2);

            const items = get(cartItems);
            expect(items).toHaveLength(2);
        });

        it('ugyanazt a terméket többször hozzáadva új elemként kerül be', () => {
            addToCart(mockProduct, 1, mockModifiers);
            addToCart(mockProduct, 1, mockModifiers2);

            const items = get(cartItems);
            expect(items).toHaveLength(2);
            // Mindkét elem ugyanaz a termék, de különböző módosítókkal
            expect(items[0].id).toBe('test-001');
            expect(items[1].id).toBe('test-001');
            expect(items[0].modifiers).toEqual(mockModifiers);
            expect(items[1].modifiers).toEqual(mockModifiers2);
        });

        it('megtartja a termék képét', () => {
            addToCart(mockProduct2, 1, mockModifiers);

            const items = get(cartItems);
            expect(items[0].image).toBe('/images/espresso.webp');
        });

        it('különböző mennyiségeket kezel', () => {
            addToCart(mockProduct, 5, mockModifiers);

            const items = get(cartItems);
            expect(items[0].quantity).toBe(5);
        });
    });

    describe('cartTotal derived store', () => {
        it('üres kosárnál 0 a végösszeg', () => {
            const total = get(cartTotal);
            expect(total).toBe(0);
        });

        it('egy termék esetén helyes a végösszeg', () => {
            addToCart(mockProduct, 1, mockModifiers);

            const total = get(cartTotal);
            expect(total).toBe(850);
        });

        it('több egységnél szorozza az árat', () => {
            addToCart(mockProduct, 3, mockModifiers);

            const total = get(cartTotal);
            expect(total).toBe(850 * 3); // 2550
        });

        it('több termék összegét helyesen számolja', () => {
            addToCart(mockProduct, 2, mockModifiers);  // 850 * 2 = 1700
            addToCart(mockProduct2, 3, mockModifiers2); // 650 * 3 = 1950

            const total = get(cartTotal);
            expect(total).toBe(1700 + 1950); // 3650
        });

        it('kosár kiürítésekor 0 lesz a végösszeg', () => {
            addToCart(mockProduct, 2, mockModifiers);
            expect(get(cartTotal)).toBe(1700);

            cartItems.set([]);
            expect(get(cartTotal)).toBe(0);
        });

        it('automatikusan frissül új termék hozzáadásakor', () => {
            expect(get(cartTotal)).toBe(0);

            addToCart(mockProduct, 1, mockModifiers);
            expect(get(cartTotal)).toBe(850);

            addToCart(mockProduct2, 1, mockModifiers2);
            expect(get(cartTotal)).toBe(850 + 650); // 1500
        });
    });

    describe('komplex kosár műveletek', () => {
        it('több ugyanolyan termék különböző módosítókkal', () => {
            // 3 cappuccino, mindegyik más tejes beállítással
            addToCart(mockProduct, 1, { milk: 'None', sugar: 'None' });
            addToCart(mockProduct, 2, { milk: 'Oat', sugar: '1 spoon' });
            addToCart(mockProduct, 1, { milk: 'Cow', sugar: '2 spoons' });

            const items = get(cartItems);
            expect(items).toHaveLength(3);

            // Végösszeg: 850 * 1 + 850 * 2 + 850 * 1 = 3400
            expect(get(cartTotal)).toBe(3400);
        });

        it('nagy rendelés kezelése', () => {
            // 10 különböző termék hozzáadása
            for (let i = 0; i < 10; i++) {
                addToCart(
                    { id: `product-${i}`, name: `Termék ${i}`, price: 100 * (i + 1) },
                    i + 1,
                    mockModifiers
                );
            }

            const items = get(cartItems);
            expect(items).toHaveLength(10);

            // Végösszeg: 100*1 + 200*2 + 300*3 + ... + 1000*10
            // = 100 + 400 + 900 + 1600 + 2500 + 3600 + 4900 + 6400 + 8100 + 10000
            // = 38500
            expect(get(cartTotal)).toBe(38500);
        });
    });
});
