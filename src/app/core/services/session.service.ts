import { Injectable, signal } from '@angular/core';
import { AuthStep } from '../models/Enums';

@Injectable({ providedIn: 'root' })
export class SessionService {
  // Inicializamos con lo que haya en el storage por si el usuario refresca la página
  private _sid = signal<string | null>(sessionStorage.getItem('sid'));
  private _step = signal<AuthStep>(
    Number(sessionStorage.getItem('Step')) || AuthStep.Ident
  );

  get sid() { return this._sid(); }
  get Step(): AuthStep {
    return this._step();
  }

  SetSid(value: string): void {
    sessionStorage.setItem('sid', value);
    this._sid.set(value);
  }

  SetStep(value: AuthStep): void {
    sessionStorage.setItem('Record', value.toString());
    this._step.set(value);
  }

  Clear(): void {
    sessionStorage.removeItem('sid');
    sessionStorage.removeItem('Record');
    this._sid.set(null);
    this._step.set(AuthStep.Ident);
  }
}