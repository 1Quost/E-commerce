import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ProductsService } from '../../shared/services/products';
import { CartService } from '../../shared/services/cart';
import { ToastService } from '../../shared/services/toast';
import { AuthService } from '../../core/auth/auth';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);

  readonly id = computed(() => this.route.snapshot.paramMap.get('id') ?? '');
  readonly product = computed(() => this.products.byId(this.id()));

  readonly qtyInCart = computed(() => {
    const p = this.product();
    if (!p) return 0;
    const item = this.cart.items().find((i) => i.product.id === p.id);
    return item?.qty ?? 0;
  });

  constructor(
    public products: ProductsService,
    public cart: CartService,
    public toast: ToastService,
    public auth: AuthService
  ) { }

  addOne() {
    const p = this.product();
    if (!p) return;

    if (!this.auth.isAuthenticated()) {
      this.toast.warning('Login required', 'Please login to add items to cart');
      return;
    }

    this.cart.add(p, 1);
    this.toast.success('Added to cart', p.name);
  }
}