import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('debería iniciar sin ningún toast visible', () => {
    expect(service.CurrentToast()).toBeNull();
  });

  it('debería mostrar el mensaje con el tipo correcto', () => {
    service.Show('Operación exitosa', 'success');
    
    const toast = service.CurrentToast();
    expect(toast).not.toBeNull();
    expect(toast?.text).toBe('Operación exitosa');
    expect(toast?.type).toBe('success');
  });

  it('debería ocultarse manualmente al llamar a Hide()', () => {
    service.Show('Alerta de prueba', 'warning');
    service.Hide();
    expect(service.CurrentToast()).toBeNull();
  });

  it('debería auto-ocultarse después de 4 segundos', () => {
    let timeoutCallback: any;
    const originalSetTimeout = window.setTimeout;
    
    // Secuestramos setTimeout temporalmente
    window.setTimeout = ((cb: any) => { timeoutCallback = cb; }) as any;

    service.Show('Mensaje temporal', 'info');
    expect(service.CurrentToast()).not.toBeNull();

    // Disparamos el callback manualmente simulando el paso del tiempo
    if (timeoutCallback) timeoutCallback();

    expect(service.CurrentToast()).toBeNull();
    
    // Restauramos la función original
    window.setTimeout = originalSetTimeout; 
  });
});