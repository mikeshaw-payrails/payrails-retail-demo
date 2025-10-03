// Centralized cart items definition so payment payload and UI remain consistent
// In a real application this would come from state/store or backend.
export interface CartItem {
    id: number;
    name: string;
    price: number; // base price in USD (source currency)
    quantity: number;
}

export const CART_ITEMS: CartItem[] = [
    { id: 1, name: "Merino Wool Sweater", price: 185.0, quantity: 1 },
    { id: 2, name: "Organic Cotton Tee", price: 45.0, quantity: 2 },
];

export const computeCartTotals = (items: CartItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.08; // Simplified demo tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
};
