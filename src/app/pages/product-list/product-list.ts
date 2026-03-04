import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { ProductsService } from '../../shared/services/products';
import { ProductCard } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCard],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList {
  private readonly ps = inject(ProductsService);
  private readonly route = inject(ActivatedRoute);

  // query param q
  private readonly q$ = this.route.queryParamMap.pipe(map((m) => (m.get('q') ?? '').trim().toLowerCase()));
  readonly q = toSignal(this.q$, { initialValue: '' });

  // category filter
  readonly category = signal<string>('All');

  // products list
  readonly items = computed(() => {
    const q = this.q();
    const cat = this.category();
    return this.ps.items().filter((p) => {
      const inCat = cat === 'All' ? true : p.category === cat;
      const inQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q);
      return inCat && inQ;
    });
  });

  setCategory(cat: string) {
    this.category.set(cat);
  }
}