/**
 * Rendelések kezelő modul
 *
 * Ez a modul tartalmazza a mock rendelés adatokat az admin felület számára.
 * Jelenleg csak front-end design célokra szolgál, nincs valódi adatbázis mögötte.
 *
 * @module orders
 */

import { writable } from 'svelte/store';
import type { Order } from './types';

/**
 * Mock rendelés adatok
 *
 * Tesztelési célra elkészített rendelések különböző státuszokkal.
 */
const initialOrders: Order[] = [
    {
        id: 1001,
        customerName: 'Kovács János',
        email: 'kovacs.janos@example.com',
        phone: '+36 30 123 4567',
        address: {
            zip: '1111',
            city: 'Budapest',
            street: 'Kossuth Lajos utca',
            house: '12'
        },
        orderDate: '2025-12-28T10:30:00',
        shipped: true,
        shippedDate: '2025-12-29T14:20:00',
        items: [
            {
                name: 'Cappuccino',
                quantity: 2,
                price: 890,
                modifiers: {
                    milk: 'Cow',
                    sugar: '1 spoon'
                }
            },
            {
                name: 'Espresso',
                quantity: 1,
                price: 650,
                modifiers: {
                    milk: 'None',
                    sugar: 'None'
                }
            }
        ]
    },
    {
        id: 1002,
        customerName: 'Nagy Eszter',
        email: 'nagy.eszter@example.com',
        phone: '+36 70 987 6543',
        address: {
            zip: '6720',
            city: 'Szeged',
            street: 'Kárász utca',
            house: '5/A'
        },
        orderDate: '2026-01-02T15:45:00',
        shipped: false,
        shippedDate: null,
        items: [
            {
                name: 'Latte',
                quantity: 1,
                price: 990,
                modifiers: {
                    milk: 'Oat',
                    sugar: '2 spoons'
                }
            }
        ]
    },
    {
        id: 1003,
        customerName: 'Szabó Péter',
        email: 'szabo.peter@example.com',
        phone: '+36 20 555 1234',
        address: {
            zip: '4032',
            city: 'Debrecen',
            street: 'Piac utca',
            house: '34'
        },
        orderDate: '2026-01-03T09:15:00',
        shipped: false,
        shippedDate: null,
        items: [
            {
                name: 'Cappuccino',
                quantity: 3,
                price: 890,
                modifiers: {
                    milk: 'Almond',
                    sugar: 'None'
                }
            },
            {
                name: 'Americano',
                quantity: 2,
                price: 750,
                modifiers: {
                    milk: 'None',
                    sugar: '1 spoon'
                }
            },
            {
                name: 'Espresso',
                quantity: 1,
                price: 650,
                modifiers: {
                    milk: 'None',
                    sugar: 'None'
                }
            }
        ]
    },
    {
        id: 1004,
        customerName: 'Tóth Anna',
        email: 'toth.anna@example.com',
        phone: '+36 30 999 8888',
        address: {
            zip: '9024',
            city: 'Győr',
            street: 'Baross Gábor út',
            house: '78'
        },
        orderDate: '2026-01-04T11:00:00',
        shipped: true,
        shippedDate: '2026-01-04T16:30:00',
        items: [
            {
                name: 'Latte',
                quantity: 2,
                price: 990,
                modifiers: {
                    milk: 'Cow',
                    sugar: '2 spoons'
                }
            }
        ]
    }
];

/**
 * Rendelések store
 *
 * Egy írható Svelte store, amely a rendelések listáját tárolja.
 * Az admin felületen használható rendelések törlésére és státusz frissítésére.
 *
 * @constant
 * @type {Writable<Order[]>}
 */
export const orders = writable<Order[]>(initialOrders);
