import { Component, signal, inject, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { AuthStep, MfaType } from '../../core/models/Enums';
import { StepperComp } from '../../shared/components/stepper/stepper';
import { MaskPipe } from '../../shared/pipes/mask';
import { HandleSession } from '../../core/Handle/HandleSession';

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
  private HandSession = inject(HandleSession);

  AvailableChannels = signal<ChannelUI[]>([]);
  SelectedChannelId = signal<string | null>(null);
  HasAuthApp = signal(false);
  IsLoading = signal(false);
  ErrorMessage = signal('');

  ngOnInit(): void {
    this.LoadChannels();
  }

  LoadChannels(): void {
    if (!this.HandSession.CheckStep(AuthStep.Delivery)) {
      return;
    }

    this.IsLoading.set(true);
    this.authService.GetDeliveryMethods().subscribe({
      next: (response) => {
        if (response.code === 200 && response.data) {
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
    this.HandSession.MoveStep(AuthStep.MfaSetup);
  }

  GoBack(): void {
    this.HandSession.MoveStep(AuthStep.SecChallenge);
    // Alternativamente: this.router.navigate(['/step2']);
  }

  SelectMethod(): void {
    const selectedId = this.SelectedChannelId();
    
    if (!selectedId || !this.HandSession.CheckStep(AuthStep.Delivery)) return;

    // Buscamos cuál canal eligió el usuario para extraer el tipo de MFA exacto
    const channel = this.AvailableChannels().find(c => c.Id === selectedId);
    if (!channel) return;

    this.IsLoading.set(true);

    // TODO: Si tu authService.sendOtp existe, asegúrate de que reciba (sid, channel.MfaTypeRef)
    this.authService.SendOtpCode(channel.MfaTypeRef).subscribe({
      next: (response) => {
        if (response.code === 200) {
          // Guardamos en sesión el tipo elegido para el paso 4
          this.HandSession.SetRespItem("SelectedMfa","1");
          this.HandSession.MoveStep(AuthStep.OtpValidation);
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