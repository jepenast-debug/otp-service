import { DestroyableInjector, Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
import { MfaType } from '../models/Enums';
import { AuthStep } from '../models/Enums';
import { StepperComp } from '../../shared/components/stepper/stepper';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  
  // Base URL apuntando al controlador requerido del backend
  private apiUrl = `${Environment.ApiUrl}/auth`; 
  private SetUrl=`${Environment.ApiUrl}/setup`; 

  // 1. Identificación inicial (Paso 1)
  IdentifyUser(UserId: IdentReq,Step:AuthStep): Observable<ApiResp<IdentResp>> {
    let data = {
      UId: UserId,
      Step: Step
    };
    return this.http.post<ApiResp<IdentResp>>(`${this.apiUrl}/Identify`, data);
  }

  // 2. Solicitar las preguntas de seguridad (Paso 2)
  GetSecQuestions(UserId: string,Step:AuthStep): Observable<ApiResp<SecChallengeResp>> {
    let data = {
      UId: UserId,
      Step: Step
    };
    return this.http.post<ApiResp<SecChallengeResp>>(`${this.apiUrl}/SecQuest`, data);
  }

  // 3. Validar las respuestas ingresadas (Paso 2)
  ValidateSecAnswers(UserId:string, Quest: ChallengeValidationReq,Step:AuthStep): Observable<ApiResp<boolean>> {
    let data = {
      UId: UserId,
      Type: Quest,
      Step: Step
    };
    return this.http.post<ApiResp<boolean>>(`${this.apiUrl}/ValAnswers`, data);
  }

  GetDeliveryMethods(UserId: string,Step:AuthStep): Observable<ApiResp<DeliveryResp>> {
    let data = {
      UId: UserId,
      Step: Step
    };
    return this.http.post<ApiResp<DeliveryResp>>(`${this.apiUrl}/Methods`,data);
  }

  SendOtpCode(UserId: string, Type: MfaType,Step:AuthStep): Observable<ApiResp<boolean>> {
    let data = {
      UId: UserId,
      Type: Type,
      Step: Step
    };
    return this.http.post<ApiResp<boolean>>(`${this.apiUrl}/SendCode`, data);
  }

  // 4. Configurar nueva App de Autenticación (Paso de Enrolamiento)
  SetupMfa(UserId: string): Observable<ApiResp<MfaSetupResp>> {
    return this.http.post<ApiResp<MfaSetupResp>>(`${this.SetUrl}/SetupMfa`, { UserId });
  }

  //6. Verificar el codigo de 6 dígitos generado por la App (Paso de Enrolamiento)
  VerifyMfaSetup(UserId: string, Code: string, Step:AuthStep): Observable<ApiResp<boolean>> {
    let data = {
      UId: UserId,
      Code: Code,
      Step: Step
    };
    return this.http.post<ApiResp<boolean>>(`${this.SetUrl}/VerifyMfaSetup`, data);
  }

  // 5. Validar el código de 6  dígitos (Paso 3 y Activación MFA)
  ValidateOtp(Info:OtpValidationReq, Step:AuthStep): Observable<ApiResp<AuthSuccessResp>> {
    let data = {
      UId: Info.UserId,
      Code: Info.Code,
      MfaType: Info.MfaType,
      Step: Step
    };
    return this.http.post<ApiResp<AuthSuccessResp>>(`${this.apiUrl}/ValCode`, data);
  }
}