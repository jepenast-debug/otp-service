import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Redirección inicial por defecto
  { 
    path: '', 
    redirectTo: 'step1', 
    pathMatch: 'full' 
  },
  { 
    // Paso 1: Identificación (Sin Guard, es la entrada pública)
    path: 'step1', 
    loadComponent: () => import('./features/user-identification/user-identification')
      .then(m => m.UserIdentificationComp) 
  },
  { 
    // Paso 2: Desafío de Seguridad (Protegido)
    path: 'step2', 
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/security-challenge/security-challenge')
      .then(m => m.SecurityChallengeComp) 
  },
  { 
    // Paso 3: Método de Envío (Protegido)
    path: 'step3', 
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/delivery-method/delivery-method')
      .then(m => m.DeliveryMethodComp) 
  },
  { 
    // Paso 4: Validación del Código OTP (Protegido)
    path: 'step4', 
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/token-validation/token-validation')
      .then(m => m.TokenValidationComp) 
  },
  { 
    // Paso 5: Éxito / Acceso Concedido (Protegido)
    path: 'step5', 
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/auth-success/auth-success')
      .then(m => m.AutheSuccessComp) 
  },
  {
    //Paso 3.1, validacion para el setup de MFA, se puede acceder desde el paso 3
    path: 'mfa-setup',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/mfa-setup/mfa-setup')
      .then(m => m.MfaSetupComp)
  },
  { 
    // Ruta comodín (Catch-all) para páginas no encontradas (404)
    path: '**', 
    redirectTo: 'step1' 
  }
];