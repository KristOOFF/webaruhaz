/**
 * Termék katalógus modul
 *
 * Ez a modul tartalmazza a webáruházban elérhető kávétermékek teljes listáját.
 * A termékek statikusan vannak definiálva, és az alkalmazás indításakor betöltődnek.
 *
 * @module products
 */

import type { Product } from './types';

/**
 * Termékek tömbje
 *
 * Az összes elérhető kávétermék listája a webáruházban.
 * Minden termék tartalmazza az azonosítót, nevet, árat és típust.
 *
 * Jelenleg elérhető termékek:
 * - Cappuccino (2 variáns)
 * - Espresso
 * - Latte
 * - Americano
 * - Doppio
 *
 * @constant
 * @type {Product[]}
 *
 * @example
 * ```typescript
 * import { products } from '$lib/products';
 *
 * // Összes termék megjelenítése
 * products.forEach(product => {
 *   console.log(`${product.name} - ${product.price} Ft`);
 * });
 *
 * // Csak kávék szűrése
 * const coffees = products.filter(p => p.type === 'coffee');
 * ```
 */
export const products: Product[] = [
    { id: 'a1b2c3d4', name: 'Cappuccino', price: 850, image: '/images/cappuccino.jpg' },
    { id: 'b2c3d4e5', name: 'Espresso', price: 650, image: '/images/espresso.webp' },
    { id: 'c3d4e5f6', name: 'Ristretto', price: 850, image: '/images/ristretto.jpg' },
    { id: 'd4e5f6a7', name: 'Latte', price: 900, image: '/images/latte.jpg' },
    { id: 'e5f6a7b8', name: 'Americano', price: 700, image: '/images/americano.jpg' },
    { id: 'f6a7b8c9', name: 'Doppio', price: 800, image: '/images/doppio.webp' }
];