import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { from, map, switchMap } from 'rxjs';
import { CryptoUtils } from '../../shared/utils/crypto-utils';

export const EncryptInterceptor: HttpInterceptorFn = (req, next) => {
  const IsAuthRequest = req.url.includes('/auth') || req.url.includes('/setup');

  if (IsAuthRequest && (req.method === 'POST' || req.method === 'PUT') && req.body) {
    // 1. Cifrado de Salida
    return from(CryptoUtils.EncryptReq(req.body)).pipe(
      switchMap(EncryptPayload => {
        const SecureReq = req.clone({
          body: `"${EncryptPayload}"`,
          responseType: 'text', // Forzamos texto para manejar la desencriptación manual
          setHeaders: { 'Content-Type': 'application/json' }
        });

        return next(SecureReq).pipe(
          switchMap(event => {
            if (event instanceof HttpResponse && typeof event.body === 'string') {
              // 2. Descifrado de Entrada
              return from(CryptoUtils.DecryptResp(event.body)).pipe(
                map(DecryptBody => event.clone({ body: DecryptBody }))
              );
            }
            return [event];
          })
        );
      })
    );
  }
  return next(req);
};