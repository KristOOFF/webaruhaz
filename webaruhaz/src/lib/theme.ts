// src/lib/theme.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Default to dark mode if running on server, or check local storage on client
const defaultValue = browser ? localStorage.getItem('theme') === 'dark' : true;

export const isDarkMode = writable<boolean>(defaultValue);

// Subscribe to changes to update the <html> class and localStorage
if (browser) {
    // Initialize the class immediately on page load
    if (defaultValue) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

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