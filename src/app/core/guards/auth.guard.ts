import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const sessionService = inject(SessionService);
  const userId = sessionService.sid;

  if (userId) {
    return true;
  } else {
    console.warn('Acceso denegado. Se requiere identificación previa.');
    sessionService.Clear(); // Limpiamos cualquier estado previo por seguridad
    router.navigate(['/step1']);
    return false;
  }
};