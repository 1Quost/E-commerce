import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProductsService } from '../../../shared/services/products';
import { Product, ProductBadge, ProductCategory } from '../../../shared/interfaces/product';
import { ToastService } from '../../../shared/services/toast';

type Mode = 'create' | 'edit';

@Component({
  selector: 'app-products-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './products-admin.html',
  styleUrl: './products-admin.scss',
})
export class ProductsAdmin {
  private readonly fb = inject(FormBuilder);
  public products = inject(ProductsService);
  private readonly toast = inject(ToastService);

  readonly items = computed(() => this.products.items());

  readonly modalOpen = signal(false);
  readonly mode = signal<Mode>('create');
  readonly editingId = signal<string | null>(null);

  readonly categories: ProductCategory[] = ['Accessories', 'Home', 'Tech', 'Fashion'];
  readonly badges: ProductBadge[] = ['New', 'Best Seller', 'Limited', 'Eco'];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    brand: ['', [Validators.required, Validators.minLength(2)]],
    category: ['Tech' as ProductCategory, [Validators.required]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    oldPrice: [0],
    rating: [4.5],
    reviewsCount: [120],
    stock: [10, [Validators.required, Validators.min(0)]],
    badge: ['New' as ProductBadge],
    image: ['', [Validators.required]],
    shortDescription: ['', [Validators.required, Validators.minLength(8)]],
    description: ['', [Validators.required, Validators.minLength(12)]],
    status: ['In Stock'],
  });

  openCreate() {
    this.mode.set('create');
    this.editingId.set(null);
    this.form.reset({
      name: '',
      brand: '',
      category: 'Tech',
      price: 0,
      oldPrice: 0,
      rating: 4.6,
      reviewsCount: 80,
      stock: 10,
      badge: 'New',
      image: '',
      shortDescription: '',
      description: '',
      status: 'In Stock',
    });
    this.modalOpen.set(true);
  }

  openEdit(p: Product) {
    this.mode.set('edit');
    this.editingId.set(p.id);

    this.form.reset({
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: p.price,
      oldPrice: p.oldPrice ?? 0,
      rating: p.rating ?? 4.5,
      reviewsCount: p.reviewsCount ?? 0,
      stock: p.stock,
      badge: (p.badge ?? 'New') as ProductBadge,
      image: p.images?.[0] ?? '',
      shortDescription: p.shortDescription,
      description: p.description,
      status: p.status ?? 'In Stock',
    });

    this.modalOpen.set(true);
  }

  close() {
    this.modalOpen.set(false);
  }

  save() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();

    const draft = {
      name: v.name.trim(),
      brand: v.brand.trim(),
      category: v.category,
      price: Number(v.price),
      oldPrice: v.oldPrice ? Number(v.oldPrice) : undefined,
      rating: Number(v.rating),
      reviewsCount: Number(v.reviewsCount),
      stock: Number(v.stock),
      badge: v.badge,
      images: [v.image.trim()],
      shortDescription: v.shortDescription.trim(),
      description: v.description.trim(),
      specs: [],
      features: [],
      status: v.stock <= 0 ? 'Out of Stock' : v.stock < 15 ? 'Low Stock' : 'In Stock',
      colorOptions: ['Black', 'Stone', 'Indigo'],
    };

    if (this.mode() === 'create') {
      const created = this.products.addProduct(draft);
      this.toast.success('Product created', created.name);
      this.close();
      return;
    }

    const id = this.editingId();
    if (!id) return;

    const updated = this.products.updateProduct(id, draft);
    if (updated) this.toast.success('Product updated', updated.name);
    this.close();
  }

  remove(id: string) {
    const ok = this.products.deleteProduct(id);
    if (ok) this.toast.success('Product deleted');
  }

  err(name: keyof typeof this.form.controls): string {
    const c = this.form.controls[name];
    if (!c.touched || !c.errors) return '';
    if (c.errors['required']) return 'Required';
    if (c.errors['minlength']) return `Min ${c.errors['minlength'].requiredLength} chars`;
    if (c.errors['min']) return `Min value is ${c.errors['min'].min}`;
    return 'Invalid';
  }
}