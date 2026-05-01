import { MfaType } from './Enums';

// --- INTERFACES DE PETICIÓN (Requests) ---
export interface IdentReq {
  UserID: string;
}

export interface SecAnswerReq {
  QuestId: number;
  Answer: string;
}

export interface ChallengeValidationReq {
  UserId: string;
  Answers: SecAnswerReq[];
}

export interface OtpValidationReq {
  UserId: string;
  Code: string;
  MfaType: MfaType;
}