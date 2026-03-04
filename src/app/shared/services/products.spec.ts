import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductCard } from '../components/product-card/product-card';
import { CartService } from '../services/cart';
import { ToastService } from '../services/toast';
import { AuthService } from '../../core/auth/auth';

describe('ProductCard', () => {
  let fixture: ComponentFixture<ProductCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCard],
      providers: [CartService, ToastService, AuthService],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCard);
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});