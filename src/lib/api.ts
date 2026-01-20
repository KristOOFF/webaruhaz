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
    localStorage.setItem('admin_token', token);
}

/**
 * Token lekérdezése localStorage-ból
 */
export function getToken(): string | null {
    return localStorage.getItem('admin_token');
}

/**
 * Token törlése
 */
export function clearToken(): void {
    localStorage.removeItem('admin_token');
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
    id: number;
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
// TERMÉKEK (ADMIN)
// ============================================================================

export interface Product {
    id: number;
    nev: string;
    leiras: string | null;
    ar: number;
    tipus: 'coffee' | 'espresso';
    kep_url: string | null;
    letrehozva: string;
    frissitve: string;
}

export interface ProductInput {
    nev: string;
    leiras?: string;
    ar: number;
    tipus: 'coffee' | 'espresso';
    kep_url?: string;
}

/**
 * Összes termék lekérdezése
 */
export async function getProducts(): Promise<Product[]> {
    return apiFetch<Product[]>('/products');
}

/**
 * Egy termék lekérdezése
 */
export async function getProduct(id: number): Promise<Product> {
    return apiFetch<Product>(`/products/${id}`);
}

/**
 * Új termék létrehozása (Admin)
 */
export async function createProduct(product: ProductInput): Promise<Product> {
    return apiFetch<Product>('/products', {
        method: 'POST',
        body: JSON.stringify(product)
    });
}

/**
 * Termék módosítása (Admin)
 */
export async function updateProduct(id: number, product: Partial<ProductInput>): Promise<Product> {
    return apiFetch<Product>(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(product)
    });
}

/**
 * Termék törlése (Admin)
 */
export async function deleteProduct(id: number): Promise<void> {
    await apiFetch(`/products/${id}`, { method: 'DELETE' });
}

// ============================================================================
// RENDELÉSEK (ADMIN)
// ============================================================================

export interface OrderItem {
    id: number;
    rendeles_id: number;
    termek_nev: string;
    termek_ar: number;
    mennyiseg: number;
    tej: string;
    cukor: string;
}

export interface ApiOrder {
    id: number;
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
export async function getOrder(id: number): Promise<ApiOrder> {
    return apiFetch<ApiOrder>(`/orders/${id}`);
}

/**
 * Rendelés postázási státusz módosítása (Admin)
 */
export async function shipOrder(id: number, postazva: 0 | 1): Promise<{ id: number; postazva: number; postazva_datum: string | null }> {
    return apiFetch(`/orders/${id}/ship`, {
        method: 'PATCH',
        body: JSON.stringify({ postazva })
    });
}

/**
 * Rendelés törlése (Admin)
 */
export async function deleteOrder(id: number): Promise<void> {
    await apiFetch(`/orders/${id}`, { method: 'DELETE' });
}
