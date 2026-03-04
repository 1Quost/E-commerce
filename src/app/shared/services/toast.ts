import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  createdAt: number;
  durationMs: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<ToastItem[]>([]);

  show(input: Omit<ToastItem, 'id' | 'createdAt'>): void {
    const id = crypto?.randomUUID?.() ?? Math.random().toString(16).slice(2);
    const toast: ToastItem = { id, createdAt: Date.now(), ...input };
    this.toasts.update((arr) => [toast, ...arr]);

    if (typeof window !== 'undefined') {
      window.setTimeout(() => this.dismiss(id), toast.durationMs);
    }
  }

  success(title: string, message?: string, durationMs = 2400): void {
    this.show({ type: 'success', title, message, durationMs });
  }

  info(title: string, message?: string, durationMs = 2400): void {
    this.show({ type: 'info', title, message, durationMs });
  }

  warning(title: string, message?: string, durationMs = 2600): void {
    this.show({ type: 'warning', title, message, durationMs });
  }

  error(title: string, message?: string, durationMs = 3000): void {
    this.show({ type: 'error', title, message, durationMs });
  }

  dismiss(id: string): void {
    this.toasts.update((arr) => arr.filter((t) => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }
}