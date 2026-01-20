/**
 * Termék interfész
 *
 * Egy kávétermék alapvető adatait reprezentálja a katalógusban.
 *
 * @interface Product
 * @property {number} id - A termék egyedi azonosítója
 * @property {string} name - A termék megjelenítési neve (pl. "Cappuccino", "Espresso")
 * @property {number} price - A termék ára magyar forintban (Ft)
 * @property {'coffee' | 'espresso'} type - A termék típusa, amely meghatározza a kategóriáját
 */
export interface Product {
    id: number;
    name: string;
    price: number;
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

/**
 * Rendelés tétel interfész
 *
 * Egy rendelésben található termék adatait tartalmazza.
 *
 * @interface OrderItem
 * @property {string} name - A termék neve
 * @property {number} quantity - A rendelt mennyiség
 * @property {number} price - A termék ára
 * @property {Modifiers} modifiers - A termékhez választott módosítások
 */
export interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    modifiers: Modifiers;
}

/**
 * Cím interfész
 *
 * A vásárló szállítási címének adatait tartalmazza.
 *
 * @interface Address
 * @property {string} zip - Irányítószám
 * @property {string} city - Város
 * @property {string} street - Utca
 * @property {string} house - Házszám
 */
export interface Address {
    zip: string;
    city: string;
    street: string;
    house: string;
}

/**
 * Rendelés interfész
 *
 * Egy teljes rendelés összes adatát tartalmazza az admin felület számára.
 *
 * @interface Order
 * @property {number} id - A rendelés egyedi azonosítója
 * @property {string} customerName - A vásárló neve
 * @property {string} email - A vásárló email címe
 * @property {string} phone - A vásárló telefonszáma
 * @property {Address} address - A szállítási cím
 * @property {string} orderDate - A rendelés dátuma (ISO formátum)
 * @property {boolean} shipped - Postázási státusz (true = postázva, false = még nem postázva)
 * @property {string | null} shippedDate - A postázás dátuma (ISO formátum, vagy null ha még nem postázva)
 * @property {OrderItem[]} items - A rendelés tételei
 */
export interface Order {
    id: number;
    customerName: string;
    email: string;
    phone: string;
    address: Address;
    orderDate: string;
    shipped: boolean;
    shippedDate: string | null;
    items: OrderItem[];
}