import { Injectable, signal, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private Translate = inject(TranslateService);
  
  CurrentLang = signal<string>('es');

  constructor() {
    // Intentar recuperar el idioma guardado previamente por el usuario
    const SavedLang = localStorage.getItem('AppLang') || 'es';
    this.SetLanguage(SavedLang);
  }

  SetLanguage(LangCode: string): void {
    this.Translate.use(LangCode);
    this.CurrentLang.set(LangCode);
    localStorage.setItem('AppLang', LangCode); // Persistencia entre recargas
  }

  ToggleLanguage(): void {
    const NewLang = this.CurrentLang() === 'es' ? 'en' : 'es';
    this.SetLanguage(NewLang);
  }
}