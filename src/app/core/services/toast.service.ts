import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  text: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root'
})

export class ToastService {
  CurrentToast = signal<ToastMessage | null>(null);
  private TimeoutId: any;

  Show(text: string, type: ToastType = 'info'): void {
    this.CurrentToast.set({ text, type });
    
    if (this.TimeoutId) clearTimeout(this.TimeoutId);
    this.TimeoutId = setTimeout(() => {
      this.Hide();
    }, 5000);
  }

  Hide(): void {
    this.CurrentToast.set(null);
  }
}