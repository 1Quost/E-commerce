import { Component, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../core/auth/auth';
import { ToastService } from '../../shared/services/toast';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  file: File | null = null;

  readonly user = computed(() => this.auth.user());
  error = '';

  readonly form;

  constructor(private fb: FormBuilder, public auth: AuthService, private toast: ToastService) {
    this.form = this.fb.group({
      firstName: ['', [Validators.minLength(2)]],
      lastName: ['', [Validators.minLength(2)]],
      username: ['', [Validators.minLength(3)]],
      dateOfBirth: [''],
      password: [''],
    });

    effect(() => {
      const u = this.auth.user();
      if (!u) return;

      this.form.patchValue({
        firstName: u.firstName ?? '',
        lastName: u.lastName ?? '',
        username: u.username ?? '',
        dateOfBirth: u.dateOfBirth ?? '',
      });
    });
  }

  onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.file = input.files?.[0] ?? null;
  }

  async save() {
    this.error = '';
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();

    const fd = new FormData();
    if (v.firstName) fd.append('firstName', v.firstName);
    if (v.lastName) fd.append('lastName', v.lastName);
    if (v.username) fd.append('username', v.username);
    if (v.dateOfBirth) fd.append('dateOfBirth', v.dateOfBirth);
    if (v.password) fd.append('password', v.password);
    if (this.file) fd.append('file', this.file);

    try {
      await this.auth.updateProfile(fd);
      this.toast.success('Profile updated');
    } catch (e: any) {
      this.error = e?.message ?? 'Update failed';
      this.toast.error('Update failed', this.error);
    }
  }
}