import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthApi } from './auth-api';
import { User } from '../../shared/interfaces/user';

const TOKEN_KEY = 'nx_token';
const USER_KEY = 'nx_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);

  // state
  readonly token = signal<string | null>(this.loadToken());
  readonly user = signal<User | null>(this.loadUser());

  readonly isAuthenticated = computed(() => !!this.token());
  readonly isAdmin = computed(() => (this.user()?.role ?? 'user') === 'admin');

  constructor() {
    // persist whenever token/user changes
    effect(() => {
      const t = this.token();
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
    });

    effect(() => {
      const u = this.user();
      if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
      else localStorage.removeItem(USER_KEY);
    });
  }

  /**
   * Login (swagger: POST /auth/login)
   * Returns token + user.
   */
  async login(email: string, password: string): Promise<User> {
    const res = await this.api.login({ email, password });
    this.setSession(res.token, res.user);
    return res.user;
  }

  /**
   * Register (swagger: POST /auth/register multipart/form-data)
   * Returns token + user.
   */
  async register(formData: FormData): Promise<User> {
    const res = await this.api.register(formData);
    this.setSession(res.token, res.user);
    return res.user;
  }

  /**
   * Validate current token (swagger: POST /auth/check)
   * Useful at app start or guard.
   */
  async checkToken(): Promise<boolean> {
    if (!this.token()) return false;
    try {
      const res = await this.api.check();
      return !!res.valid;
    } catch {
      // token invalid => clear
      this.logout(false);
      return false;
    }
  }

  /**
   * Fetch current user from API (GET /user).
   * Useful after refresh if you want to ensure freshest user data.
   */
  async refreshMe(): Promise<User> {
    const me = await this.api.getMe();
    this.user.set(me);
    return me;
  }

  /**
   * ✅ FIXES your earlier error: updateProfile does not exist
   * swagger: PATCH /user multipart/form-data
   */
  async updateProfile(formData: FormData): Promise<User> {
    const updated = await this.api.updateMe(formData);
    this.user.set(updated);
    return updated;
  }

  async deleteAccount(): Promise<void> {
    await this.api.deleteMe();
    this.logout();
  }

  logout(navigate = true) {
    this.token.set(null);
    this.user.set(null);

    if (navigate) {
      this.router.navigate(['/login']);
    }
  }

  private setSession(token: string, user: User) {
    this.token.set(token);
    this.user.set(user);
  }

  private loadToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}