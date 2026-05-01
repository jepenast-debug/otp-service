import { Component, inject } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [UpperCasePipe],
  template: `
    <button class="LangButton" (click)="Toggle()">
      <span class="Icon">🌐</span>
      {{ LangService.CurrentLang() | uppercase }}
    </button>
  `,
  styles: [`
    .LangButton {
      background: transparent;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 0.4rem 0.8rem;
      font-weight: 600;
      color: #1e293b;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }
    .LangButton:hover { background-color: #f8fafc; border-color: #94a3b8; }
  `]
})
export class LanguageSelectorComponent {
  public LangService = inject(LanguageService);

  Toggle(): void {
    this.LangService.ToggleLanguage();
  }
}