import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../enviroments/enviroment';
import { User } from '../../shared/interfaces/user';

export type AuthResponse = { token: string; user: User };
export type CheckResponse = { valid: boolean };

export type LoginPayload = {
  email: string;
  password: string;
};

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);

  /**
   * Your swagger shows server base path "/api".
   * In Angular env, set `apiUrl` to '/api' (proxy) or 'http://localhost:XXXX/api'
   */
  private readonly base = environment.apiUrl ?? '/api';

  async register(formData: FormData): Promise<AuthResponse> {
    // multipart/form-data, browser sets boundary automatically
    return await firstValueFrom(
      this.http.post<AuthResponse>(`${this.base}/auth/register`, formData)
    ).catch(this.handle);
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    return await firstValueFrom(
      this.http.post<AuthResponse>(`${this.base}/auth/login`, payload, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      })
    ).catch(this.handle);
  }

  async check(): Promise<CheckResponse> {
    return await firstValueFrom(
      this.http.post<CheckResponse>(`${this.base}/auth/check`, {})
    ).catch(this.handle);
  }

  async getMe(): Promise<User> {
    return await firstValueFrom(this.http.get<User>(`${this.base}/user`)).catch(this.handle);
  }

  async updateMe(formData: FormData): Promise<User> {
    // swagger: PATCH /user multipart/form-data
    return await firstValueFrom(this.http.patch<User>(`${this.base}/user`, formData)).catch(
      this.handle
    );
  }

  async deleteMe(): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.base}/user`)).catch(this.handle);
  }

  private handle(err: unknown): never {
    const e = err as HttpErrorResponse;

    // swagger error shape:
    // { message: string, errors: string[], error: string }
    const body: any = e?.error ?? {};
    const message =
      body?.message ||
      (typeof body === 'string' ? body : '') ||
      e?.message ||
      'Request failed';

    const errors: string[] = Array.isArray(body?.errors) ? body.errors : [];
    const details = errors.length ? ` (${errors.join(', ')})` : '';

    throw new Error(`${message}${details}`);
  }
}