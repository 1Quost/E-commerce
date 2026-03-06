import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { ProductsService } from '../../shared/services/products';
import { ProductCard } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCard],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss'], // ✅ FIXED (was styleUrl)
})
export class ProductList {
  private readonly route = inject(ActivatedRoute);
  private readonly productsService = inject(ProductsService);

  readonly q = signal('');
  readonly category = signal<string>('All');

  // normalize helper
  private normalize(v: unknown): string {
    return String(v ?? '').trim().toLowerCase();
  }

  readonly products = computed(() => this.productsService.items());

  readonly categories = computed(() => {
    const set = new Set<string>();

    for (const p of this.products()) {
      const cat = String((p as any).category ?? '').trim();
      if (cat) set.add(cat);
    }

    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  });

  readonly filtered = computed(() => {
    const q = this.normalize(this.q());
    const selected = this.normalize(this.category());

    return this.products().filter((p: any) => {
      const name = this.normalize(p.name);
      const brand = this.normalize(p.brand);
      const cat = this.normalize(p.category);

      const matchesQ =
        !q ||
        name.includes(q) ||
        brand.includes(q) ||
        cat.includes(q);

      const matchesC =
        selected === 'all' ||
        cat === selected;

      return matchesQ && matchesC;
    });
  });

  // safer click handler
  onCategoryClick(c: string) {
    console.log('CATEGORY CLICKED:', c);
    this.category.set(c);
  }

  constructor() {
    // initial query param
    effect(() => {
      const qp = this.route.snapshot.queryParamMap.get('q') ?? '';
      this.q.set(qp);
    });

    // live updates
    this.route.queryParamMap.subscribe((m) => {
      this.q.set(m.get('q') ?? '');
    });
  }
}