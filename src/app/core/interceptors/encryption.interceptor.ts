import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Environment } from '../../../environments/environment';

// --- FUNCIONES INTERNAS (Basadas en tu lógica de Hex -> Texto -> Split) ---
const HexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
};

const Encrypt = async (payload: any): Promise<string> => {
  const EnvBytes = HexToBytes(Environment.AKI);
  const DecodedEnv = new TextDecoder().decode(EnvBytes);
  const [KeyT, IvT] = DecodedEnv.split(':');

  const KeyB = new TextEncoder().encode(KeyT);
  const IvB = new TextEncoder().encode(IvT);
  const DataB = new TextEncoder().encode(JSON.stringify(payload));

  const CryptoKey = await window.crypto.subtle.importKey(
    'raw', KeyB as BufferSource, { name: 'AES-GCM' }, false, ['encrypt']
  );

  const EncrypBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: IvB as BufferSource },
    CryptoKey,
    DataB as BufferSource
  );

  // Convertimos el Buffer a Base64 para enviarlo al backend en C#
  return btoa(String.fromCharCode(...new Uint8Array(EncrypBuffer)));
};

// --- EL INTERCEPTOR ---
export const encryptionInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo encriptamos si es POST o PUT y tiene cuerpo
  if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
    return from(Encrypt(req.body)).pipe(
      switchMap(encryptedData => {
        const clonedReq = req.clone({
          body: { data: encryptedData },
          setHeaders: {
            'Content-Type': 'application/json',
            'X-SID': sessionStorage.getItem('sid') || '' // Adjuntamos el SID en los headers
          }
        });
        return next(clonedReq);
      })
    );
  }
  return next(req);
};