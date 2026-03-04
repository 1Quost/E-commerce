import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth';
import { ToastService } from '../../shared/services/toast';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  error = '';
  loading = false;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async submit() {
    this.error = '';
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading) return;

    const { email, password } = this.form.getRawValue();
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    try {
      this.loading = true;

      // ✅ you already fixed this signature - keep it
      await this.auth.login(email.trim(), password);

      // ✅ redirect rules
      if (this.auth.isAdmin()) {
        await this.router.navigate(['/admin']);
      } else if (returnUrl) {
        await this.router.navigateByUrl(returnUrl);
      } else {
        await this.router.navigate(['/']);
      }

      this.toast.success('Welcome back');
    } catch (e: any) {
      this.error = e?.message ?? 'Login failed';
      this.toast.error('Login failed', this.error);
    } finally {
      this.loading = false;
    }
  }
}