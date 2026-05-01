import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Environment } from '../../../environments/environment';

// Importamos todas nuestras interfaces
import { ApiResp } from '../models/api-response';
import {
  IdentResp,
  SecChallengeResp,
  AuthSuccessResp,
  MfaSetupResp
} from '../models/response';
import {
  IdentReq,
  ChallengeValidationReq,
  OtpValidationReq
} from '../models/request';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  
  // Base URL apuntando al controlador AuthController de tu backend
  private apiUrl = `${Environment.ApiUrl}/auth`; 

  // 1. Identificación inicial (Paso 1)
  identifyUser(data: IdentReq): Observable<ApiResp<IdentResp>> {
    return this.http.post<ApiResp<IdentResp>>(`${this.apiUrl}/identify`, data);
  }

  // 2. Solicitar las preguntas de seguridad (Paso 2)
  getSecurityQuestions(userId: string): Observable<ApiResp<SecChallengeResp>> {
    return this.http.get<ApiResp<SecChallengeResp>>(`${this.apiUrl}/security-questions/${userId}`);
  }

  // 3. Validar las respuestas ingresadas (Paso 2)
  validateSecurityAnswers(data: ChallengeValidationReq): Observable<ApiResp<boolean>> {
    return this.http.post<ApiResp<boolean>>(`${this.apiUrl}/validate-answers`, data);
  }

  // 4. Configurar nueva App de Autenticación (Paso de Enrolamiento)
  setupMfa(userId: string): Observable<ApiResp<MfaSetupResp>> {
    // Usamos POST porque estamos generando un secreto nuevo en el servidor
    return this.http.post<ApiResp<MfaSetupResp>>(`${this.apiUrl}/setup-mfa`, { userId });
  }

  // 5. Validar el código de 6  dígitos (Paso 3 y Activación MFA)
  validateOtp(data: OtpValidationReq): Observable<ApiResp<AuthSuccessResp>> {
    return this.http.post<ApiResp<AuthSuccessResp>>(`${this.apiUrl}/validate-otp`, data);
  }
}