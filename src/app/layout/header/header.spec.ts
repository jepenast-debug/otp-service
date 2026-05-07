import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HeaderComp } from './header';
import { LanguageService } from '../../core/services/language.service';
import { TranslateModule } from '@ngx-translate/core';

describe('HeaderComp (Cabecera y Selector de Idioma)', () => {
  let component: HeaderComp;
  let fixture: ComponentFixture<HeaderComp>;

  // Mock manual del LanguageService
  const mockLanguageService = {
    currentLang: 'es',
    languageSet: null as any,
    GetCurrentLanguage: function() { return this.currentLang; },
    SetLanguage: function(lang: string) { 
      this.languageSet = lang; 
      this.currentLang = lang; 
    }
  };

  beforeEach(async () => {
    // Reiniciamos el estado del mock antes de cada prueba
    mockLanguageService.currentLang = 'es';
    mockLanguageService.languageSet = null;

    await TestBed.configureTestingModule({
      imports: [
        HeaderComp,
        TranslateModule.forRoot() // Requerido para evitar el error NG0201
      ],
      providers: [
        { provide: LanguageService, useValue: mockLanguageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComp);
    component = fixture.componentInstance;
    
    // Dispara el ngOnInit()
    fixture.detectChanges(); 
  });

  it('debería arrancar y leer el idioma actual desde el servicio', () => {
    // Verificamos que el signal CurrentLanguage tomó el valor por defecto ('es')
    expect(component.CurrentLanguage()).toBe('es');
  });

  it('debería cambiar el idioma en la UI y avisarle al LanguageService', () => {
    // Simulamos que el usuario seleccionó "English" en el dropdown
    const mockEvent = { target: { value: 'en' } };
    
    component.ChangeLanguage(mockEvent);

    // 1. Verificamos que el estado visual del componente cambió
    expect(component.CurrentLanguage()).toBe('en');
    
    // 2. Verificamos que el servicio recibió la orden para guardar en localStorage y traducir
    expect(mockLanguageService.languageSet).toBe('en');
  });
});