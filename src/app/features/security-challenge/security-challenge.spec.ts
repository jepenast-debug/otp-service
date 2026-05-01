import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SecurityChallengeComp } from './security-challenge';

describe('SecurityChallengeComponent', () => {
  let component: SecurityChallengeComp;
  let fixture: ComponentFixture<SecurityChallengeComp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Importamos el componente Standalone y los módulos necesarios
      imports: [
        SecurityChallengeComp, 
        FormsModule, 
        TranslateModule.forRoot() // <-- Aquí sí lleva forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SecurityChallengeComp);
    component = fixture.componentInstance;
    
    // Si usas Signals o cambios asíncronos, detectamos los cambios iniciales
    fixture.detectChanges(); 
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});