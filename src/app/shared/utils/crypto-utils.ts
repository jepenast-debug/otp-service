import { Environment } from '../../../environments/environment';

export class CryptoUtils {
  // --- SANITIZACIÓN ---
  static Sanitize(payload: any): any {
    if (typeof payload === 'string') {
      return payload.replace(/<[^>]*>?/gm, '').replace(/[<>;"\(\)]/g, '').trim();
    }
    if (Array.isArray(payload)) return payload.map(item => this.Sanitize(item));
    if (payload !== null && typeof payload === 'object') {
      const Sanitized: any = {};
      for (const key in payload) {
        if (Object.prototype.hasOwnProperty.call(payload, key)) {
          Sanitized[key] = this.Sanitize(payload[key]);
        }
      }
      return Sanitized;
    }
    return payload;
  }

  // --- CIFRADO HÍBRIDO (CLIENTE -> SERVER) ---
  static async EncryptReq(payload: any): Promise<string> {
    const Enc = new TextEncoder();
    const DBytes = Enc.encode(JSON.stringify(this.Sanitize(payload)));

    // AES-GCM
    const IV = window.crypto.getRandomValues(new Uint8Array(12));
    const AKey = await window.crypto.subtle.generateKey({ 
        name: 'AES-GCM', 
        length: 256 
    }, true, ['encrypt']);
    const EncryptData = await window.crypto.subtle.encrypt({ 
        name: 'AES-GCM', 
        iv:IV }, AKey, DBytes);

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

    const FinalJson = JSON.stringify({ data: this.BufferToB64(EncryptData), CE: this.BufferToB64(EncryptCE) });
    return btoa(unescape(encodeURIComponent(FinalJson)));
  }

  // --- DESCIFRADO (SERVER -> CLIENTE) ---
  static async DecryptResp(encryptedB64: string): Promise<any> {
    const CleanB64 = encryptedB64.replace(/^"|"$/g, '');
    const DecodedEnv = new TextDecoder().decode(this.HexToBytes(Environment.AKI));

    // Partición: Salt (24) | Key (32) | IV (Resto)
    const KeyBytes = new TextEncoder().encode(DecodedEnv.substring(24, 56));
    const IVBytes = new TextEncoder().encode(DecodedEnv.substring(56));
    const CryptoKey = await window.crypto.subtle.importKey('raw', KeyBytes, { 
        name: 'AES-GCM' }, 
        false, ['decrypt']);
    const Decrypted = await window.crypto.subtle.decrypt({ 
        name: 'AES-GCM', 
        iv: IVBytes 
    }, CryptoKey, this.B64ToBuffer(CleanB64));

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