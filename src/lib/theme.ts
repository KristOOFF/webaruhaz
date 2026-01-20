/**
 * Téma kezelő modul
 *
 * Ez a modul felelős a világos/sötét téma váltásáért és megőrzéséért.
 * A felhasználó beállítása a böngésző localStorage-ban kerül tárolásra,
 * így a következő látogatáskor is ugyanazt a témát látja.
 *
 * @module theme
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Alapértelmezett téma érték
 *
 * Szerveren futáskor alapértelmezetten dark mode-ot használ.
 * Kliens oldalon a localStorage-ból olvassa be a mentett beállítást.
 *
 * @constant
 * @type {boolean}
 * @private
 */
const defaultValue = browser ? (localStorage.getItem('theme') !== 'light') : true;

/**
 * Sötét mód store
 *
 * Egy írható Svelte store, amely a téma állapotát tárolja.
 * - `true`: sötét téma aktív
 * - `false`: világos téma aktív
 *
 * A store értéke automatikusan:
 * - Frissíti a `<html>` elem `dark` osztályát
 * - Elmenti a beállítást a localStorage-ba
 *
 * @constant
 * @type {Writable<boolean>}
 *
 * @example
 * ```typescript
 * import { isDarkMode } from '$lib/theme';
 *
 * // Téma váltása
 * isDarkMode.update(current => !current);
 *
 * // Sötét módra váltás
 * isDarkMode.set(true);
 *
 * // Téma olvasása komponensben
 * $: theme = $isDarkMode ? 'dark' : 'light';
 * ```
 */
export const isDarkMode = writable<boolean>(defaultValue);

/**
 * Téma inicializálás és változás figyelés
 *
 * Csak böngészőben fut (nem SSR során). Két fő funkciója:
 * 1. Inicializáláskor beállítja a megfelelő CSS osztályt a HTML elemen
 * 2. Feliratkozik a store változásaira és szinkronizálja a DOM-ot és localStorage-t
 */
if (browser) {
    // A dark osztály azonnali beállítása az oldal betöltésekor
    // Ez megelőzi a "villanást" amikor a téma késve töltődik be
    if (defaultValue) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // Feliratkozás a téma változásaira
    isDarkMode.subscribe((value) => {
        if (value) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    });
}