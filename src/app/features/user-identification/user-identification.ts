import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { StepperComp } from '../../shared/components/stepper/stepper';
import { AuthService } from '../../core/services/auth.service';
import { SessionService } from '../../core/services/session.service';
import { AuthStep } from '../../core/models/Enums';

@Component({
  selector: 'app-user-identification',
  standalone: true,
  imports: [FormsModule, StepperComp, TranslateModule],
  templateUrl: './user-identification.html',
  styleUrl: './user-identification.scss'
})
export class UserIdentificationComp {
  // 1. Inyección de dependencias estandarizada (camelCase)
  private AuthService = inject(AuthService);
  private SessionService = inject(SessionService);
  private Router = inject(Router);

  // 2. Estados usando Signals
  UserId = signal('');
  ErrorMessage = signal('');
  IsLoading = signal(false);

  ValidateIdentity(): void {
    const InputValue = this.UserId().trim();
    this.ErrorMessage.set(''); 

    if (!InputValue) {
      this.ErrorMessage.set('El campo es obligatorio.');
      return;
    }

    // Validación doble: Solo permite correos o números puros
    const IsEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(InputValue);
    const IsNumeric = /^\d+$/.test(InputValue);

    if (!IsEmail && !IsNumeric) {
      this.ErrorMessage.set('Ingrese un correo corporativo o un ID numérico válido.');
      return;
    }

    this.IsLoading.set(true);

    const request = { UserID: InputValue };
    
    // Llamada al backend usando AuthService
    this.AuthService.IdentifyUser(request,AuthStep.Ident).subscribe({
      next: (Response) => {
        if (Response.success && Response.data.SId) {
          this.SessionService.SetSid(Response.data.SId);
          this.SessionService.SetStep(AuthStep.SecChallenge);
          this.Router.navigate(['/step2']);
        } else {
          this.IsLoading.set(false);
          this.ErrorMessage.set('Error inesperado al validar la identidad.');
        }
      },
      error: () => {
        this.IsLoading.set(false);
        this.ErrorMessage.set('Usuario no encontrado o inactivo en el sistema.');
      }
    });
  }
}