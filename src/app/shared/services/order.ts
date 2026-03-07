import { Injectable, computed, signal } from '@angular/core';
import { Order, OrderStatus } from '../interfaces/order';
import { StorageUtil } from '../utils/storage.util';

const STORAGE_KEY = 'nexora_orders';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly _orders = signal<Order[]>(this.load());

  readonly orders = computed(() => this._orders());

  addOrder(order: Order): void {
    this._orders.update((arr) => {
      const next = [order, ...arr];
      this.persist(next);
      return next;
    });
  }

  setStatus(id: string, status: OrderStatus): void {
    this._orders.update((arr) => {
      const next = arr.map((o) => (o.id === id ? { ...o, status } : o));
      this.persist(next);
      return next;
    });
  }

  getById(id: string): Order | undefined {
    return this._orders().find((o) => o.id === id);
  }

  private load(): Order[] {
    const parsed = StorageUtil.get<unknown>(STORAGE_KEY);
    if (!parsed || !Array.isArray(parsed)) return [];
    return parsed as Order[];
  }

  private persist(list: Order[]): void {
    StorageUtil.set(STORAGE_KEY, list);
  }
}