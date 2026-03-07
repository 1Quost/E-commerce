import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductsService } from '../../../shared/services/products';
import { CartService } from '../../../shared/services/cart';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  readonly totalProducts = computed(() => this.products.items().length);

  readonly totalStock = computed(() =>
    this.products.items().reduce((s, p) => s + (p.stock ?? 0), 0)
  );

  readonly lowStockCount = computed(() =>
    this.products.items().filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 10).length
  );

  readonly totalInventoryValue = computed(() =>
    this.products.items().reduce((sum, p) => sum + p.price * (p.stock ?? 0), 0)
  );

  readonly cartCount = computed(() => this.cart.count());

  readonly recentProducts = computed(() => this.products.items().slice(0, 5));

  readonly lowStockProducts = computed(() =>
    this.products.items().filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 10).slice(0, 5)
  );

  constructor(public products: ProductsService, public cart: CartService) {}
}