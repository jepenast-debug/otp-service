export interface ApiResp<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
  code: number;
}