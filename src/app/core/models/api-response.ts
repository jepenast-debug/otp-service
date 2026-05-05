export interface ApiResp<T> {
  msg: string;
  data: T;
  err?: string[];
  code: number;
}