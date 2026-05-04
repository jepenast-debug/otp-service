import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { from, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Environment } from '../../../environments/environment';

// --- FUNCIONES UTILITARIAS ---

// 1. Convierte Hexadecimal a Uint8Array
const HexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
};

// 2. Convierte Base64 a Uint8Array (Para el payload del backend)
const B64ToBytes = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// 3. Función asíncrona de desencriptación nativa
const Decrypt = async (EncrypB64: string): Promise<any> => {
  try {
    const EnvBytes = HexToBytes(Environment.AKI);
    const DecodedEnvString = new TextDecoder().decode(EnvBytes);

    const [KeyT, IvT] = DecodedEnvString.split(':');
    const KeyB = new TextEncoder().encode(KeyT);
    const IvB = new TextEncoder().encode(IvT);

    const EncrypBytes = B64ToBytes(EncrypB64);
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      KeyB as BufferSource,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    // Desencriptar
    const DecrypBuffer = await window.crypto.subtle.decrypt({
        name: 'AES-GCM',
        iv: IvB as BufferSource
      },
      cryptoKey,
      EncrypBytes as BufferSource
    );

    // Convertimos el buffer resultante a string y luego a JSON
    const DecrypString = new TextDecoder().decode(DecrypBuffer);
    return JSON.parse(DecrypString);

  } catch (error) {
    console.error('Fallo en la desencriptación AES-GCM. Verifica la llave, el IV o el Tag:', error);
    throw error;
  }
};

// --- EL INTERCEPTOR ---
export const SecurityInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    switchMap(event => {
      if (event instanceof HttpResponse && event.body) {
        const bodyData = event.body as any;
        const EncrypData = typeof event.body === 'string' ? event.body : bodyData.data;
        if (EncrypData) {
          return from(Decrypt(EncrypData)).pipe(
            map(decryptedBody => event.clone({ body: decryptedBody })),
            catchError(err => {
              // En caso de fallo, puedes decidir si retornar la respuesta cruda o lanzar un error
              return of(event);
            })
          );
        }
      }
      return of(event);
    })
  );
};