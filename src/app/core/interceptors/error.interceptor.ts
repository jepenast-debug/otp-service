import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError,throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { LoadingService } from '../services/loading.service';
import { HandleSession } from '../Handle/HandleSession';
import { AuthStep } from '../models/Enums';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const ToastServ = inject(ToastService);
  const LoadService = inject(LoadingService);
  const HandSession = inject(HandleSession);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      LoadService.Hide();
      let SafeErrMsg = 'Ha ocurrido un error inesperado al procesar su solicitud.';
      if (error.status==0){
        SafeErrMsg = 'No hay conexión con el servidor. Verifique su red.';
      }else if (error.status === 401) {
        SafeErrMsg = 'Sesión expirada o no válida. Por favor, inicie sesión nuevamente.';
        HandSession.ClearSession();
        HandSession.MoveStep(AuthStep.Ident);
      }else if (error.status >= 500) {
        SafeErrMsg = 'Error interno del servidor';
      }else if (error.error && typeof error.error === 'string') {
         // Solo tomamos mensajes controlados de error (ej. validaciones de negocio)
         SafeErrMsg = error.error;
      }
      ToastServ.Show(SafeErrMsg, 'error');
      //console.log(error.message);
      return throwError(() => new Error('Error en la solicitud.'));
    })
  );
};