import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../../shared/interfaces/order';

const MOCK_ORDERS: Order[] = [
  {
    id: 'ord_1001',
    customer: 'Lina M.',
    email: 'lina@example.com',
    date: new Date().toISOString(),
    status: 'Paid',
    items: [
      {
        productId: 'nx-1003',
        productName: 'Noise-Cancelling Headphones',
        productImage: 'https://images.unsplash.com/photo-1518441902117-f0a4a0d3f9d8?auto=format&fit=crop&w=1200&q=80',
        qty: 1,
        unitPrice: 249.99,
        lineTotal: 249.99,
      },
    ],
    subtotal: 249.99,
    shipping: 0,
    tax: 19.9992,
    total: 269.9892,
  },
  {
    id: 'ord_1002',
    customer: 'Omar K.',
    email: 'omar@example.com',
    date: new Date(Date.now() - 86400000).toISOString(),
    status: 'Pending',
    items: [
      {
        productId: 'nx-1001',
        productName: 'Minimal Leather Backpack',
        productImage: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80',
        qty: 2,
        unitPrice: 149,
        lineTotal: 298,
      },
    ],
    subtotal: 298,
    shipping: 0,
    tax: 23.84,
    total: 321.84,
  },
];

@Component({
  selector: 'app-orders-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders-admin.html',
  styleUrl: './orders-admin.scss',
})
export class OrdersAdmin {
  readonly orders = signal<Order[]>(MOCK_ORDERS);

  readonly sortedOrders = computed(() =>
    [...this.orders()].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  );

  readonly paidCount = computed(() =>
    this.orders().filter((o) => o.status === 'Paid').length
  );

  readonly pendingCount = computed(() =>
    this.orders().filter((o) => o.status === 'Pending').length
  );

  readonly cancelledCount = computed(() =>
    this.orders().filter((o) => o.status === 'Cancelled').length
  );

  readonly revenue = computed(() =>
    this.orders()
      .filter((o) => o.status === 'Paid')
      .reduce((sum, o) => sum + o.total, 0)
  );

  setStatus(id: string, status: Order['status']) {
    this.orders.update((arr) =>
      arr.map((o) => (o.id === id ? { ...o, status } : o))
    );
  }

  itemsCount(order: Order) {
    return order.items.reduce((sum, it) => sum + it.qty, 0);
  }
}