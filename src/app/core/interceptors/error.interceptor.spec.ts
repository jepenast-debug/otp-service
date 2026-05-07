import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ErrorInterceptor } from './error.interceptor';
import { ToastService } from '../services/toast.service';
import { LoadingService } from '../services/loading.service';
import { HandleSession } from '../Handle/HandleSession';

describe('ErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  // Mocks manuales compatibles con Vitest
  const mockToastService = {
    lastMessage: '',
    lastType: '',
    Show: function(msg: string, type: any) { this.lastMessage = msg; this.lastType = type; }
  };

  const mockLoadingService = {
    hideCalled: false,
    Hide: function() { this.hideCalled = true; }
  };

  const mockHandleSession = {
    cleared: false,
    stepMoved: 0,
    ClearSession: function() { this.cleared = true; },
    MoveStep: function(step: any) { this.stepMoved = step; }
  };

  beforeEach(() => {
    // Reiniciamos los rastreadores
    mockToastService.lastMessage = '';
    mockLoadingService.hideCalled = false;
    mockHandleSession.cleared = false;

    TestBed.configureTestingModule({
      providers: [
        // Así se configuran los interceptores funcionales en Angular moderno para pruebas
        provideHttpClient(withInterceptors([ErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: ToastService, useValue: mockToastService },
        { provide: LoadingService, useValue: mockLoadingService },
        { provide: HandleSession, useValue: mockHandleSession }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no queden peticiones HTTP colgadas
  });

  it('debería ocultar el loading y mostrar toast de error en un fallo 500 (Error de Servidor)', () => {
    httpClient.get('/api/test').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/test');
    // Simulamos que el backend falló estrepitosamente
    req.flush('Error Interno', { status: 500, statusText: 'Server Error' });

    expect(mockLoadingService.hideCalled).toBe(true);
    expect(mockToastService.lastMessage).toContain('Error interno del servidor');
    expect(mockToastService.lastType).toBe('error');
  });

  it('debería expulsar al usuario y limpiar la sesión en un fallo 401 (No Autorizado)', () => {
    httpClient.get('/api/test').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/test');
    // Simulamos que el token de sesión expiró
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(mockLoadingService.hideCalled).toBe(true);
    expect(mockHandleSession.cleared).toBe(true);
    expect(mockHandleSession.stepMoved).toBe(1); // Debe devolverlo al paso 1
    expect(mockToastService.lastMessage).toContain('Sesión expirada');
  });

  it('debería alertar sobre falta de conexión cuando el status es 0', () => {
    httpClient.get('/api/test').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/test');
    // Un error con status 0 ocurre cuando no hay internet o el servidor backend está apagado
    req.error(new ProgressEvent('network error'));

    expect(mockToastService.lastMessage).toContain('No hay conexión');
  });
});