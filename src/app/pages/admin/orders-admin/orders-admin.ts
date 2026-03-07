import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../../shared/interfaces/order';
import { OrdersService } from '../../../shared/services/order';

@Component({
  selector: 'app-orders-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders-admin.html',
  styleUrl: './orders-admin.scss',
})
export class OrdersAdmin {
  private readonly ordersService = inject(OrdersService);

  readonly orders = computed(() => this.ordersService.orders());

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
      .filter((o) => o.status === 'Paid' || o.status === 'Completed')
      .reduce((sum, o) => sum + o.total, 0)
  );

  setStatus(id: string, status: Order['status']) {
    this.ordersService.setStatus(id, status);
  }

  itemsCount(order: Order) {
    return order.items.reduce((sum, it) => sum + it.qty, 0);
  }
}