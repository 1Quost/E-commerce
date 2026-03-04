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
  readonly featuredCount = computed(() => this.products.items().filter(p => p.features).length);
  readonly cartCount = computed(() => this.cart.count());

  constructor(public products: ProductsService, public cart: CartService) {}
}