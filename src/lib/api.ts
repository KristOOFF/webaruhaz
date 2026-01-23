/**
 * Admin API szolgáltatás
 *
 * REST API hívások az admin backend felé.
 */

const API_BASE = 'http://localhost:3000/api';

// ============================================================================
// TOKEN KEZELÉS
// ============================================================================

/**
 * Token mentése localStorage-ba
 */
export function setToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('admin_token', token);
    }
}

/**
 * Token lekérdezése localStorage-ból
 */
export function getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('admin_token');
    }
    return null;
}

/**
 * Token törlése
 */
export function clearToken(): void {
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('admin_token');
    }
}

/**
 * Authorization header generálása
 */
function authHeaders(): HeadersInit {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ============================================================================
// ÁLTALÁNOS FETCH WRAPPER
// ============================================================================

interface ApiError {
    error: string;
}

async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error((data as ApiError).error || 'API hiba');
    }

    return data as T;
}

// ============================================================================
// ADMIN AUTENTIKÁCIÓ
// ============================================================================

export interface AdminUser {
    id: string;
    felhasznalonev: string;
    letrehozva?: string;
}

export interface LoginResponse {
    token: string;
    admin: AdminUser;
}

export interface VerifyResponse {
    valid: boolean;
    admin: AdminUser;
}

/**
 * Admin bejelentkezés
 */
export async function login(felhasznalonev: string, jelszo: string): Promise<LoginResponse> {
    const response = await apiFetch<LoginResponse>('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ felhasznalonev, jelszo })
    });
    setToken(response.token);
    return response;
}

/**
 * Admin kijelentkezés
 */
export async function logout(): Promise<void> {
    await apiFetch('/admin/logout', { method: 'POST' });
    clearToken();
}

/**
 * Token érvényesség ellenőrzése
 */
export async function verifyToken(): Promise<VerifyResponse> {
    return apiFetch<VerifyResponse>('/admin/verify');
}

/**
 * Bejelentkezve van-e az admin
 */
export function isLoggedIn(): boolean {
    return !!getToken();
}

// ============================================================================
// TERMÉKEK (PUBLIKUS)
// ============================================================================

/**
 * Backend Product interfész (adatbázis séma szerint)
 */
export interface ApiProduct {
    id: string;
    nev: string;
    ar: number;
    kep_url: string | null;
}

/**
 * Frontend Product interfész (kompatibilis a types.ts-el)
 * Ez a formátum amit a frontend komponensek használnak
 */
export interface FrontendProduct {
    id: string;
    name: string;
    price: number;
    image?: string | null;
}

export interface ProductInput {
    nev: string;
    ar: number;
    kep_url?: string;
}

/**
 * Összes termék lekérdezése
 * Átalakítja a backend formátumot frontend formátumra
 */
export async function getProducts(): Promise<FrontendProduct[]> {
    const apiProducts = await apiFetch<ApiProduct[]>('/products');

    // Backend formátum átalakítása frontend formátumra
    return apiProducts.map(product => ({
        id: product.id,
        name: product.nev,
        price: product.ar,
        image: product.kep_url
    }));
}

/**
 * Egy termék lekérdezése
 * Átalakítja a backend formátumot frontend formátumra
 */
export async function getProduct(id: string): Promise<FrontendProduct> {
    const apiProduct = await apiFetch<ApiProduct>(`/products/${id}`);

    return {
        id: apiProduct.id,
        name: apiProduct.nev,
        price: apiProduct.ar,
        image: apiProduct.kep_url
    };
}

/**
 * Új termék létrehozása (Admin)
 */
export async function createProduct(product: ProductInput): Promise<ApiProduct> {
    return apiFetch<ApiProduct>('/products', {
        method: 'POST',
        body: JSON.stringify(product)
    });
}

/**
 * Termék módosítása (Admin)
 */
export async function updateProduct(id: string, product: Partial<ProductInput>): Promise<ApiProduct> {
    return apiFetch<ApiProduct>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(product)
    });
}

/**
 * Termék törlése (Admin)
 */
export async function deleteProduct(id: string): Promise<void> {
    await apiFetch(`/products/${id}`, { method: 'DELETE' });
}

// ============================================================================
// RENDELÉSEK (ADMIN)
// ============================================================================

export interface OrderItem {
    id: string;
    rendeles_id: string;
    termek_nev: string;
    termek_ar: number;
    mennyiseg: number;
    tej: string;
    cukor: string;
}

export interface ApiOrder {
    id: string;
    vevo_nev: string;
    telefon: string;
    email: string;
    iranyitoszam: string;
    telepules: string;
    utca_hazszam: string;
    megrendelve: string;
    postazva: number;
    postazva_datum: string | null;
    items: OrderItem[];
}

export interface OrdersQueryParams {
    postazva?: 0 | 1;
    email?: string;
}

/**
 * Összes rendelés lekérdezése (Admin)
 */
export async function getOrders(params?: OrdersQueryParams): Promise<ApiOrder[]> {
    const query = new URLSearchParams();
    if (params?.postazva !== undefined) query.set('postazva', String(params.postazva));
    if (params?.email) query.set('email', params.email);

    const queryString = query.toString();
    return apiFetch<ApiOrder[]>(`/orders${queryString ? `?${queryString}` : ''}`);
}

/**
 * Egy rendelés lekérdezése (Admin)
 */
export async function getOrder(id: string): Promise<ApiOrder> {
    return apiFetch<ApiOrder>(`/orders/${id}`);
}

/**
 * Rendelés postázási státusz módosítása (Admin)
 */
export async function shipOrder(id: string, postazva: 0 | 1): Promise<{ id: string; postazva: number; postazva_datum: string | null }> {
    return apiFetch(`/orders/${id}/ship`, {
        method: 'PATCH',
        body: JSON.stringify({ postazva })
    });
}

/**
 * Rendelés törlése (Admin)
 */
export async function deleteOrder(id: string): Promise<void> {
    await apiFetch(`/orders/${id}`, { method: 'DELETE' });
}

// ============================================================================
// RENDELÉSEK (PUBLIKUS - VÁSÁRLÓK SZÁMÁRA)
// ============================================================================

export interface CreateOrderItemInput {
    termek_nev: string;
    termek_ar: number;
    mennyiseg: number;
    tej: string;
    cukor: string;
}

export interface CreateOrderInput {
    vevo_nev: string;
    telefon: string;
    email: string;
    iranyitoszam: string;
    telepules: string;
    utca_hazszam: string;
    items: CreateOrderItemInput[];
}

/**
 * Új rendelés létrehozása (Publikus - vásárlók számára)
 */
export async function createOrder(order: CreateOrderInput): Promise<ApiOrder> {
    return apiFetch<ApiOrder>('/orders', {
        method: 'POST',
        body: JSON.stringify(order)
    });
}
