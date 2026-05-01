import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { QRCodeComponent } from 'angularx-qrcode'; // Importamos el generador

@Component({
  selector: 'app-mfa-setup',
  standalone: true,
  imports: [FormsModule, TranslateModule, QRCodeComponent],
  templateUrl: './mfa-setup.html',
  styleUrl: './mfa-setup.scss'
})
export class MfaSetupComp {
  // Esta es la URI que en el futuro vendrá de tu backend en .NET
  QrData = signal('otpauth://totp/TuApp:usuario@empresa.com?secret=JBSWY3DPEHPK3PXP&issuer=TuApp');
  
  // Variable para capturar lo que el usuario digite
  VerificationCode = signal('');
  IsLoading = signal(false);

  VerifySetup() {
    this.IsLoading.set(true);
    console.log('Verificando código de enrolamiento:', this.VerificationCode());
    // Aquí validaremos el código de 6 dígitos contra el backend
  }
}