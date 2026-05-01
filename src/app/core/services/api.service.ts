import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {

  constructor(private Http: HttpClient) {}

  ValidateUser(UserId: string) {
    return this.Http.post(`${Environment.ApiUrl}/validate`, { UserId });
  }

  SendOtp(Channel: string) {
    return this.Http.post(`${Environment.ApiUrl}/otp`, { Channel });
  }

  ValidateOtp(Otp: string) {
    return this.Http.post(`${Environment.ApiUrl}/otp/validate`, { Otp });
  }
}