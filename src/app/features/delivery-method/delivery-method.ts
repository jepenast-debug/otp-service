import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { StepperComp } from '../../shared/components/stepper/stepper';

// Interfaz para tipar correctamente los canales
export interface DeliveryChannel {
  Id: string;
  Type: 'Email' | 'Sms';
  MaskedValue: string;
}

@Component({
  selector: 'app-delivery-method',
  standalone: true,
  imports: [StepperComp],
  templateUrl: './delivery-method.html',
  styleUrl: './delivery-method.scss'
})
export class DeliveryMethodComp implements OnInit {
  private Api = inject(ApiService);
  private Router = inject(Router);

  // Estados usando Signals en PascalCase
  AvailableChannels = signal<DeliveryChannel[]>([]);
  SelectedChannelId = signal<string | null>(null);
  IsLoading = signal(false);
  ErrorMessage = signal('');

  ngOnInit(): void {
    this.LoadChannels();
  }

  LoadChannels(): void {
    // Simulamos la respuesta del backend basada en el usuario autenticado en el paso 1
    const MockChannels: DeliveryChannel[] = [
      { Id: 'CH-1', Type: 'Email', MaskedValue: 'j****z@empresa.com' },
      { Id: 'CH-2', Type: 'Email', MaskedValue: 'j****z@correo-personal.com' },
      { Id: 'CH-3', Type: 'Sms', MaskedValue: '********1234' }
    ];
    this.AvailableChannels.set(MockChannels);
  }

  SelectChannel(ChannelId: string): void {
    this.SelectedChannelId.set(ChannelId);
    this.ErrorMessage.set(''); // Limpiamos errores si selecciona algo
  }

  SendOtpCode(): void {
    const ChannelId = this.SelectedChannelId();
    
    if (!ChannelId) {
      this.ErrorMessage.set('Debe seleccionar un método de envío para continuar.');
      return;
    }

    this.IsLoading.set(true);

    // Llamada al backend para disparar el correo/SMS
    this.Api.SendOtp(ChannelId).subscribe({
      next: () => {
        this.IsLoading.set(false);
        // Guardamos el canal para mostrarlo en el siguiente paso si es necesario
        sessionStorage.setItem('SelectedChannel', ChannelId);
        this.Router.navigate(['/step4']); // Avanzamos a la validación del código
      },
      error: () => {
        this.IsLoading.set(false);
        this.ErrorMessage.set('Hubo un error al intentar enviar el código. Intente de nuevo.');
      }
    });
  }

  GoBack(): void {
    this.Router.navigate(['/step2']);
  }
}