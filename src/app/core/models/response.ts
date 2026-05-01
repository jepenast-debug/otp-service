import { AuthStep, MfaType } from './Enums';

// --- INTERFACES DE RESPUESTA (Responses) ---
export interface IdentResp {
  UserId: string;
  NextStep: AuthStep;
  IsMfaEnabled: boolean;
  SId: string;
}

export interface SecQuest {
  Id: number;
  Key: string; // La llave para ngx-translate (ej: 'SECURITY.Q_PET')
}

export interface SecChallengeResp {
  UserId: string;
  Questions: SecQuest[];
}

export interface MfaSetupResp {
  QRUri: string;         // otpauth://totp/...
  ManualSecret: string;  // Por si el usuario no puede escanear el QR
  BackupCodes: string[]; // Códigos de recuperación
}

export interface DeliveryResp{
  Email: string;
  HasApp: boolean;
}

export interface AuthSuccessResp {
  AccessToken: string;
  RefreshToken: string;
  expiresIn: number;
  user: {
    Id: string;
    FullName: string;
    Email: string;
    Roles: string[];
  };
  Cookies: string[]; // Para almacenar en el navegador
  UrlReturn: string;
}