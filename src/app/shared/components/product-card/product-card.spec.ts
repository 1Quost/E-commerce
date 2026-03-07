import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ProductCard } from './product-card';
import { CartService } from '../../services/cart';
import { ToastService } from '../../services/toast';
import { AuthService } from '../../../core/auth/auth';
import { Product } from '../../interfaces/product';

describe('ProductCard', () => {
  let fixture: ComponentFixture<ProductCard>;

  const mockCart = {
    items: signal([]),
    add: jasmine.createSpy('add'),
    setQty: jasmine.createSpy('setQty'),
    remove: jasmine.createSpy('remove'),
  };

  const mockToast = {
    success: jasmine.createSpy('success'),
    info: jasmine.createSpy('info'),
  };

  const mockAuth = {
    isAuthenticated: () => true,
  };

  const product: Product = {
    id: 'p1',
    name: 'Test Product',
    brand: 'Test Brand',
    category: 'Tech',
    price: 99,
    stock: 5,
    images: ['https://picsum.photos/200'],
    shortDescription: 'Short description',
    description: 'Long product description',
    status: 'In Stock',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCard],
      providers: [
        { provide: CartService, useValue: mockCart },
        { provide: ToastService, useValue: mockToast },
        { provide: AuthService, useValue: mockAuth },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();
  });

  it('adds product to cart when quick add is clicked', () => {
    const button: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('.nx-qty__btn--add');

    expect(button).toBeTruthy();

    button!.click();

    expect(mockCart.add).toHaveBeenCalledWith(product, 1);
    expect(mockToast.success).toHaveBeenCalled();
  });
});