import { TestBed } from '@angular/core/testing';
import { CartService } from './cart';
import { Product } from '../interfaces/product';

describe('CartService', () => {
  let service: CartService;

  const p: Product = {
    id: 'p1',
    name: 'Test',
    brand: 'Brand',
    category: 'Tech',
    price: 10,
    stock: 5,
    images: ['x'],
    shortDescription: 's',
    description: 'd',
    status: 'In Stock',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
    service.clear();
  });

  it('adds items and computes subtotal', () => {
    service.add(p, 2);
    expect(service.count()).toBe(2);
    expect(service.subtotal()).toBe(20);
  });
});