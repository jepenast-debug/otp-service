import { TestBed, ComponentFixture } from '@angular/core/testing';
import { UserIdentificationComp } from './user-identification';
import { AuthService } from '../../core/services/auth.service';
import { HandleSession } from '../../core/Handle/HandleSession';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { AuthStep } from '../../core/models/Enums';

describe('UserIdentificationComp (Pantalla de Login)', () => {
  let component: UserIdentificationComp;
  let fixture: ComponentFixture<UserIdentificationComp>;

  // 1. Configuramos las respuestas simuladas del Backend
  let authServiceResponse = of({ code: 200, data: { SId: 'sid-seguro-123' } });
  
  const mockAuthService = {
    IdentifyUser: function() { return authServiceResponse; }
  };

  // 2. Rastreadores manuales para el guardián de sesión
  const mockHandleSession = {
    stepSet: null as any,
    sidSet: null as any,
    stepMoved: null as any,
    SetStep: function(step: any) { this.stepSet = step; },
    SetSId: function(sid: any) { this.sidSet = sid; },
    MoveStep: function(step: any) { this.stepMoved = step; }
  };

  beforeEach(async () => {
    // Limpiamos los rastreadores antes de cada test
    mockHandleSession.stepSet = null;
    mockHandleSession.sidSet = null;
    mockHandleSession.stepMoved = null;
    authServiceResponse = of({ code: 200, data: { SId: 'sid-seguro-123' } });

    await TestBed.configureTestingModule({
      imports: [
        UserIdentificationComp,
        TranslateModule.forRoot() // ¡CRÍTICO! Esto evita el error NG0201
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: HandleSession, useValue: mockHandleSession }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserIdentificationComp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería inicializarse en el paso 1 (Identificación)', () => {
    expect(mockHandleSession.stepSet).toBe(AuthStep.Ident);
  });

  it('debería rechazar un input vacío', () => {
    component.UserId.set('   '); // Simulamos espacios en blanco
    component.ValidateIdentity();

    expect(component.ErrorMessage()).toBe('El campo es obligatorio.');
    expect(mockHandleSession.sidSet).toBeNull();
  });

  it('debería rechazar formatos que no sean email o ID numérico (Prevención básica)', () => {
    component.UserId.set('usuario-malicioso<script>');
    component.ValidateIdentity();

    expect(component.ErrorMessage()).toBe('Ingrese un correo corporativo o un ID numérico válido.');
  });

  it('debería aceptar un email válido, guardar el SID y avanzar al Reto de Seguridad', () => {
    component.UserId.set('usuario@teleperformance.com');
    component.ValidateIdentity();

    // Verificamos que el loading se activó y luego se procesó la respuesta
    expect(component.ErrorMessage()).toBe('');
    expect(mockHandleSession.sidSet).toBe('sid-seguro-123');
    expect(mockHandleSession.stepMoved).toBe(AuthStep.SecChallenge);
  });

  it('debería mostrar error si el usuario no existe (Simulación de fallo del backend)', () => {
    // Alteramos el mock para que simule un error HTTP 404
    authServiceResponse = throwError(() => new Error('Not Found'));
    
    component.UserId.set('123456789');
    component.ValidateIdentity();

    expect(component.IsLoading()).toBe(false);
    expect(component.ErrorMessage()).toBe('Usuario no encontrado o inactivo en el sistema.');
  });
});