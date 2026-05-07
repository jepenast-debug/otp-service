import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translate = inject(TranslateService);

  InitLanguage(): void {
    const savedLang = localStorage.getItem('AppLang') || 'es';
    this.translate.setDefaultLang('es');
    this.translate.use(savedLang);
  }

  SetLanguage(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem('AppLang', lang);
  }

  GetCurrentLanguage(): string {
    return this.translate.currentLang || this.translate.defaultLang || 'es';
  }
}