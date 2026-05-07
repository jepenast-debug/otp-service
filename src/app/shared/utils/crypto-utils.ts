import { Environment } from '../../../environments/environment';
import DOMPurify from 'dompurify';

export class CryptoUtils {

  static Sanitize(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }
    if (typeof data === 'string') {
      return DOMPurify.sanitize(data, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    }
    if (Array.isArray(data)) {
      return data.map(item => this.Sanitize(item));
    }
    if (typeof data === 'object') {
      const sanitizedObj: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitizedObj[key] = this.Sanitize(value);
      }
      return sanitizedObj;
    }
    return data;
  }

  // --- CIFRADO HÍBRIDO (CLIENTE -> SERVER) ---
  static async EncryptReq(payload: any): Promise<{ SecPayload: string, TmpKey: CryptoKey, TmpIV: Uint8Array }> {
    const Enc = new TextEncoder();
    const DBytes = Enc.encode(JSON.stringify(this.Sanitize(payload)));

    // AES-GCM
    const IV = window.crypto.getRandomValues(new Uint8Array(12));
    const AKey = await window.crypto.subtle.generateKey({ 
        name: 'AES-GCM', 
        length: 256 
    }, true, ['encrypt','decrypt']);

    const EncryptData = await window.crypto.subtle.encrypt({ 
        name: 'AES-GCM',iv:IV 
      }, 
      AKey, 
      DBytes
    );

    // RSA-OAEP para proteger las llaves
    const RawAesKey = await window.crypto.subtle.exportKey('raw', AKey);
    const RSAPubKey = await window.crypto.subtle.importKey(
      'spki', this.B64ToBuffer(Environment.CERT), { 
            name: 'RSA-OAEP', 
            hash: 'SHA-256' 
        }, false, ['encrypt']
    );

    const KeysObj = { k: this.BufferToB64(RawAesKey), i: this.BufferToB64(IV.buffer) };
    const EncryptCE = await window.crypto.subtle.encrypt({ 
        name: 'RSA-OAEP' }, 
        RSAPubKey, 
        Enc.encode(JSON.stringify(KeysObj)
    ));

    const Json = JSON.stringify({ data: this.BufferToB64(EncryptData), CE: this.BufferToB64(EncryptCE) });
    const SecPayload=btoa(unescape(encodeURIComponent(Json)));
    return { SecPayload, TmpKey: AKey, TmpIV: IV };
  }

  // --- DESCIFRADO (SERVER -> CLIENTE) ---
  static async DecryptResp(EncryptB64: string, TmpKey:CryptoKey,TmpIv:Uint8Array): Promise<any> {
    const CleanB64 = EncryptB64.replace(/^"|"$/g, '');
    //const DecodedEnv = new TextDecoder().decode(this.HexToBytes(Environment.AKI));

    const Decrypted = await window.crypto.subtle.decrypt({ 
        name: 'AES-GCM', 
        iv: TmpIv as BufferSource
      }, 
      TmpKey, 
      this.B64ToBuffer(CleanB64));
    return JSON.parse(new TextDecoder().decode(Decrypted));
  }

  // --- HELPERS ---
  private static HexToBytes(hex: string): Uint8Array {
    const Bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) Bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    return Bytes;
  }

  private static B64ToBuffer(b64: string): ArrayBuffer {
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;
  }

  private static BufferToB64(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }
}