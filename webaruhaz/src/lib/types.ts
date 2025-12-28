export interface Product {
    id: number;
    name: string;
    price: number;
    type: 'coffee' | 'espresso';
}

export interface Modifiers {
    milk: string;
    sugar: string;
}

export interface CartItem extends Product {
    quantity: number;
    modifiers: Modifiers;
}