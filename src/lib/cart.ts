/**
 * Kosár kezelő modul
 *
 * Ez a modul felelős a bevásárlókosár állapotkezeléséért, beleértve a termékek
 * hozzáadását, tárolását és a végösszeg kiszámítását.
 *
 * @module cart
 */

import { writable, derived } from 'svelte/store';
import type { CartItem, Product, Modifiers } from './types';

/**
 * Kosár elemek store
 *
 * Egy írható Svelte store, amely tartalmazza a kosárban lévő összes elemet.
 * Minden elem tartalmazza a termék adatait, mennyiséget és módosításokat.
 *
 * @type {Writable<CartItem[]>}
 * @default []
 */
export const cartItems = writable<CartItem[]>([]);

/**
 * Kosár végösszeg store
 *
 * Egy származtatott (derived) store, amely automatikusan kiszámítja a kosár
 * teljes értékét az elemek alapján. Az összeg a (termék ára × mennyiség)
 * szorzatának összegzésével kerül kiszámításra.
 *
 * @type {Readable<number>}
 * @returns {number} A kosár teljes értéke magyar forintban (Ft)
 */
export const cartTotal = derived(cartItems, ($items) => {
    return $items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

/**
 * Termék hozzáadása a kosárhoz
 *
 * Hozzáad egy új terméket a kosárhoz a megadott mennyiséggel és módosításokkal.
 * Minden hívás egy új elemet ad hozzá a kosárhoz, még akkor is, ha ugyanaz
 * a termék már szerepel benne.
 *
 * @function addToCart
 * @param {Product} product - A hozzáadandó termék alapadatai
 * @param {number} quantity - A termék mennyisége (minimum 1)
 * @param {Modifiers} modifiers - A vásárló által választott módosítások (tej típusa, cukor mennyisége)
 *
 * @example
 * ```typescript
 * import { addToCart } from '$lib/cart';
 * import { products } from '$lib/products';
 *
 * addToCart(products[0], 2, { milk: 'Oat', sugar: '1 spoon' });
 * ```
 */
export const addToCart = (product: Product, quantity: number, modifiers: Modifiers) => {
    cartItems.update(items => {
        const newItem: CartItem = { ...product, quantity, modifiers };
        return [...items, newItem];
    });
};