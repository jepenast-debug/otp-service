import { Injectable, signal } from '@angular/core';
import { AuthStep } from '../models/Enums';

@Injectable({ providedIn: 'root' })

export class SessionService {
  private _sid = signal<string | null>(this.GetInitialSid());
  private _step = signal<AuthStep>(this.GetInitialStep());
  private _Url = signal<string>(this.GetUrlEnc());

  get sid() { 
    return this._sid(); 
  }
 
  get Step(): AuthStep {
    return this._step();
  }

  get Url(): string {
    return this._Url();
  }

  GetItem(Key:string): string {
    return sessionStorage.getItem(Key)?.toString() || '';
  }

  SetItem(Key:string,Value:string){
    sessionStorage.setItem(Key,Value);
  }

  SetSid(value: string): void {
    let Enc=this.Encode(value.toString());
    sessionStorage.setItem('sid', Enc);
    this._sid.set(value);
  }

  SetStep(value: AuthStep): void {
    const Enc = this.Encode(value.toString());
    sessionStorage.setItem('Record', Enc);
    this._step.set(value);
  }

  SetUrl(value: string): void {
    const Enc = this.Encode(value.toString());
    sessionStorage.setItem('Url', Enc);
    this._Url.set(value);

  }

  Clear(): void {
    sessionStorage.removeItem('sid');
    sessionStorage.removeItem('Record');
    sessionStorage.removeItem('Url');
    this._sid.set(null);
    this._step.set(AuthStep.Ident);
  }

  ClearAll():void{
    sessionStorage.clear();
    localStorage.clear();
  }

  // ==========================================
  // --- MÉTODOS PRIVADOS DE OFUSCACIÓN ---
  // ==========================================

  private GetUrlEnc(): string {
    const durl = sessionStorage.getItem('Url');
    if (!durl || durl.length <= 16) {
      return '';
    }
    return durl;
  }

  private GetInitialStep(): AuthStep {
    const Record = sessionStorage.getItem('Record');
    if (!Record || Record.length <= 16) {
      return AuthStep.Ident;
    }
    let Result=this.Decode(Record);
    const StepValue = Number(Result);
    return isNaN(StepValue) ? AuthStep.Ident : StepValue as AuthStep;
  }

  private GetInitialSid(): string{
    const Sid = sessionStorage.getItem('sid');
    if (!Sid || Sid.length<=16){
      return '';
    }
    let Result=this.Decode(Sid) || '';
    return Result;
  }

  private Decode(EncStr:string):string{
    let str = '';
    try {
      const B64 = EncStr.substring(16);
      const Hex = atob(B64);
      // 3. Pasar de hex a string
      for (let i = 0; i < Hex.length; i += 2) {
        str += String.fromCharCode(parseInt(Hex.substring(i, i + 2), 16));
      }
      return str
    } catch (error) {
      return str;
    }
  }

  private Encode(str:string):string{
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