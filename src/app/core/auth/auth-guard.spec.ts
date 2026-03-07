import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth-guard';
import { AuthService } from './auth';

describe('authGuard', () => {
  let authMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authMock = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated']);
    routerMock = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('allows authenticated users', () => {
    authMock.isAuthenticated.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url: '/checkout' } as any)
    );

    expect(result).toBe(true);
  });

  it('redirects guests to login', () => {
    const tree = {} as UrlTree;

    authMock.isAuthenticated.and.returnValue(false);
    routerMock.createUrlTree.and.returnValue(tree);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url: '/checkout' } as any)
    );

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/checkout' },
    });
    expect(result).toBe(tree);
  });
});