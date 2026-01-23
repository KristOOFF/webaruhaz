import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

/**
 * Validációs függvények a checkout űrlap mezőihez
 */

/**
 * Email cím validáció
 * @param email - Az ellenőrizendő email cím
 * @returns true ha helyes formátumú, false ha helytelen
 */
export function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email.trim());
}

/**
 * Telefonszám validáció (magyar formátumok)
 * Elfogadott formátumok:
 * - +36 20 123 4567, +36 30 123 4567, +36 70 123 4567
 * - +3620 123 4567, +3630 123 4567, +3670 123 4567
 * - +36201234567, +36301234567, +36701234567
 * - 06 20 123 4567, 06 30 123 4567, 06 70 123 4567
 * - 0620 123 4567, 0630 123 4567, 0670 123 4567
 * - 06201234567, 06301234567, 06701234567
 * @param phone - Az ellenőrizendő telefonszám
 * @returns true ha helyes formátumú, false ha helytelen
 */
export function validatePhone(phone: string): boolean {
	// Eltávolítjuk a szóközöket és kötőjeleket a könnyebb feldolgozáshoz
	const cleanPhone = phone.replace(/[\s\-]/g, '');

	// Magyar mobilszám formátumok: +36 vagy 06 + operátor (20/30/70) + 7 számjegy
	const phoneRegex = /^(\+36|06)(20|30|70)\d{7}$/;
	return phoneRegex.test(cleanPhone);
}

/**
 * Irányítószám validáció (magyar formátum)
 * @param zip - Az ellenőrizendő irányítószám
 * @returns true ha pontosan 4 számjegy, false ha helytelen
 */
export function validateZip(zip: string): boolean {
	const zipRegex = /^\d{4}$/;
	return zipRegex.test(zip.trim());
}

/**
 * Település név validáció
 * Elfogadott karakterek: betűk (magyar ékezetekkel), szóközök, kötőjelek
 * @param city - Az ellenőrizendő település név
 * @returns true ha helyes formátumú, false ha helytelen
 */
export function validateCity(city: string): boolean {
	// Magyar ékezetes betűk, szóköz, kötőjel engedélyezése, minimum 2 karakter
	const cityRegex = /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s\-]{2,}$/;
	return cityRegex.test(city.trim());
}

/**
 * Cím (utca, házszám) validáció
 * Elfogadott karakterek: betűk (magyar ékezetekkel), számok, szóközök, pont, kötőjel, vessző
 * @param street - Az ellenőrizendő cím
 * @returns true ha helyes formátumú, false ha helytelen
 */
export function validateStreet(street: string): boolean {
	// Magyar ékezetes betűk, számok, szóköz, pont, kötőjel, vessző engedélyezése, minimum 3 karakter
	const streetRegex = /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ0-9\s\.\-,]{3,}$/;
	return streetRegex.test(street.trim());
}

/**
 * Hibaüzenetek a validációs hibákhoz
 */
export const validationErrors = {
	email: 'Kérjük, adj meg egy helyes email címet (pl. pelda@email.hu)',
	phone: 'Kérjük, adj meg egy helyes magyar telefonszámot (pl. +36 30 123 4567 vagy 06 30 123 4567)',
	zip: 'Az irányítószámnak pontosan 4 számjegyből kell állnia (pl. 1234)',
	city: 'A település neve csak betűket, szóközöket és kötőjeleket tartalmazhat (min. 2 karakter)',
	street: 'A cím csak betűket, számokat, szóközöket, pontot, kötőjelet és vesszőt tartalmazhat (min. 3 karakter)',
	required: 'Ez a mező kötelező'
};
