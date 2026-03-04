import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../interfaces/product';
import { MOCK_PRODUCTS } from '../utils/mock-products';
import { StorageUtil } from '../utils/storage.util';

type ProductDraft = Omit<Product, 'id'>;

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly LS_KEY = 'nexora_products';

  private readonly _items = signal<Product[]>(this.loadInitial());

  readonly items = computed(() => this._items());

  // Used by pages
  products() {
    return this.items();
  }

  byId(id: string): Product | undefined {
    return this._items().find((p) => p.id === id);
  }

  getById(id: string): Product | undefined {
    return this.byId(id);
  }

  readonly featured = computed(() => {
    const list = [...this._items()];
    list.sort((a, b) => {
      const scoreB = (b.reviewsCount ?? 0) + (b.rating ?? 0) * 100;
      const scoreA = (a.reviewsCount ?? 0) + (a.rating ?? 0) * 100;
      return scoreB - scoreA;
    });
    return list.slice(0, 8);
  });

  addProduct(draft: ProductDraft): Product {
    const created: Product = { ...draft, id: this.newId() };
    this._items.update((arr) => {
      const next = [created, ...arr];
      this.persist(next);
      return next;
    });
    return created;
  }

  updateProduct(id: string, draft: ProductDraft): Product | undefined {
    let updated: Product | undefined;

    this._items.update((arr) => {
      const next = arr.map((p) => {
        if (p.id !== id) return p;
        updated = { ...p, ...draft, id };
        return updated!;
      });
      this.persist(next);
      return next;
    });

    return updated;
  }

  deleteProduct(id: string): boolean {
    let removed = false;

    this._items.update((arr) => {
      const next = arr.filter((p) => {
        const keep = p.id !== id;
        if (!keep) removed = true;
        return keep;
      });
      this.persist(next);
      return next;
    });

    return removed;
  }

  // ---- storage ----

  private loadInitial(): Product[] {
    const fromLs = this.loadFromStorage();
    if (fromLs.length) return fromLs;

    this.persist(MOCK_PRODUCTS);
    return MOCK_PRODUCTS;
  }

  private loadFromStorage(): Product[] {
    const parsed = StorageUtil.get<unknown>(this.LS_KEY);
    if (!parsed || !Array.isArray(parsed)) return [];
    return (parsed as unknown[]).filter(this.isProductLike).map((p) => p as Product);
  }

  private persist(list: Product[]) {
    StorageUtil.set(this.LS_KEY, list);
  }

  private newId(): string {
    return 'p_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  private isProductLike = (p: unknown): p is Product => {
    if (!p || typeof p !== 'object') return false;
    const o = p as Record<string, unknown>;

    return (
      typeof o['id'] === 'string' &&
      typeof o['name'] === 'string' &&
      typeof o['brand'] === 'string' &&
      typeof o['category'] === 'string' &&
      typeof o['price'] === 'number' &&
      typeof o['stock'] === 'number' &&
      Array.isArray(o['images']) &&
      typeof o['shortDescription'] === 'string' &&
      typeof o['description'] === 'string'
    );
  };
}