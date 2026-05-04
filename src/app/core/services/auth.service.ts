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
    return this.http.post<ApiResp<IdentResp>>(`${this.apiUrl}/Identify`, data);
  }

  GetSecQuestions(): Observable<ApiResp<SecChallengeResp>> {
    const data = { 
      UId: this.GetSessionData('sid'), 
      Step: this.GetSessionData('step') 
    };
    return this.http.post<ApiResp<SecChallengeResp>>(`${this.apiUrl}/SecQuest`, data);
  }

  ValidateSecAnswers(Quest: ChallengeValidationReq): Observable<ApiResp<boolean>> {
    const data = { 
      UId: this.GetSessionData('sid'), 
      Type: Quest, 
      Step: this.GetSessionData('step') 
    };
    return this.http.post<ApiResp<boolean>>(`${this.apiUrl}/ValAnswers`, data);
  }

  GetDeliveryMethods(): Observable<ApiResp<DeliveryResp>> {
    const data = { 
      UId: this.GetSessionData('sid'), 
      Step: this.GetSessionData('step') 
    };
    return this.http.post<ApiResp<DeliveryResp>>(`${this.apiUrl}/Methods`, data);
  }

  SendOtpCode(Type: MfaType): Observable<ApiResp<boolean>> {
    const data = { 
      UId: this.GetSessionData('sid'), 
      Type: Type, 
      Step: this.GetSessionData('step') 
    };
    return this.http.post<ApiResp<boolean>>(`${this.apiUrl}/SendCode`, data);
  }

  SetupMfa(UserId: string): Observable<ApiResp<MfaSetupResp>> {
    return this.http.post<ApiResp<MfaSetupResp>>(`${this.SetUrl}/SetupMfa`, { UserId });
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