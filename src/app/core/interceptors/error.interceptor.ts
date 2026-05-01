import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((ErrorResponse) => {
      console.error('Error Global:', ErrorResponse);
      alert('Error en el sistema');
      throw ErrorResponse;
    })
  );
};