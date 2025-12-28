import { writable, derived } from 'svelte/store';
import type { CartItem, Product, Modifiers } from './types';

export const cartItems = writable<CartItem[]>([]);

export const cartTotal = derived(cartItems, ($items) => {
    return $items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

export const addToCart = (product: Product, quantity: number, modifiers: Modifiers) => {
    cartItems.update(items => {
        const newItem: CartItem = { ...product, quantity, modifiers };
        return [...items, newItem];
    });
};