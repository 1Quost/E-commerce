import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../interfaces/product';
import { StorageUtil } from '../utils/storage.util';

export interface CartItem {
  product: Product;
  qty: number;
}

const STORAGE_KEY_PREFIX = 'nexora_cart';
const SHIPPING_THRESHOLD = 100;
const SHIPPING_COST = 9.99;
const TAX_RATE = 0.08;

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private currentCartKey: string | null = null;

  readonly items = signal<CartItem[]>([]);

  readonly count = computed(() => this.items().reduce((sum, i) => sum + i.qty, 0));
  readonly subtotal = computed(() => this.items().reduce((sum, i) => sum + i.product.price * i.qty, 0));

  readonly shipping = computed(() =>
    this.subtotal() === 0 ? 0 : this.subtotal() >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  );

  readonly tax = computed(() => this.subtotal() * TAX_RATE);
  readonly total = computed(() => this.subtotal() + this.shipping() + this.tax());
  readonly isEmpty = computed(() => this.items().length === 0);

  constructor() { }

  add(product: Product, qty = 1): void {
    this.items.update((arr) => {
      const existing = arr.find((i) => i.product.id === product.id);
      const next = existing
        ? arr.map((i) =>
            i.product.id === product.id
              ? { ...i, qty: Math.min(i.qty + qty, product.stock) }
              : i
          )
        : [...arr, { product, qty: Math.min(qty, product.stock) }];

      this.persist(next);
      return next;
    });
  }

  remove(productId: string): void {
    this.items.update((arr) => {
      const next = arr.filter((i) => i.product.id !== productId);
      this.persist(next);
      return next;
    });
  }

  setQty(productId: string, qty: number): void {
    if (qty <= 0) {
      this.remove(productId);
      return;
    }

    this.items.update((arr) => {
      const next = arr.map((i) =>
        i.product.id === productId
          ? { ...i, qty: Math.min(qty, i.product.stock) }
          : i
      );
      this.persist(next);
      return next;
    });
  }

  clear(): void {
    this.items.set([]);
    this.persist([]);
  }

  restoreForUser(email: string | null | undefined): void {
    if (!this.isBrowser || !email) {
      this.currentCartKey = null;
      this.items.set([]);
      return;
    }

    this.currentCartKey = this.buildKey(email);
    this.items.set(this.loadFromKey(this.currentCartKey));
  }

  clearSession(): void {
    this.currentCartKey = null;
    this.items.set([]);
  }

  private persist(list: CartItem[]): void {
    if (!this.isBrowser || !this.currentCartKey) return;
    StorageUtil.set(this.currentCartKey, list);
  }

  private loadFromKey(key: string): CartItem[] {
    const parsed = StorageUtil.get<unknown>(key);
    if (!parsed || !Array.isArray(parsed)) return [];
    return parsed as CartItem[];
  }

  private buildKey(email: string): string {
    return `${STORAGE_KEY_PREFIX}:${email.trim().toLowerCase()}`;
  }
}