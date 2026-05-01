import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StepperComp } from '../../shared/components/stepper/stepper';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-identification',
  standalone: true,
  imports: [FormsModule, StepperComp,TranslateModule],
  templateUrl: './user-identification.html',
  styleUrl: './user-identification.scss'
})
export class UserIdentificationComp {
  private Api = inject(ApiService);
  private Router = inject(Router);

  // Estados usando Signals en PascalCase
  UserId = signal('');
  ErrorMessage = signal('');
  IsLoading = signal(false);

  ValidateIdentity(): void {
    const InputValue = this.UserId().trim();
    this.ErrorMessage.set(''); // Limpiar errores previos

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

    // Llamada al backend
    this.Api.ValidateUser(InputValue).subscribe({
      next: (Response: any) => {
        this.IsLoading.set(false);
        // Simulamos guardar el token transaccional
        sessionStorage.setItem('SessionId', Response.SessionId || 'TEMP_SESSION_123');
        this.Router.navigate(['/step2']); // Aquí luego cambiaremos la ruta a /security-challenge
      },
      error: () => {
        this.IsLoading.set(false);
        this.ErrorMessage.set('Usuario no encontrado o inactivo en el sistema.');
      }
    });
  }

  ContinueToNextStep() {
    sessionStorage.setItem('userId', 'ID_DEL_USUARIO_AQUI');
    this.Router.navigate(['/seguridad']);
  }
}