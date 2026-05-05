import { Component, signal, inject, OnInit, ViewChildren, QueryList, ElementRef, OnDestroy, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { OtpValidationReq } from '../../core/models/request';
import { AuthStep, MfaType } from '../../core/models/Enums';
import { StepperComp } from '../../shared/components/stepper/stepper';
import { HandleSession } from '../../core/Handle/HandleSession';

@Component({
  selector: 'app-token-validation',
  standalone: true,
  imports: [FormsModule, StepperComp, TranslateModule],
  templateUrl: './token-validation.html',
  styleUrl: './token-validation.scss'
})
export class TokenValidationComp implements OnInit, OnDestroy {
  private AuthService = inject(AuthService);
  private HandleSession = inject(HandleSession);

  @ViewChildren('digitInput') digitInputs!: QueryList<ElementRef>;

  CodeDigits = signal<string[]>(['', '', '', '', '', '']);
  IsLoading = signal(false);
  ErrorMessage = signal('');
  IsExpired = signal(false);
  // Temporizador
  TimeLeft = signal(300); // 60 segundos
  private TimerInterval: any;

  FormattedTime = computed(() => {
    const totalSeconds = this.TimeLeft();
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    // padStart asegura que siempre haya dos dígitos (ej: "01:05" en lugar de "1:5")
    const minsStr = minutes.toString().padStart(2, '0');
    const secsStr = seconds.toString().padStart(2, '0');
    
    return `${minsStr}:${secsStr}`;
  });

  ngOnInit(): void {
    //this.ValidateAccess();
    this.StartTimer();
  }

  ngOnDestroy(): void {
    clearInterval(this.TimerInterval);
  }

  ValidateAccess(): void {
    if (this.HandleSession.CheckStep(AuthStep.OtpValidation)) {
      return;
    }
  }

  // --- LÓGICA DEL TEMPORIZADOR Y REENVÍO ---
  StartTimer(): void {
    this.TimeLeft.set(300);
    this.IsExpired.set(false);
    this.ErrorMessage.set('');
    clearInterval(this.TimerInterval);

    this.TimerInterval = setInterval(() => {
      if (this.TimeLeft() > 0) {
        this.TimeLeft.set(this.TimeLeft() - 1);
      } else {
        this.IsExpired.set(true);
        clearInterval(this.TimerInterval);
      }
    }, 1000);
  }

  ResendCode(): void {
    const mfaType = sessionStorage.getItem('SelectedMfa') as unknown as MfaType;
    if (!this.HandleSession.CheckStep(AuthStep.OtpValidation)) {
      return;
    }

    this.IsLoading.set(true);
    this.AuthService.SendOtpCode(mfaType).subscribe({
      next: (response) => {
        this.IsLoading.set(false);
        if (response.code === 200) {
          this.CodeDigits.set(['', '', '', '', '', '']);
          this.StartTimer();
        } else {
          this.ErrorMessage.set('Error al reenviar el código.');
        }
      },
      error: () => {
        this.IsLoading.set(false);
        this.ErrorMessage.set('Error de conexión al reenviar el código.');
      }
    });
  }

  // --- LÓGICA DE LAS CAJAS INDIVIDUALES ---
  // Verifica si el formulario está lleno
  IsFormValid(): boolean {
    return this.CodeDigits().every(d => d.trim().length === 1);
  }

  OnInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/[^0-9]/g, ''); // Solo números
    input.value = val;

    const Current = [...this.CodeDigits()];
    Current[index] = val;
    this.CodeDigits.set(Current);

    if (val && index < 5) {
      this.FocusInput(index + 1); // Salta a la siguiente caja
    }
  }

  // Vuelve a la caja anterior si borra estando vacío
  OnKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.CodeDigits()[index] && index > 0) {
      this.FocusInput(index - 1); 
    }
  }

  // Permite pegar el código completo
  OnPaste(event: ClipboardEvent, index: number): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const numbers = pastedData.replace(/[^0-9]/g, '').slice(0, 6);

    if (numbers) {
      const Current = [...this.CodeDigits()];
      for (let i = 0; i < numbers.length; i++) {
        if (index + i < 6) {
          Current[index + i] = numbers[i];
        }
      }
      this.CodeDigits.set(Current);
      // Foco en la última caja llenada
      this.FocusInput(Math.min(index + numbers.length, 5));
    }
  }

  private FocusInput(index: number): void {
    const inputs = this.digitInputs.toArray();
    if (inputs[index]) {
      inputs[index].nativeElement.focus();
    }
  }

  // --- LÓGICA DE VALIDACIÓN FINAL ---
  ValidateToken(): void {
    if (!this.IsFormValid()) return;

    const sid = this.HandleSession.GetSid();
    const MfaType = sessionStorage.getItem('SelectedMfa') as unknown as MfaType;
    const Code = this.CodeDigits().join(''); // Unimos las 6 cajas en un solo string

    this.IsLoading.set(true);
    this.ErrorMessage.set('');

    const Request: OtpValidationReq = { UserId: sid!, Code: Code, MfaType: MfaType };

    this.AuthService.ValidateOtp(Request).subscribe({
      next: (Response) => {
        if (Response.code === 200) {
          //TODO: Crear una cookie con el dominio y los datos de accessToken
          this.HandleSession.SetRespItem('AccessToken', Response.data.AccessToken);
          this.HandleSession.SetRespItem('Return', Response.data.UrlReturn);
          this.HandleSession.CreateCookie('AToken', Response.data.AccessToken); // Cookie válida por 1 día
          this.HandleSession.MoveStep(AuthStep.AccessGranted);
        } else {
          this.IsLoading.set(false);
          this.ErrorMessage.set('Código incorrecto.');
        }
      },
      error: () => {
        this.IsLoading.set(false);
        this.ErrorMessage.set('Error al validar el código.');
      }
    });
  }

  GoBack(): void {
    this.HandleSession.MoveStep(AuthStep.Delivery);
  }
}