import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from,of } from 'rxjs';
import { switchMap,delay } from 'rxjs/operators';
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
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${Environment.ApiUrl}/auth`; 
  private SetUrl = `${Environment.ApiUrl}/setup`; 
  private SessionService = inject(SessionService);
  
  
  // ==========================================
  // --- MÉTODOS DE LA API (Código Limpio) ---
  // ==========================================

  IdentifyUser(UserId: IdentReq, Step: AuthStep): Observable<ApiResp<IdentResp>> {
    const data = { 
      UId: UserId, 
      Step: Step 
    };
    //return this.http.post<ApiResp<IdentResp>>(`${this.apiUrl}/Identify`, data);
    //SIMULACION
    return of({
      code:200,
      msg: 'OK',
      data: { UserId: 'user-demo-123456789', NextStep: AuthStep.SecChallenge, IsMfaEnabled: true, SId: 'sid-demo-123456789' }
    }).pipe();
  }

  GetSecQuestions(): Observable<ApiResp<SecChallengeResp>> {
    const data = { 
      UId: this.GetSessionData('sid'), 
      Step: this.GetSessionData('step') 
    };
    ///return this.http.post<ApiResp<SecChallengeResp>>(`${this.apiUrl}/SecQuest`, data);
    //SIMULACION
    return of({
      code:200,
      msg: 'OK',
      data: { 
        UserId: 'user-demo-123456789',
        Questions: [
          { Id: 1, Key: '¿Cuál es el nombre de tu primera mascota?' },
          { Id: 2, Key: '¿En qué ciudad naciste?' }
        ] 
      }
    }).pipe();
  }


  ValidateSecAnswers(Quest: ChallengeValidationReq): Observable<ApiResp<boolean>> {
    const data = { 
      UId: this.GetSessionData('sid'), 
      Type: Quest, 
      Step: this.GetSessionData('step') 
    };
    //return this.http.post<ApiResp<boolean>>(`${this.apiUrl}/ValAnswers`, data);
    //SIMULACION
    return of({
      code:200,
      msg: 'OK',
      data: true
    }).pipe();
  }

  GetDeliveryMethods(): Observable<ApiResp<DeliveryResp>> {
    const data = { 
      UId: this.GetSessionData('sid'), 
      Step: this.GetSessionData('step') 
    };
    //return this.http.post<ApiResp<DeliveryResp>>(`${this.apiUrl}/Methods`, data);
    //SIMULACION
    return of({
      code:200,
      msg: 'OK',
      data: {
        Email: 'u****@teleperformance.com',
        Phone: '*******1234',
        HasApp: false // Cambia a true si quieres probar que el banner de MFA desaparezca
      }
    }).pipe(delay(800));
  }

  SendOtpCode(Type: MfaType): Observable<ApiResp<boolean>> {
    const data = { 
      UId: this.GetSessionData('sid'), 
      Type: Type, 
      Step: this.GetSessionData('step') 
    };
    //return this.http.post<ApiResp<boolean>>(`${this.apiUrl}/SendCode`, data);
    //SIMULACION
    return of({
      code:200,
      msg: 'OK',
      data: true
    }).pipe();
  }

  SetupMfa(UserId: string): Observable<ApiResp<MfaSetupResp>> {
    //return this.http.post<ApiResp<MfaSetupResp>>(`${this.SetUrl}/SetupMfa`, { UserId });
    //SIMULACION
    return of({
      code:200,
      msg: 'OK',
      data: { QRUri: 'mfa-demo-123456789', ManualSecret: 'manual-secret-123456789', BackupCodes: ['backup1']  }
    }).pipe();
  }

  VerifyMfaSetup(Code: string): Observable<ApiResp<boolean>> {
    const data = { 
      UId: this.GetSessionData('sid'), 
      Code: Code, 
      Step: this.GetSessionData('step') 
    };
    return this.http.post<ApiResp<boolean>>(`${this.SetUrl}/VerifyMfaSetup`, data);
  }

  ValidateOtp(Info: OtpValidationReq): Observable<ApiResp<AuthSuccessResp>> {
    const data = { 
      UId: this.GetSessionData('sid'), 
      Code: Info.Code, 
      MfaType: Info.MfaType, 
      Step: this.GetSessionData('step') 
    };
    return this.http.post<ApiResp<AuthSuccessResp>>(`${this.apiUrl}/ValCode`, data);
  }

  private GetSessionData(Item:string): string {
    let Result: string;
    switch (Item) {
      case 'sid': 
        Result = this.SessionService.sid?.toString() ?? '';
        break;
      case 'step': 
        Result = this.SessionService.Step?.toString() ?? '';
        break;
      default: 
        Result = '';
        break;
    }
    return Result;
  }
   
}