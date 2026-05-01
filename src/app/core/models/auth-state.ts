import { AuthStep, MfaType } from './Enums';

export interface AuthState {
  CurrentStep: AuthStep;
  UserId: string | null;
  SelectedMfaType: MfaType | null;
  IsLoading: boolean;
  Error: string | null;
}