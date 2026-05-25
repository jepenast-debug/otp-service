import { CryptoUtils } from './crypto-utils';
import { Environment } from '../../../environments/environment';

describe('CryptoUtils', () => {

  // ==========================================
  // BLOQUE 1: Pruebas de Sanitización XSS
  // ==========================================
  describe('Método Sanitize', () => {
    
    it('debería eliminar etiquetas HTML y caracteres peligrosos de un string', () => {
      const input = '<script>alert("hacked");</script>';
      const result = CryptoUtils.Sanitize(input);
      
      // La expresión regular elimina < >, comillas y paréntesis
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('(');
      expect(result).not.toContain(';');
    });

    it('debería respetar los números y booleanos', () => {
      const input = { id: 123, isActive: true };
      const result = CryptoUtils.Sanitize(input);
      
      expect(result.id).toBe(123);
      expect(result.isActive).toBeTruthy();
    });

    it('debería limpiar recursivamente un objeto anidado', () => {
      const input = {
        user: 'Juan',
        profile: {
          bio: '<b>Developer</b>',
          tags: ['Angular', '<img src="x" onerror="alert()">']
        }
      };
      
      const result = CryptoUtils.Sanitize(input);
      
      expect(result.user).toBe('Juan');
      expect(result.profile.bio).not.toContain('<');
      expect(result.profile.tags[1]).not.toContain('<img');
    });
  });

  // ==========================================
  // BLOQUE 2: Pruebas del Motor Criptográfico
  // ==========================================
  describe('Cifrado y Descifrado Híbrido (AES-GCM / RSA-OAEP)', () => {
    
    // Generamos una llave RSA dinámica antes de correr los tests 
    // para sobreescribir el placeholder del Environment y evitar fallos.
    beforeAll(async () => {
      const keyPair = await window.crypto.subtle.generateKey(
        { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
        true,
        ['encrypt', 'decrypt']
      );
      const spki = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
      Environment.CERT = btoa(String.fromCharCode(...new Uint8Array(spki)));
    });

    it('debería encriptar el payload y retornar las llaves temporales', async () => {
      const payload = { account: '12345', amount: 500 };
      const result = await CryptoUtils.EncryptReq(payload);

      // Verificamos que generó la estructura correcta
      expect(result).toBeDefined();
      expect(result.SecPayload).toBeTruthy();
      expect(typeof result.SecPayload).toBe('string');
      
      // Verificamos que los objetos criptográficos existan en memoria
      expect(result.TmpKey.algorithm.name).toBe('AES-GCM');
      expect(result.TmpIV).toBeInstanceOf(Uint8Array);
      expect(result.TmpIV.length).toBe(12); // El IV de AES-GCM siempre debe ser de 12 bytes
    });

    it('debería lograr un ciclo completo de cifrado y descifrado (End-to-End)', async () => {
      const originalPayload = { message: 'Mensaje Altamente Secreto' };
      
      // 1. El Frontend encripta (Generando AES Key y IV dinámicos)
      const { SecPayload, TmpKey, TmpIV } = await CryptoUtils.EncryptReq(originalPayload);
      
      // 2. Desciframos usando el motor de respuesta, pasándole el SecPayload directamente
      // (tal como lo hace tu SecurityInterceptor)
      const decryptedResult = await CryptoUtils.DecryptResp(SecPayload, TmpKey, TmpIV);
      
      // 3. Verificamos que el mensaje recuperado sea exactamente el original
      expect(decryptedResult.message).toBe('Mensaje Altamente Secreto');
    });
  });

});