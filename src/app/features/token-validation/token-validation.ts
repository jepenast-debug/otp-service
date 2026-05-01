import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { StepperComp } from '../../shared/components/stepper/stepper';

@Component({
  selector: 'app-token-validation',
  standalone: true,
  imports: [FormsModule, StepperComp],
  templateUrl: './token-validation.html',
  styleUrl: './token-validation.scss'
})
export class TokenValidationComp implements OnInit, OnDestroy {
  private Api = inject(ApiService);
  private Router = inject(Router);

  // Estados
  OtpDigits = signal<string[]>(new Array(6).fill(''));
  TimeLeft = signal<number>(300); // 5 minutos = 300 segundos
  CanResend = signal<boolean>(false);
  IsLoading = signal<boolean>(false);
  ErrorMessage = signal<string>('');
  
  private TimerInterval: any;

  // Signal computado para mostrar el tiempo en formato MM:SS
  FormattedTime = computed(() => {
    const Minutes = Math.floor(this.TimeLeft() / 60);
    const Seconds = this.TimeLeft() % 60;
    return `${Minutes.toString().padStart(2, '0')}:${Seconds.toString().padStart(2, '0')}`;
  });

  ngOnInit(): void {
    this.StartTimer();
  }

  ngOnDestroy(): void {
    this.ClearTimer();
  }

  // --- Lógica del Temporizador ---
  StartTimer(): void {
    this.CanResend.set(false);
    this.TimeLeft.set(300); // Reiniciar a 5 min
    
    this.TimerInterval = setInterval(() => {
      if (this.TimeLeft() > 0) {
        this.TimeLeft.update(Time => Time - 1);
      } else {
        this.ClearTimer();
        this.CanResend.set(true);
        this.ErrorMessage.set('El código ha expirado. Por favor, solicite uno nuevo.');
        // Opcional: sessionStorage.clear(); this.Router.navigate(['/step1']);
      }
    }, 1000);
  }

  ClearTimer(): void {
    if (this.TimerInterval) {
      clearInterval(this.TimerInterval);
    }
  }

  // --- Lógica de Interacción de los Cuadros ---
  HandleInput(Event: any, Index: number): void {
    const Input = Event.target as HTMLInputElement;
    const Value = Input.value;

    // Actualizamos el array de valores
    this.OtpDigits.update(Digits => {
      const NewDigits = [...Digits];
      NewDigits[Index] = Value;
      return NewDigits;
    });

    this.ErrorMessage.set(''); // Limpiar errores

    // Salto automático al siguiente cuadro
    if (Value && Index < 5) {
      const NextInput = Input.nextElementSibling as HTMLInputElement;
      NextInput?.focus();
    }
  }

  HandleKeyDown(Event: KeyboardEvent, Index: number): void {
    const Input = Event.target as HTMLInputElement;

    // Si presiona Retroceso (Backspace) y el cuadro está vacío, salta al anterior
    if (Event.key === 'Backspace' && !Input.value && Index > 0) {
      const PrevInput = Input.previousElementSibling as HTMLInputElement;
      PrevInput?.focus();
    }
  }

  // --- Acciones ---
  ResendCode(): void {
    if (!this.CanResend()) return;
    
    this.IsLoading.set(true);
    const ChannelId = sessionStorage.getItem('SelectedChannel') || 'CH-1';

    this.Api.SendOtp(ChannelId).subscribe({
      next: () => {
        this.IsLoading.set(false);
        this.ErrorMessage.set('');
        this.OtpDigits.set(new Array(6).fill('')); // Limpiar cuadros
        this.StartTimer(); // Reiniciar contador
      },
      error: () => {
        this.IsLoading.set(false);
        this.ErrorMessage.set('Error al reenviar el código.');
      }
    });
  }

  ValidateToken(): void {
    const FullToken = this.OtpDigits().join('');
    
    if (FullToken.length < 6) {
      this.ErrorMessage.set('Debe ingresar los 6 dígitos del código.');
      return;
    }

    this.IsLoading.set(true);

    this.Api.ValidateOtp(FullToken).subscribe({
      next: () => {
        this.IsLoading.set(false);
        this.ClearTimer();
        this.Router.navigate(['/step5']); // Éxito!
      },
      error: () => {
        this.IsLoading.set(false);
        this.ErrorMessage.set('Código inválido o expirado. Verifique e intente nuevamente.');
        this.OtpDigits.set(new Array(6).fill('')); // Limpiar en caso de error
      }
    });
  }
}