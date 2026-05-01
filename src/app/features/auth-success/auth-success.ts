import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StepperComp } from '../../shared/components/stepper/stepper';

@Component({
  selector: 'app-authentication-success',
  standalone: true,
  imports: [StepperComp],
  templateUrl: './auth-success.html',
  styleUrl: './auth-success.scss'
})
export class AutheSuccessComp implements OnInit {
  private Router = inject(Router);

  ngOnInit(): void {
    // Limpiamos la basura transaccional del flujo OTP
    sessionStorage.removeItem('SelectedChannel');
    
    // Opcional: Si el backend envía un Token final, asegúrate de guardarlo 
    // y borrar el SessionId temporal aquí.
  }

  GoToDashboard(): void {
    // Aquí defines la ruta hacia el dashboard principal de tu aplicación
    // this.Router.navigate(['/dashboard']);
    alert('¡Bienvenido al sistema corporativo!');
  }
}