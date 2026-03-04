import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { QuantityStepper } from '../../shared/components/quantity-stepper/quantity-stepper';
import { CartService } from '../../shared/services/cart';
import { AuthService } from '../../core/auth/auth';
import { ToastService } from '../../shared/services/toast';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, QuantityStepper],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  readonly items = computed(() => this.cart.items());
  readonly subtotal = computed(() => this.cart.subtotal());
  readonly shipping = computed(() => this.cart.shipping());
  readonly tax = computed(() => this.cart.tax());
  readonly total = computed(() => this.cart.total());

  constructor(public cart: CartService, public auth: AuthService, public toast: ToastService) {}
}