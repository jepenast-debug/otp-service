import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [FormsModule],
  templateUrl:'./languaje-selector.html',
  styleUrl:'./languaje-selector.scss'
})

export class LanguageSelectorComp {
  LangService = inject(LanguageService);

  OnChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.LangService.SetLanguage(select.value);
  }
}