import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HandleSession } from './HandleSession';
import { SessionService } from '../services/session.service';
import { AuthStep } from '../models/Enums';

describe('HandleSession (Guardián Lógico)', () => {
  let service: HandleSession;

  const mockRouter = {
    navigatedTo: null as any,
    navigate: function(commands: any[]) { this.navigatedTo = commands; }
  };

  const mockSessionService = {
    sid: 'token-temporal-123' as string | null,
    Step: AuthStep.Ident,
    clearCalled: false,
    stepSetTo: null as any,
    
    Clear: function() { this.clearCalled = true; },
    SetStep: function(step: any) { this.stepSetTo = step; },
    SetSid: function(sid: any) {}
  };

  beforeEach(() => {
    mockRouter.navigatedTo = null;
    mockSessionService.clearCalled = false;
    mockSessionService.stepSetTo = null;
    mockSessionService.sid = 'token-temporal-123';
    mockSessionService.Step = AuthStep.Ident;

    TestBed.configureTestingModule({
      providers: [
        HandleSession,
        { provide: Router, useValue: mockRouter },
        { provide: SessionService, useValue: mockSessionService }
      ]
    });

    service = TestBed.inject(HandleSession);
  });

  it('debería permitir el acceso si el paso actual y el SID coinciden', () => {
    service.RefreshStep(); 
    const result = service.CheckStep(AuthStep.Ident);
    
    // Cambiamos toBeTrue() por toBe(true) que es el estándar universal
    expect(result).toBe(true);
    expect(mockSessionService.clearCalled).toBe(false);
    expect(mockRouter.navigatedTo).toBeNull();
  });

  it('debería bloquear el acceso y limpiar la sesión si el usuario salta a un paso incorrecto', () => {
    mockSessionService.Step = AuthStep.Ident;
    service.RefreshStep();

    service.CheckStep(AuthStep.SecChallenge);

    expect(mockSessionService.clearCalled).toBe(true);
    expect(mockRouter.navigatedTo).toEqual(['step1']);
  });

  it('debería redirigir correctamente a la pantalla adecuada usando MoveStep', () => {
    service.MoveStep(AuthStep.OtpValidation);
    
    expect(mockSessionService.stepSetTo).toBe(AuthStep.OtpValidation);
    expect(mockRouter.navigatedTo).toEqual(['step4']);
  });

  it('debería detectar correctamente cuando la sesión expira (SId nulo)', () => {
    mockSessionService.sid = null; 
    service.RefreshStep();

    const isExpired = service.CheckExpireSession();
    expect(isExpired).toBe(true);
  });
});