// --- ENUMS ---
export enum AuthStep {
  NULLABLE=0,
  Ident = 1,
  SecChallenge = 2,
  Delivery=3,
  OtpValidation = 4,
  MfaSetup = 5,
  AccessGranted = 6
}

export enum MfaType {
  Email = 'EMAIL',
  AuthApp = 'APP'
}