import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common'; // Necesario para GoBack()
import { FormsModule } from '@angular/forms'; // Necesario para capturar el código (ngModel)
import { AuthService } from '../../core/services/auth.service';
import { AuthStep } from '../../core/models/Enums'; 
import { TranslateModule } from '@ngx-translate/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { HandleSession } from '../../core/Handle/HandleSession';

@Component({
  selector: 'app-mfa-setup',
  standalone: true,
  imports: [FormsModule,TranslateModule,QRCodeComponent], 
  templateUrl: './mfa-setup.html',
  styleUrl: './mfa-setup.scss'
})
export class MfaSetupComp implements OnInit {
  private AuthService = inject(AuthService);
  private Router = inject(Router);
  private Location = inject(Location);
  private HandSession = inject(HandleSession);

  // Estados visuales y de datos
  QrImageUrl = signal<string>('');
  SecretKey = signal<string>('');
  VerificationCode = signal<string>(''); 
  IsLoading = signal(false);
  ErrorMessage = signal('');

  ngOnInit(): void {
    this.ValidateAccess();
  }

  // 1. GUARDIÁN DEL COMPONENTE
  ValidateAccess(): void {
    if(!this.HandSession.CheckStep(AuthStep.MfaSetup)){
      return;
    }
    this.LoadMfaSetupData();
  }

  // 2. CARGA DEL CÓDIGO QR
  LoadMfaSetupData(): void {
    const sid = this.HandSession.GetStep() || '';
    this.IsLoading.set(true);

    //TODO: Reemplazar con tu método real del AuthService que trae el QR
    this.AuthService.SetupMfa(sid).subscribe({
      next: (Response) => {
        if (Response.code === 200 && Response.data) {
          this.QrImageUrl.set(Response.data.QRUri);
          this.SecretKey.set(Response.data.ManualSecret);
        }
        this.IsLoading.set(false);
      },
      error: () => {
        this.IsLoading.set(false);
        this.ErrorMessage.set('Error al generar el código QR.');
      }
    });
    this.IsLoading.set(false);
  }

  GoBack(): void {
    this.HandSession.SetStep(AuthStep.Delivery);
    this.Location.back();
  }

  // 4. EL VALIDADOR DEL CÓDIGO
  VerifySetup(): void {
    const Code = this.VerificationCode().trim();

    this.ErrorMessage.set('');
    if(this.HandSession.CheckStep(AuthStep.MfaSetup)){
      return;
    }

    if (Code.length < 6) {
      this.ErrorMessage.set('El código de la aplicación debe tener al menos 6 dígitos.');
      return;
    }

    this.IsLoading.set(true);

    // Pasamos el código generado por la app que acaba de vincular.
    this.AuthService.VerifyMfaSetup(Code).subscribe({
      next: (Response) => {
        if (Response.code === 200) {
          this.HandSession.MoveStep(AuthStep.Delivery);
        } else {
          this.IsLoading.set(false);
          this.ErrorMessage.set('El código es incorrecto o expiró. Inténtelo de nuevo.');
        }
      },
      error: () => {
        this.IsLoading.set(false);
        this.ErrorMessage.set('Ocurrió un error al verificar el código.');
      }
    });
  }
}