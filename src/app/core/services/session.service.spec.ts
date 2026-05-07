import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';
import { AuthStep } from '../models/Enums';

describe('SessionService (Ofuscación de Estado)', () => {
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionService]
    });
    service = TestBed.inject(SessionService);

    // Limpiamos el storage físico antes de cada prueba para evitar falsos positivos
    sessionStorage.clear();
  });

  it('debería guardar y recuperar el SID correctamente', () => {
    service.SetSid('mi-token-temporal-123');
    expect(service.sid).toBe('mi-token-temporal-123');
  });

  it('debería ofuscar el paso (AuthStep) en el navegador y recuperarlo correctamente', () => {
    // 1. Guardamos un paso específico (ej. Paso 3 - Delivery)
    service.SetStep(AuthStep.Delivery);

    // 2. Verificamos que la app sigue entendiéndolo como el Paso 3 internamente
    expect(service.Step).toBe(AuthStep.Delivery);

    // 3. LA PRUEBA DE FUEGO: Verificamos cómo se guardó REALMENTE en el navegador
    const rawStorageValue = sessionStorage.getItem('Record');

    // Nos aseguramos de que exista algo, pero que NO sea un número crudo identificable
    expect(rawStorageValue).toBeTruthy();
    expect(rawStorageValue).not.toBe(AuthStep.Delivery.toString());
    expect(rawStorageValue?.length).toBeGreaterThan(10); // Comprobamos que el salt/base64 hizo crecer el string
  });

  it('debería limpiar toda la basura transaccional con Clear()', () => {
    // 1. Contaminamos la sesión con datos
    service.SetSid('token-secreto');
    service.SetStep(AuthStep.OtpValidation);
    sessionStorage.setItem('SelectedChannel', 'SMS'); // Simulamos datos adicionales de la UI

    // 2. Disparamos la limpieza
    service.Clear();

    // 3. Verificamos que el servicio reporte la sesión vacía
    expect(service.sid).toBeFalsy();
    
    // 4. Verificamos que el almacenamiento físico del navegador haya sido purgado
    expect(sessionStorage.getItem('SID')).toBeNull();
    expect(sessionStorage.getItem('Step')).toBeNull();
  });
});