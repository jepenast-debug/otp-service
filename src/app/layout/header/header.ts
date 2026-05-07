import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComp implements OnInit {

  private LangService = inject(LanguageService);
  CurrentLanguage = signal('ES');

  // Lista de idiomas disponibles
Languages = [
  { Code: 'es', Name: 'Español' },
  { Code: 'en', Name: 'English' }
];

ngOnInit() {
  this.CurrentLanguage.set(this.LangService.GetCurrentLanguage());
}

ChangeLanguage(Event: any): void {
    const NewLang = Event.target.value;
    this.CurrentLanguage.set(NewLang);
    this.LangService.SetLanguage(NewLang);
  }
}