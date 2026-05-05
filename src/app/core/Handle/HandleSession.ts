import { Injectable,inject } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { AuthStep } from '../models/Enums';

@Injectable({
  providedIn: 'root' // <-- ESTO ES LO QUE FALTA
})

export class HandleSession {

    private Router = inject(Router);
    private SessionService = inject(SessionService);
    private SId = this.SessionService.sid;
    private Step = this.SessionService.Step;

    CheckStep(StepAct:AuthStep): boolean {
        if (!this.SId || this.Step !=StepAct) {
            console.warn('Acceso denegado. debe continuar el proceso de autenticación');
            this.SessionService.Clear(); // Limpiamos cualquier estado previo por seguridad
            this.MoveStep(AuthStep.Ident); // Redirigimos al paso inicial
            //return false;
        }else{
            return true;
        }
        return true;
    }

    CheckExpireSession(): boolean {
        if (!this.SId) {
            console.warn('Sesión expirada o no válida. Por favor, inicie sesión nuevamente.');
        } 
        return !this.SId;
    }

    SetStep(StepAct:AuthStep): void {
        this.SessionService.SetStep(StepAct);
    }

    SetSId(value: string): void {
        this.SessionService.SetSid(value);
    }

    GetStep(): string {
        return this.SessionService.Step.toString() || ''  ;
    }

    GetSid(): string {
        return this.SessionService.sid?.toString() || '';
    }

    ClearSession(): void {
        this.SessionService.Clear();
    }

    ClearAllStorage(): void {
        localStorage.clear();
        sessionStorage.clear();
    }

    SetRespItem(key: string, value: string): void {
        sessionStorage.setItem(key, value);
    }

    CreateCookie(name: string, value: string, Hours?: number): void {
        const expires = Hours ? `; expires=${new Date(Date.now() + 86400000).toUTCString()}` : '';
        document.cookie = `${name}=${value}${expires}; path=/; secure; samesite=lax`;
    }

    RefreshStep(): void {
        this.SId= this.SessionService.sid;
        this.Step= this.SessionService.Step;
    }

    MoveStep(StepAct:AuthStep): void {
        let PosStep = 'step1';
        switch (StepAct) {
            case AuthStep.SecChallenge:
                PosStep= 'step2';
                break;
            case AuthStep.Delivery:
                PosStep= 'step3';
                break;
            case AuthStep.OtpValidation:
                PosStep= 'step4';
                break;
            case AuthStep.MfaSetup:
                PosStep= 'mfa-setup';
                break;
            case AuthStep.AccessGranted:
                PosStep= 'step5';
                break;
            default:
                PosStep= 'step1';
        }
        this.SetStep(StepAct);
        this.RefreshStep();
        this.Router.navigate([PosStep]);
    }
}