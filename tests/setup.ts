/**
 * Vitest teszt setup fájl
 *
 * Ez a fájl minden teszt előtt lefut, és beállítja a tesztkörnyezetet.
 */

import { vi, beforeEach } from 'vitest';

// Mock localStorage a tesztek számára
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
};

Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock
});

// Reset mocks minden teszt előtt
beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
});
