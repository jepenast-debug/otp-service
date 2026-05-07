import { HttpInterceptorFn, HttpResponse,HttpRequest,HttpHandlerFn } from '@angular/common/http';
import { from, of,throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { CryptoUtils } from '../../shared/utils/crypto-utils';
import { Environment } from '../../../environments/environment';
import { inject } from '@angular/core';
import { HandleSession } from '../Handle/HandleSession';
import { AuthStep } from '../models/Enums';

export const SecurityInterceptor: HttpInterceptorFn = (req:HttpRequest<unknown>, next: HttpHandlerFn) => {
  const HandSession=inject(HandleSession);
  if ((req.method === 'POST' && req.body)){
    return from(CryptoUtils.EncryptReq(req.body)).pipe(
      switchMap(({ SecPayload, TmpKey, TmpIV }) => {
        const SecureReq = req.clone({
          body: `"${SecPayload}"`,
          responseType: 'text',
          setHeaders: { 
            'Content-Type': 'application/json',
            'X-SID': HandSession.GetSid.toString() || '' 
          }
        });
        
        return next(req).pipe(
          switchMap(event => {
            if (event instanceof HttpResponse && event.body) {
              const BodyData = event.body as any;
              const EncrypData = typeof event.body === 'string' ? event.body : BodyData.data;
              if (EncrypData) {
                return from(CryptoUtils.DecryptResp(EncrypData,TmpKey,TmpIV)).pipe(
                  map(DecrypBody => event.clone({ body: DecrypBody })),
                  catchError(err => {
                    console.error('Alerta de Seguridad: Fallo en la desencriptación o payload alterado.');
                    HandSession.ClearAllStorage();
                    HandSession.MoveStep(AuthStep.Ident);
                    // En caso de fallo, puedes decidir si retornar la respuesta cruda o lanzar un error
                    return throwError(() => new Error('Error de integridad en los datos.'));
                  })
                );
              }
            }
            return of(event);
          })
        );
      })
    );
  }
  return next(req);
};