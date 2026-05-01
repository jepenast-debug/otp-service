import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Environment } from '../../../environments/environment';

// Importamos todas las interfaces
import { ApiResp } from '../models/api-response';
import {
  IdentResp, 
  SecChallengeResp, 
  AuthSuccessResp, 
  MfaSetupResp, 
  DeliveryResp
} from '../models/response';
import {
  IdentReq, 
  ChallengeValidationReq, 
  OtpValidationReq
} from '../models/request';
import { MfaType, AuthStep } from '../models/Enums';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${Environment.ApiUrl}/auth`; 
  private SetUrl = `${Environment.ApiUrl}/setup`; 

  // ==========================================
  // --- MÉTODOS DE LA API (Código Limpio) ---
  // ==========================================

  IdentifyUser(UserId: IdentReq, Step: AuthStep): Observable<ApiResp<IdentResp>> {
    const data = { 
      UId: UserId, 
      Step: Step 
    };
    return this.PostEncrypted<IdentResp>(`${this.apiUrl}/Identify`, data);
  }

  GetSecQuestions(UserId: string, Step: AuthStep): Observable<ApiResp<SecChallengeResp>> {
    const data = { 
      UId: UserId, 
      Step: Step 
    };
    return this.PostEncrypted<SecChallengeResp>(`${this.apiUrl}/SecQuest`, data);
  }

  ValidateSecAnswers(UserId: string, Quest: ChallengeValidationReq, Step: AuthStep): Observable<ApiResp<boolean>> {
    const data = { 
      UId: UserId, 
      Type: Quest, 
      Step: Step 
    };
    return this.PostEncrypted<boolean>(`${this.apiUrl}/ValAnswers`, data);
  }

  GetDeliveryMethods(UserId: string, Step: AuthStep): Observable<ApiResp<DeliveryResp>> {
    const data = { 
      UId: UserId, 
      Step: Step 
    };
    return this.PostEncrypted<DeliveryResp>(`${this.apiUrl}/Methods`, data);
  }

  SendOtpCode(UserId: string, Type: MfaType, Step: AuthStep): Observable<ApiResp<boolean>> {
    const data = { 
      UId: UserId, 
      Type: Type, 
      Step: Step 
    };
    return this.PostEncrypted<boolean>(`${this.apiUrl}/SendCode`, data);
  }

  SetupMfa(UserId: string): Observable<ApiResp<MfaSetupResp>> {
    return this.PostEncrypted<MfaSetupResp>(`${this.SetUrl}/SetupMfa`, { UserId });
  }

  VerifyMfaSetup(UserId: string, Code: string, Step: AuthStep): Observable<ApiResp<boolean>> {
    const data = { 
      UId: UserId, 
      Code: Code, 
      Step: Step 
    };
    return this.PostEncrypted<boolean>(`${this.SetUrl}/VerifyMfaSetup`, data);
  }

  ValidateOtp(Info: OtpValidationReq, Step: AuthStep): Observable<ApiResp<AuthSuccessResp>> {
    const data = { 
      UId: Info.UserId, 
      Code: Info.Code, 
      MfaType: Info.MfaType, 
      Step: Step 
    };
    return this.PostEncrypted<AuthSuccessResp>(`${this.apiUrl}/ValCode`, data);
  }

  // ==========================================
  // --- MOTOR CRIPTOGRÁFICO CENTRALIZADO ---
  // ==========================================

  private PostEncrypted<T>(url: string, payload: any): Observable<ApiResp<T>> {
    // 1. Convertimos la Promesa criptográfica en un Observable
    return from(this.EncryptSecurePayload(payload)).pipe(
      switchMap(encryptedBase64 => {
        // 2. Enviamos la cadena Base64 final
        return this.http.post<ApiResp<T>>(url, `"${encryptedBase64}"`, {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        });
      })
    );
  }

  private async EncryptSecurePayload(payload: any): Promise<string> {
    const Encoder = new TextEncoder();
    const DataBytes = Encoder.encode(JSON.stringify(payload));

    // A. Generación de Llaves (AES-256-GCM + IV)
    const IV = window.crypto.getRandomValues(new Uint8Array(12));
    const AKEY = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt']
    );

    // B. Cifrado del Payload (AES)
    // Nota para C#: WebCrypto adjunta el 'Authentication Tag' (16 bytes) al final de este buffer automáticamente.
    const EncrypBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: IV },
      AKEY,
      DataBytes
    );

    // C. Cifrado Asimétrico de las llaves (RSA)
    const RawAesKey = await window.crypto.subtle.exportKey('raw', AKEY);
    const RSAKeyBuffer = this.Base64ToArrayBuffer(Environment.CERT);
    
    const RSAPubKey = await window.crypto.subtle.importKey(
      'spki',
      RSAKeyBuffer,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['encrypt']
    );

    const keysObj = {
      k: this.ArrayBufferToBase64(RawAesKey),
      i: this.ArrayBufferToBase64(IV.buffer)
    };
    const keysBytes = Encoder.encode(JSON.stringify(keysObj));

    const EncryptCEBuffer = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      RSAPubKey,
      keysBytes
    );

    // D. Ensamblaje Estructural { data, CE }
    const finalJson = {
      data: this.ArrayBufferToBase64(EncrypBuffer),
      CE: this.ArrayBufferToBase64(EncryptCEBuffer)
    };

    // E. Conversión final: Objeto -> UTF-8 -> Base64
    const finalJsonStr = JSON.stringify(finalJson);
    return btoa(unescape(encodeURIComponent(finalJsonStr)));
  }

  // --- Herramientas de Conversión ---

  private Base64ToArrayBuffer(base64: string): ArrayBuffer {
    const BinString = atob(base64);
    const Bytes = new Uint8Array(BinString.length);
    for (let i = 0; i < BinString.length; i++) {
      Bytes[i] = BinString.charCodeAt(i);
    }
    return Bytes.buffer;
  }

  private ArrayBufferToBase64(buffer: ArrayBuffer): string {
    const Bytes = new Uint8Array(buffer);
    let Binary = '';
    for (let i = 0; i < Bytes.length; i++) {
      Binary += String.fromCharCode(Bytes[i]);
    }
    return btoa(Binary);
  }
}