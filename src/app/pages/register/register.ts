import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    dateOfBirth: [''],
    role: ['user'],
  });

  selectedFile: File | null = null;

  // ✅ IMPORTANT: your template calls onFile($event), so keep this name
  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  submit() {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const v = this.form.getRawValue();
    const roleToSend = v.email === 'patricia@nexora.com' ? 'admin' : (v.role ?? 'user');

    const fd = new FormData();
    fd.append('email', v.email!);
    fd.append('firstName', v.firstName!);
    fd.append('lastName', v.lastName!);
    fd.append('username', v.username!);
    fd.append('password', v.password!);

    if (v.dateOfBirth) fd.append('dateOfBirth', v.dateOfBirth);
    fd.append('role', roleToSend);

    // Swagger says the field name MUST be "file"
    if (this.selectedFile) fd.append('file', this.selectedFile);

    this.auth.register(fd).subscribe({
      next: () => {
        this.loading.set(false);
        // go admin if admin, else home
        if (this.auth.isAdmin()) this.router.navigate(['/admin']);
        else this.router.navigate(['/']);
      },
      error: () => {
        this.loading.set(false);
        this.error = 'Registration failed. Please check your inputs.';
      },
    });
  }
}