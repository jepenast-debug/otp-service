import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('debería iniciar en falso (oculto)', () => {
    expect(service.IsLoading()).toBe(false);
  });

  it('debería cambiar a verdadero al llamar a Show()', () => {
    service.Show();
    expect(service.IsLoading()).toBe(true);
  });

  it('debería volver a falso al llamar a Hide()', () => {
    service.Show(); // Lo encendemos primero
    service.Hide(); // Lo apagamos
    expect(service.IsLoading()).toBe(false);
  });
});