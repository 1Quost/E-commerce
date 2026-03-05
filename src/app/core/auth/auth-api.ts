import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';
import { ApiUser, LoginResponseV1, LoginResponseV2 } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl; // should already include /api for ngrok backend

  login(payload: { email: string; password: string }): Observable<LoginResponseV2 | LoginResponseV1> {
    // ngrok backend expects JSON body
    return this.http.post<LoginResponseV2 | LoginResponseV1>(`${this.base}/auth/login`, payload);
  }

  register(form: FormData): Observable<LoginResponseV2 | LoginResponseV1> {
    // both swagger versions often accept multipart on register (and your swagger says multipart)
    return this.http.post<LoginResponseV2 | LoginResponseV1>(`${this.base}/auth/register`, form);
  }

  updateUser(fd: FormData) {
    return this.http.patch<any>(`${this.base}/user`, fd);
  }

  /** ngrok backend provides this endpoint */
  getCurrentUser(): Observable<ApiUser> {
    return this.http.get<ApiUser>(`${this.base}/user`);
  }

  /** old local backend sometimes has /auth/check */
  checkToken(): Observable<{ valid: boolean }> {
    return this.http.post<{ valid: boolean }>(`${this.base}/auth/check`, {});
  }
}