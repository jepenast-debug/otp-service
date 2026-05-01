import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common'; 
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { SessionService } from '../../core/services/session.service';
import { AuthStep, MfaType } from '../../core/models/Enums';
import { StepperComp } from '../../shared/components/stepper/stepper';
import { MaskPipe } from '../../shared/pipes/mask';

// Creamos una interfaz temporal para manejar los datos tal como los lee tu HTML
interface ChannelUI {
  Id: string;
  Type: string;        // 'Email' o 'App' (Usado en el @if del HTML para los íconos)
  MaskedValue: string; // El valor real correo que será filtrado por el MaskPipe
  MfaTypeRef: MfaType; // Referencia estricta para enviar al backend
}

@Component({
  selector: 'app-delivery-method',
  standalone: true,
  imports: [StepperComp, TranslateModule, MaskPipe],
  templateUrl: './delivery-method.html',
  styleUrl: './delivery-method.scss'
})

export class DeliveryMethodComp implements OnInit {
  private authService = inject(AuthService);
  private sessionService = inject(SessionService);
  private router = inject(Router);
  private location = inject(Location);

  AvailableChannels = signal<ChannelUI[]>([]);
  SelectedChannelId = signal<string | null>(null);
  HasAuthApp = signal(false);
  IsLoading = signal(false);
  ErrorMessage = signal('');

  ngOnInit(): void {
    this.LoadChannels();
  }

  LoadChannels(): void {
    const sid = this.sessionService.sid;
    const Step = this.sessionService.Step;

    if (!sid) {
      this.router.navigate(['/identificacion']);
      return;
    }

    this.IsLoading.set(true);
    this.authService.GetDeliveryMethods(sid, Step).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const channels: ChannelUI[] = [];
          
          // Mapeamos las respuestas a la estructura ChannelUI que usa el HTML
          if (response.data.Email) {
            channels.push({ 
              Id: 'chn_email', 
              Type: 'Email', 
              MaskedValue: response.data.Email, 
              MfaTypeRef: MfaType.Email 
            });
          }
          if (response.data.HasApp) {
            this.HasAuthApp.set(true);
            channels.push({ 
              Id: 'chn_app', 
              Type: 'App', 
              MaskedValue: 'App de Autenticación', 
              MfaTypeRef: MfaType.AuthApp 
            });
          }else{
            this.HasAuthApp.set(false);
          }
          this.AvailableChannels.set(channels);
        }
        this.IsLoading.set(false);
      },
      error: () => {
        this.IsLoading.set(false);
        this.ErrorMessage.set('No se pudieron recuperar los métodos de envío.');
      }
    });
  }

  // --- FUNCIONES LLAMADAS DESDE EL HTML ---
  SelectChannel(id: string): void {
    this.SelectedChannelId.set(id);
    this.ErrorMessage.set(''); // Limpiar errores al seleccionar
  }

  GoToMfaSetup(): void {
    this.sessionService.SetStep(AuthStep.MfaSetup);
    // Redirige a la ruta que definimos en app.routes.ts
    this.router.navigate(['/mfa-setup']); 
  }

  GoBack(): void {
    this.sessionService.SetStep(AuthStep.SecChallenge);
    this.location.back();
    // Alternativamente: this.router.navigate(['/step2']);
  }

  SelectMethod(): void {
    const sid = this.sessionService.sid;
    const selectedId = this.SelectedChannelId();
    const Step= this.sessionService.Step;
    
    if (!sid || !selectedId || Step!==AuthStep.Delivery) return;

    // Buscamos cuál canal eligió el usuario para extraer el tipo de MFA exacto
    const channel = this.AvailableChannels().find(c => c.Id === selectedId);
    if (!channel) return;

    this.IsLoading.set(true);

    // TODO: Si tu authService.sendOtp existe, asegúrate de que reciba (sid, channel.MfaTypeRef)
    this.authService.SendOtpCode(sid, channel.MfaTypeRef, Step).subscribe({
      next: (response) => {
        if (response.success) {
          // Guardamos en sesión el tipo elegido para el paso 4
          this.sessionService.SetStep(AuthStep.OtpValidation);
          this.router.navigate(['/step4']);
        } else {
          this.IsLoading.set(false);
          this.ErrorMessage.set('Ocurrió un problema al enviar el código.');
        }
      },
      error: () => {
        this.IsLoading.set(false);
        this.ErrorMessage.set('Error al procesar la solicitud. Intente de nuevo.');
      }
    });
  }
}