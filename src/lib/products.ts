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
    { id: 1, name: 'Cappuccino', price: 850,},
    { id: 2, name: 'Espresso', price: 650},
    { id: 3, name: 'Ristretto', price: 850},
    { id: 4, name: 'Latte', price: 900},
    { id: 5, name: 'Americano', price: 700},
    { id: 6, name: 'Doppio', price: 800}
];