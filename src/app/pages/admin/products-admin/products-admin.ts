import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProductsService } from '../../../shared/services/products';
import { ToastService } from '../../../shared/services/toast';
import { Product, ProductCategory } from '../../../shared/interfaces/product';

const CATEGORIES: ProductCategory[] = ['Accessories', 'Home', 'Tech', 'Fashion'];

@Component({
  selector: 'app-products-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './products-admin.html',
  styleUrl: './products-admin.scss',
})
export class ProductsAdmin {
  private readonly fb = inject(FormBuilder);
  private readonly products = inject(ProductsService);
  private readonly toast = inject(ToastService);

  readonly categories = CATEGORIES;
  readonly search = signal('');

  readonly editingId = signal<string | null>(null);
  readonly items = computed(() => this.products.items());

  readonly filteredItems = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.items();

    return this.items().filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    brand: ['', [Validators.required, Validators.minLength(2)]],
    category: ['Tech' as ProductCategory, [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    images: ['', [Validators.required]],
    shortDescription: ['', [Validators.required, Validators.minLength(10)]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    rating: [4.5],
    reviewsCount: [120],
  });

  startCreate() {
    this.editingId.set(null);
    this.form.reset({
      name: '',
      brand: '',
      category: 'Tech',
      price: 0,
      stock: 0,
      images: '',
      shortDescription: '',
      description: '',
      rating: 4.5,
      reviewsCount: 120,
    });
  }

  cancelEdit() {
    this.startCreate();
  }

  startEdit(p: Product) {
    this.editingId.set(p.id);
    this.form.setValue({
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: p.price,
      stock: p.stock,
      images: p.images.join(', '),
      shortDescription: p.shortDescription,
      description: p.description,
      rating: p.rating ?? 4.5,
      reviewsCount: p.reviewsCount ?? 0,
    });
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
      stock: Number(v.stock),
      images: v.images.split(',').map((s) => s.trim()).filter(Boolean),
      shortDescription: v.shortDescription.trim(),
      description: v.description.trim(),
      rating: Number(v.rating ?? 0),
      reviewsCount: Number(v.reviewsCount ?? 0),
    };

    const id = this.editingId();

    if (!id) {
      this.products.addProduct(draft);
      this.toast.success('Product created');
      this.startCreate();
      return;
    }

    const updated = this.products.updateProduct(id, draft);
    if (updated) {
      this.toast.success('Product updated');
      this.startCreate();
    } else {
      this.toast.error('Update failed');
    }
  }

  remove(id: string) {
    const ok = this.products.deleteProduct(id);
    if (ok) this.toast.success('Product deleted');
    else this.toast.error('Delete failed');
  }

  fieldError(name: keyof typeof this.form.controls) {
    const c = this.form.controls[name];
    return c.invalid && (c.dirty || c.touched);
  }
}