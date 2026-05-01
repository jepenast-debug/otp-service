import { Injectable, signal } from '@angular/core';
import { AuthStep } from '../models/Enums';

@Injectable({ providedIn: 'root' })
export class SessionService {
  // Inicializamos con lo que haya en el storage por si el usuario refresca la página
  private _sid = signal<string | null>(sessionStorage.getItem('sid'));
  
  //función privada para manejar toda la decodificación al inicio
  private _step = signal<AuthStep>(this.GetInitialStep());

  get sid() { return this._sid(); }
  
  get Step(): AuthStep {
    return this._step();
  }

  SetSid(value: string): void {
    sessionStorage.setItem('sid', value);
    this._sid.set(value);
  }

  SetStep(value: AuthStep): void {
    // Codificamos antes de guardar en 'Record'
    const Enc = this.EncodeStep(value.toString());
    sessionStorage.setItem('Record', Enc);
    this._step.set(value);
  }

  Clear(): void {
    sessionStorage.removeItem('sid');
    sessionStorage.removeItem('Record');
    this._sid.set(null);
    this._step.set(AuthStep.Ident);
  }

  // ==========================================
  // --- MÉTODOS PRIVADOS DE OFUSCACIÓN ---
  // ==========================================

  private GetInitialStep(): AuthStep {
    const Record = sessionStorage.getItem('Record');
    if (!Record || Record.length <= 16) {
      return AuthStep.Ident;
    }
    
    try {
      let str = '';
      const B64 = Record.substring(16);      // 1. Quitar el salt de 16 caracteres
      const Hex = atob(B64);                //  2. Base64 a Hex
      // 3. Pasar de hex a string
      for (let i = 0; i < Hex.length; i += 2) {
        str += String.fromCharCode(parseInt(Hex.substring(i, i + 2), 16));
      }
      const StepValue = Number(str);
      // Si el resultado no es un número válido, alguien manipuló la cadena
      return isNaN(StepValue) ? AuthStep.Ident : StepValue as AuthStep;
    } catch (error) {
      // Si falla atob() o el parseo por manipulación en consola, reiniciamos la sesión
      return AuthStep.Ident;
    }
  }

  private EncodeStep(str: string): string {
    // 1. String a Hex
    let Hex = '';
    for (let i = 0; i < str.length; i++) {
      const hexChar = str.charCodeAt(i).toString(16);
      // Aseguramos que siempre tenga 2 caracteres por byte para decodificar bien
      Hex += hexChar.length === 1 ? '0' + hexChar : hexChar; 
    }
    const b64 = btoa(Hex);// 2. Hex a Base64
    const salt = this.GenerateSalt(16); // 3. Generar salt aleatorio de 16 caracteres
    return salt + b64; // 4. Retornar Salt + Base64
  }

  private GenerateSalt(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let Result = '';
    
    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues); 
    
    for (let i = 0; i < length; i++) {
      Result += chars[randomValues[i] % chars.length];
    }
    return Result;
  }
}


/*
Gestión de Errores Silenciosa: Todo el proceso de GetInitialStep está encapsulado en un bloque try/catch. 
Si un atacante entra a las DevTools e intenta cambiar el valor de Record por una inyección o un texto 
sin formato, la función atob() o el parseo Hex fallarán. En lugar de romper la aplicación, el servicio 
capturará el error silenciosamente y devolverá al usuario al paso 1 (AuthStep.Ident), invalidando su avance.

Normalización Hexadecimal: En el paso de "String a Hex" (EncodeStep), se añade una pequeña validación 
('0' + hexChar) para asegurar que caracteres de un solo dígito hexadecimal se guarden siempre como dos 
(ej. 03 en lugar de 3). Esto es indispensable para que el bucle de decodificación (i += 2) no se desalinee 
al leer los bytes de vuelta.
*/