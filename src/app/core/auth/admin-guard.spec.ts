import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { adminGuard } from './admin-guard';
import { AuthService } from './auth';

describe('adminGuard', () => {
  let authMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authMock = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated', 'isAdmin']);
    routerMock = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('redirects guest users to login', () => {
    const tree = {} as UrlTree;

    authMock.isAuthenticated.and.returnValue(false);
    routerMock.createUrlTree.and.returnValue(tree);

    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as any, { url: '/admin' } as any)
    );

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/admin' },
    });
    expect(result).toBe(tree);
  });

  it('redirects non-admin users to home', () => {
    const tree = {} as UrlTree;

    authMock.isAuthenticated.and.returnValue(true);
    authMock.isAdmin.and.returnValue(false);
    routerMock.createUrlTree.and.returnValue(tree);

    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as any, { url: '/admin' } as any)
    );

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toBe(tree);
  });

  it('allows admin users', () => {
    authMock.isAuthenticated.and.returnValue(true);
    authMock.isAdmin.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      adminGuard({} as any, { url: '/admin' } as any)
    );

    expect(result).toBe(true);
  });
});