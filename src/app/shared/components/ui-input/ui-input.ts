import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-ui-input',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './ui-input.html',
  styleUrls: ['./ui-input.scss'],
})
export class UiInput {
  @Input({ required: true }) control!: AbstractControl | null;

  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'password' | 'date' | 'number' = 'text';
  @Input() hint = '';
  @Input() autocomplete = 'on';

  get fc(): FormControl | null {
    const c = this.control;
    return c instanceof FormControl ? c : null;
  }

  get showError(): boolean {
    const c = this.control;
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  get firstError(): string {
    const e = this.control?.errors;
    if (!e) return '';
    if (e['required']) return 'This field is required.';
    if (e['email']) return 'Please enter a valid email.';
    if (e['minlength']) return `Minimum length is ${e['minlength'].requiredLength}.`;
    if (e['maxlength']) return `Maximum length is ${e['maxlength'].requiredLength}.`;
    if (e['pattern']) return 'Invalid format.';
    return 'Invalid value.';
  }
}