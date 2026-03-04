import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth';

export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // not logged in -> login
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  // logged in but not admin -> home
  if (!auth.isAdmin()) {
    return router.createUrlTree(['/']);
  }

  return true;
};

export const adminChildGuard: CanActivateChildFn = (route, state) => adminGuard(route, state);