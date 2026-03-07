export type OrderStatus = 'Pending' | 'Paid' | 'Completed' | 'Cancelled';

export interface OrderItem {
    productId: string;
    productName: string;
    productImage: string;
    qty: number;
    unitPrice: number;
    lineTotal: number;
}

export interface Order {
    id: string;
    customer: string;
    email: string;
    date: string;
    status: OrderStatus;
    items: OrderItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;

    address?: string;
    city?: string;
    phone?: string;
}