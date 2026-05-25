import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TokenValidationComp } from './token-validation';
import { AuthService } from '../../core/services/auth.service';
import { HandleSession } from '../../core/Handle/HandleSession';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { AuthStep } from '../../core/models/Enums';

describe('TokenValidationComp (Pantalla de Código OTP)', () => {
  let component: TokenValidationComp;
  let fixture: ComponentFixture<TokenValidationComp>;

  // 1. Mock del backend adaptado a tu AuthService real
  let authServiceResponse = of({ code: 200, data: { AccessToken: 'mock-token', UrlReturn: '/dashboard' } });
  
  const mockAuthService = {
    ValidateOtp: function() { return authServiceResponse; } 
  };

  const mockHandleSession = {
    stepSet: null as any,
    stepMoved: null as any,
    SetStep: function(step: any) { this.stepSet = step; },
    MoveStep: function(step: any) { this.stepMoved = step; },
    GetSid: function() { return 'user-123'; },
    SetRespItem: function() {},
    SetUrl: function() {},
    CreateCookie: function() {}
  };

  beforeEach(async () => {
    mockHandleSession.stepSet = null;
    mockHandleSession.stepMoved = null;
    authServiceResponse = of({ code: 200, data: { AccessToken: 'mock-token', UrlReturn: '/dashboard' } });

    await TestBed.configureTestingModule({
      imports: [
        TokenValidationComp,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: HandleSession, useValue: mockHandleSession }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TokenValidationComp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería inicializarse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería procesar correctamente un token válido y avanzar al éxito', () => {
    // Seteamos los 6 dígitos del OTP en la señal CodeDigits
    component.CodeDigits.set(['1', '2', '3', '4', '5', '6']);
    component.ValidateToken();

    // Verificamos que el guardia de sesión recibió la instrucción de redirección
    expect(mockHandleSession.stepMoved).toBe(AuthStep.AccessGranted);
  });

  it('debería manejar errores de código incorrecto del backend', () => {
    // Simulamos respuesta de error
    authServiceResponse = of({ code: 400, msg: 'Código incorrecto', data: null as any });
    
    component.CodeDigits.set(['9', '9', '9', '9', '9', '9']);
    component.ValidateToken();

    expect(component.IsLoading()).toBe(false);
    expect(component.ErrorMessage()).toBe('Código incorrecto.');
  });
});