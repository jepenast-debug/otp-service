import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { LoadingService } from '../services/loading.service';
import { HandleSession } from '../Handle/HandleSession';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const ToastServ = inject(ToastService);
  const LoadService = inject(LoadingService);
  const HandSession = inject(HandleSession);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 1. Ocultar cualquier spinner de carga activo
      LoadService.Hide();

      // 2. Determinar el mensaje según el código de estado HTTP
      let ErrorMsg = 'Ocurrió un error inesperado en el sistema.';

      if (error.status === 401 || error.status === 403) {
        ErrorMsg = 'Sesión expirada o acceso denegado.';
        HandSession.ClearSession();
        HandSession.MoveStep(1); // Mueve al inicio
      } else if (error.status === 404) {
        ErrorMsg = 'El recurso solicitado no fue encontrado.';
      } else if (error.status === 500) {
        ErrorMsg = 'Error interno del servidor. Intente más tarde.';
      } else if (error.status === 0) {
        ErrorMsg = 'No hay conexión con el servidor (Verifique su internet).';
      }

      ToastServ.Show(ErrorMsg, 'error');
      return throwError(() => error);
    })
  );
};