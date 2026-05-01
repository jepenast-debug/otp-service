import { HttpInterceptorFn } from '@angular/common/http';
import { Environment } from '../../../environments/environment';
import * as CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';

export const EncryptionInterceptor: HttpInterceptorFn = (Req, Next) => {

  // Solo interceptamos peticiones que envían datos (POST, PUT, PATCH)
  if (Req.body) {
    
    // 1. Generar una Clave AES dinámica y única para esta transacción (256-bit)
    const DynamicAesKey = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Base64);

    // 2. Encriptar el cuerpo de la petición (Payload) usando la clave dinámica AES
    const EncryptedPayload = CryptoJS.AES.encrypt(
      JSON.stringify(Req.body),
      DynamicAesKey
    ).toString();

    // 3. Encriptar la Clave Dinámica AES usando la Clave Pública (RSA)
    const RsaEncryptor = new JSEncrypt();
    RsaEncryptor.setPublicKey(Environment.CERT);
    const EncryptedSecret = RsaEncryptor.encrypt(DynamicAesKey);

    if (!EncryptedSecret) {
      throw new Error('Fallo crítico: No se pudo generar el envoltorio RSA.');
    }

    // 4. Reemplazar el cuerpo original con los datos seguros
    const ClonedRequest = Req.clone({
      body: {
        Data: EncryptedPayload, // Los datos cifrados (soporta gigabytes de peso)
        Key: EncryptedSecret    // La llave para abrirlos (pequeña y super segura)
      }
    });

    return Next(ClonedRequest);
  }

  // Si es un GET, pasa derecho sin alteraciones
  return Next(Req);
};