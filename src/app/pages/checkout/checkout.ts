import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CartService } from '../../shared/services/cart';
import { ToastService } from '../../shared/services/toast';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  public cart = inject(CartService);

  readonly items = computed(() => this.cart.items());
  readonly subtotal = computed(() => this.cart.subtotal());
  readonly shipping = computed(() => this.cart.shipping());
  readonly tax = computed(() => this.cart.tax());
  readonly total = computed(() => this.cart.total());

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    address: ['', [Validators.required, Validators.minLength(6)]],
    city: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    if (this.items().length === 0) {
      this.toast.warning('Cart is empty');
      this.router.navigate(['/products']);
      return;
    }

    this.cart.clear();
    this.toast.success('Order placed', 'Thank you for your purchase');
    this.router.navigate(['/order-success']);
  }

  e(name: keyof typeof this.form.controls) {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }
}