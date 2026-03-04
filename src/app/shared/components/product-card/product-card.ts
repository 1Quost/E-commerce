import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';

import { Product } from '../../interfaces/product';
import { CartService } from '../../services/cart';
import { ToastService } from '../../services/toast';
import { AuthService } from '../../../core/auth/auth';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  product = input.required<Product>();

  constructor(
    public cart: CartService,
    public toast: ToastService,
    public auth: AuthService
  ) {}

  quickAdd(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const p = this.product();
    if (!this.auth.isAuthenticated()) {
      this.toast.info('Login required', 'Please login to add items.');
      return;
    }

    this.cart.add(p, 1);
    this.toast.success('Added to cart', p.name);
  }
}