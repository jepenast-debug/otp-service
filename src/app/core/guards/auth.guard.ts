import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HandleSession } from '../Handle/HandleSession';
import { AuthStep } from '../models/Enums';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const handSession = inject(HandleSession);
  const userId = handSession.GetSid;
  const CurrentStep = handSession.GetStep;
  const ExpectStep = route.data['Step'] as AuthStep;

  if (!userId) {
    console.warn('Acceso denegado. Se requiere identificación previa.');
    handSession.ClearAllStorage(); 
    handSession.MoveStep(AuthStep.Ident);
    return false;
  }
  
  if (ExpectStep !== undefined && CurrentStep.toString() !== ExpectStep.toString()) {
    console.warn(`Acceso denegado. Salto de ruta detectado.`);
    handSession.ClearAllStorage(); 
    handSession.MoveStep(AuthStep.Ident);
    return false;
  }
  return true;
};