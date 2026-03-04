import { Injectable, effect, signal } from '@angular/core';

const THEME_KEY = 'nx_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<'light' | 'dark'>(this.load());

  constructor() {
    // Apply immediately + persist
    effect(() => {
      const m = this.mode();
      document.documentElement.classList.toggle('dark', m === 'dark');
      localStorage.setItem(THEME_KEY, m);
    });
  }

  toggle(): void {
    this.mode.set(this.mode() === 'dark' ? 'light' : 'dark');
  }

  private load(): 'light' | 'dark' {
    const v = localStorage.getItem(THEME_KEY);
    return v === 'dark' ? 'dark' : 'light';
  }
}