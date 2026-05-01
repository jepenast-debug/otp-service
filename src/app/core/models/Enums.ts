// --- ENUMS ---
export enum AuthStep {
  Ident = 1,
  SecChallenge = 2,
  OtpValidation = 3,
  MfaSetup = 4,
  AccessGranted = 5
}

export enum MfaType {
  Email = 'EMAIL',
  AuthApp = 'APP'
}