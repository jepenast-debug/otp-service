import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComp {
  // Signal para manejar el idioma seleccionado
  CurrentLanguage = signal('ES');

  // Lista de idiomas disponibles
Languages = [
    { Code: 'ES', Name: 'Español' },
    { Code: 'EN', Name: 'English' }
  ];

ChangeLanguage(Event: any): void {
    const NewLang = Event.target.value;
    this.CurrentLanguage.set(NewLang);
  }
}