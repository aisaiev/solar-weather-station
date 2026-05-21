import { effect, inject, Injectable, DOCUMENT, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  readonly isDark = signal<boolean>(this.mediaQuery.matches);

  constructor() {
    this.applyTheme(this.mediaQuery.matches);

    this.mediaQuery.addEventListener('change', (e) => {
      this.isDark.set(e.matches);
    });

    effect(() => {
      this.applyTheme(this.isDark());
    });
  }

  private applyTheme(dark: boolean): void {
    const classList = this.document.documentElement.classList;
    if (dark) {
      classList.add('dark');
    } else {
      classList.remove('dark');
    }
  }
}
