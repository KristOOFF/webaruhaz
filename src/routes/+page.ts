/**
 * Main page load function
 *
 * Termékek betöltése az API-ból SSR-rel (Server-Side Rendering)
 * Ez gyors, SEO-barát, és működik JavaScript nélkül is.
 */

import type { FrontendProduct } from '$lib/api';
import { getProducts } from '$lib/api';

// Explicit típus definíció a load függvény visszatérési értékéhez
export type PageData = {
    products: FrontendProduct[];
    error?: string;
};

export async function load(): Promise<PageData> {
    try {
        // Termékek lekérése az API-ból
        const products = await getProducts();

        return {
            products
        };
    } catch (error) {
        console.error('Termékek betöltése sikertelen:', error);

        // Fallback: Ha az API nem érhető el, visszatérünk üres tömbbel
        // Az alkalmazás így is működik, csak termékek nélkül
        return {
            products: [],
            error: 'Nem sikerült betölteni a termékeket'
        };
    }
}
