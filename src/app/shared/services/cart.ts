import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../interfaces/product';
import { StorageUtil } from '../utils/storage.util';

export interface CartItem {
  product: Product;
  qty: number;
}

const STORAGE_KEY = 'nexora_cart';
const SHIPPING_THRESHOLD = 100;
const SHIPPING_COST = 9.99;
const TAX_RATE = 0.08;

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly items = signal<CartItem[]>(this.isBrowser ? this.load() : []);

  readonly count = computed(() => this.items().reduce((sum, i) => sum + i.qty, 0));
  readonly subtotal = computed(() => this.items().reduce((sum, i) => sum + i.product.price * i.qty, 0));

  readonly shipping = computed(() =>
    this.subtotal() === 0 ? 0 : this.subtotal() >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  );

  readonly tax = computed(() => this.subtotal() * TAX_RATE);
  readonly total = computed(() => this.subtotal() + this.shipping() + this.tax());
  readonly isEmpty = computed(() => this.items().length === 0);

  constructor() {
    if (this.isBrowser) {
      effect(() => StorageUtil.set(STORAGE_KEY, this.items()));
    }
  }

  add(product: Product, qty = 1): void {
    this.items.update((arr) => {
      const existing = arr.find((i) => i.product.id === product.id);
      if (existing) {
        return arr.map((i) =>
          i.product.id === product.id
            ? { ...i, qty: Math.min(i.qty + qty, product.stock) }
            : i
        );
      }
      return [...arr, { product, qty: Math.min(qty, product.stock) }];
    });
  }

  remove(productId: string): void {
    this.items.update((arr) => arr.filter((i) => i.product.id !== productId));
  }

  setQty(productId: string, qty: number): void {
    if (qty <= 0) {
      this.remove(productId);
      return;
    }
    this.items.update((arr) =>
      arr.map((i) =>
        i.product.id === productId
          ? { ...i, qty: Math.min(qty, i.product.stock) }
          : i
      )
    );
  }

  clear(): void {
    this.items.set([]);
  }

  private load(): CartItem[] {
    const parsed = StorageUtil.get<unknown>(STORAGE_KEY);
    if (!parsed || !Array.isArray(parsed)) return [];
    return parsed as CartItem[];
  }
}