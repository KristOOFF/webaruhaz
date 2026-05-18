/**
 * Termék interfész
 *
 * Egy kávétermék alapvető adatait reprezentálja a katalógusban.
 *
 * @interface Product
 * @property {string} id - A termék egyedi azonosítója (GUID)
 * @property {string} name - A termék megjelenítési neve (pl. "Cappuccino", "Espresso")
 * @property {number} price - A termék ára magyar forintban (Ft)
 * @property {string | null} image - A termék képének URL-je (opcionális)
 */
export interface Product {
    id: string;
    name: string;
    price: number;
    image?: string | null;
}

/**
 * Módosítók interfész
 *
 * A vásárló által választható testreszabási lehetőségeket tartalmazza.
 * Ezek a beállítások minden kosárba helyezett termékhez hozzárendelhetők.
 *
 * @interface Modifiers
 * @property {string} milk - A választott tej típusa (pl. "Almond", "Cow", "Oat")
 * @property {string} sugar - A cukor mennyisége (pl. "None", "1 spoon", "2 spoons")
 */
export interface Modifiers {
    milk: string;
    sugar: string;
}

/**
 * Kosár elem interfész
 *
 * Egy kosárba helyezett terméket reprezentál, amely tartalmazza az alap termék adatokat,
 * valamint a mennyiséget és a vásárló által választott módosításokat.
 *
 * @interface CartItem
 * @extends {Product}
 * @property {number} quantity - A termékből rendelt mennyiség (minimum 1)
 * @property {Modifiers} modifiers - A termékhez választott módosítások (tej típusa, cukor mennyisége)
 */
export interface CartItem extends Product {
    quantity: number;
    modifiers: Modifiers;
}

// Megjegyzés: a rendelésekkel kapcsolatos típusok (ApiOrder, OrderItem,
// CreateOrderInput stb.) a backend séma szerint a `src/lib/api.ts`-ben
// vannak definiálva, és onnan importálandók.