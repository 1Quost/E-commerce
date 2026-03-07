import { Injectable, computed, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AuthApi } from './auth-api';
import { ApiUser, LoginResponseV1, LoginResponseV2, NormalizedAuth } from './auth.models';
import { firstValueFrom } from 'rxjs';
import { CartService } from '../../shared/services/cart';

const ACCESS_COOKIE = 'nx_access_token';
const REFRESH_COOKIE = 'nx_refresh_token';
const ADMIN_EMAIL = 'patricia@nexora.com';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<ApiUser | null>(null);
  private _accessToken = signal<string | null>(null);

  private cart = inject(CartService);

  user = this._user.asReadonly();
  accessToken = this._accessToken.asReadonly();

  isLoggedInComputed = computed(() => !!this._accessToken());
  isAdminComputed = computed(() => {
    const user = this._user();
    return (user?.role ?? 'user') === 'admin' || user?.email === ADMIN_EMAIL;
  });

  constructor(
    private api: AuthApi,
    private router: Router,
    private cookies: CookieService
  ) {
    const token = this.cookies.get(ACCESS_COOKIE);
    if (token) this._accessToken.set(token);

    if (this._accessToken()) {
      this.api.getCurrentUser().pipe(
        tap((u) => {
          this._user.set(u);
          this.cart.restoreForUser(u?.email ?? null);
        }),
        catchError(() => of(null))
      ).subscribe();
    }
  }

  private normalizeAuthResponse(res: LoginResponseV2 | LoginResponseV1): NormalizedAuth {
    if ((res as LoginResponseV2).token) {
      const r = res as LoginResponseV2;
      return { accessToken: r.token, user: r.user };
    }

    const r = res as LoginResponseV1;
    return {
      accessToken: r.Login.AccessToken,
      refreshToken: r.Login.RefreshToken,
    };
  }

  private setSession(auth: NormalizedAuth) {
    this._accessToken.set(auth.accessToken);
    this.cookies.set(ACCESS_COOKIE, auth.accessToken, { path: '/' });

    if (auth.refreshToken) {
      this.cookies.set(REFRESH_COOKIE, auth.refreshToken, { path: '/' });
    }

    if (auth.user) {
      this._user.set(auth.user);
      this.cart.restoreForUser(auth.user.email);
    }
  }

  async updateProfile(fd: FormData) {
    const updatedUser = await firstValueFrom(this.api.updateUser(fd));
    this._user.set(updatedUser);

    try {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch { }

    this.cart.restoreForUser(updatedUser?.email ?? null);

    return updatedUser;
  }

  login(email: string, password: string) {
    return this.api.login({ email, password }).pipe(
      map((res) => this.normalizeAuthResponse(res)),
      switchMap((auth) => {
        this.setSession(auth);

        if (auth.user) return of(auth);

        return this.api.getCurrentUser().pipe(
          tap((u) => {
            this._user.set(u);
            this.cart.restoreForUser(u?.email ?? null);
          }),
          map((u) => ({ ...auth, user: u })),
          catchError(() => of(auth))
        );
      })
    );
  }

  register(form: FormData) {
    return this.api.register(form).pipe(
      map((res) => this.normalizeAuthResponse(res)),
      switchMap((auth) => {
        this.setSession(auth);

        if (auth.user) return of(auth);

        return this.api.getCurrentUser().pipe(
          tap((u) => {
            this._user.set(u);
            this.cart.restoreForUser(u?.email ?? null);
          }),
          map((u) => ({ ...auth, user: u })),
          catchError(() => of(auth))
        );
      })
    );
  }

  logout(redirectToLogin: boolean = true) {
    this._user.set(null);
    this._accessToken.set(null);
    this.cart.clearSession();

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    try {
      this.cookies?.delete('nx_access_token', '/');
      this.cookies?.delete('nx_refresh_token', '/');
    } catch { }

    if (redirectToLogin) this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.isLoggedInComputed();
  }

  isAdmin(): boolean {
    return this.isAdminComputed();
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  getToken(): string | null {
    return this._accessToken();
  }
}