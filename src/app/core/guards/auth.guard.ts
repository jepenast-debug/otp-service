import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  const userId = sessionStorage.getItem('userId');

  if (userId) {
    return true;
  } else {
    console.warn('Acceso denegado. Se requiere identificación previa.');
    router.navigate(['/step1']);
    return false;
  }
};