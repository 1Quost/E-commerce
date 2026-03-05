import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { AuthApi } from './auth-api';
import { ApiUser, LoginResponseV1, LoginResponseV2, NormalizedAuth } from './auth.models';
import { firstValueFrom } from 'rxjs';

const ACCESS_COOKIE = 'nx_access_token';
const REFRESH_COOKIE = 'nx_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<ApiUser | null>(null);
  private _accessToken = signal<string | null>(null);

  user = this._user.asReadonly();
  accessToken = this._accessToken.asReadonly();

  isLoggedInComputed = computed(() => !!this._accessToken());
  // ✅ Admin by role (if backend returns it)
  isAdminComputed = computed(() => (this._user()?.role ?? 'user') === 'admin');

  constructor(
    private api: AuthApi,
    private router: Router,
    private cookies: CookieService
  ) {
    // Restore from cookies on app start
    const token = this.cookies.get(ACCESS_COOKIE);
    if (token) this._accessToken.set(token);

    // If we have a token, try loading current user (ngrok supports /user)
    if (this._accessToken()) {
      this.api.getCurrentUser().pipe(
        tap((u) => this._user.set(u)),
        catchError(() => of(null))
      ).subscribe();
    }
  }

  /** Normalize both backend responses into one internal shape */
  private normalizeAuthResponse(res: LoginResponseV2 | LoginResponseV1): NormalizedAuth {
    // NEW backend
    if ((res as LoginResponseV2).token) {
      const r = res as LoginResponseV2;
      return { accessToken: r.token, user: r.user };
    }

    // OLD backend
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
    }
  }

  async updateProfile(fd: FormData) {
    // PATCH /user (Swagger: Update the current user)
    const updatedUser = await firstValueFrom(this.api.updateUser(fd));

    // keep user state updated (adjust if your state variable name differs)
    this._user.set(updatedUser);

    // optional: keep localStorage in sync if you use it
    try {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch { }

    return updatedUser;
  }

  login(email: string, password: string) {
    return this.api.login({ email, password }).pipe(
      map((res) => this.normalizeAuthResponse(res)),
      switchMap((auth) => {
        // If backend didn’t return user (old backend), try fetching /user (if exists)
        this.setSession(auth);

        if (auth.user) return of(auth);

        return this.api.getCurrentUser().pipe(
          tap((u) => this._user.set(u)),
          map((u) => ({ ...auth, user: u })),
          catchError(() => of(auth)) // old backend might not have /user
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
          tap((u) => this._user.set(u)),
          map((u) => ({ ...auth, user: u })),
          catchError(() => of(auth))
        );
      })
    );
  }

  logout(redirectToLogin: boolean = true) {
    // clear user/token however you store them
    this._user.set(null);
    this._accessToken.set(null);

    // if you store in localStorage:
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // if you store in cookies (keep if you use cookies):
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