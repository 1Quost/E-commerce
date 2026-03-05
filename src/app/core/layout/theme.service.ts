import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const THEME_KEY = 'nx_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private readonly platformId = inject(PLATFORM_ID);
    private readonly isBrowser = isPlatformBrowser(this.platformId);

    readonly mode = signal<'light' | 'dark'>(this.load());

    constructor() {
        if (!this.isBrowser) return;

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
        if (!this.isBrowser) return 'light';
        const v = localStorage.getItem(THEME_KEY);
        return v === 'dark' ? 'dark' : 'light';
    }
}