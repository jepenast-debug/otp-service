import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HandleSession } from '../Handle/HandleSession';

@Injectable({ providedIn: 'root' })
export class CleanupService {
  private Router = inject(Router);
  private HandSession = inject(HandleSession);
  private TimeoutId: any;
  private readonly INACTIVITY_TIME = 300000; // 5 minutos

  StartTimer(): void {
    this.ResetTimer();
    // Escuchar eventos globales de actividad del usuario
    window.addEventListener('mousemove', () => this.ResetTimer());
    window.addEventListener('keydown', () => this.ResetTimer());
    window.addEventListener('click', () => this.ResetTimer());
  }

  private ResetTimer(): void {
    if (this.TimeoutId) clearTimeout(this.TimeoutId);
    
    this.TimeoutId = setTimeout(() => {
      this.Logout();
    }, this.INACTIVITY_TIME);
  }

  private Logout(): void {
    // Limpiar escuchadores para evitar fugas de memoria
    window.removeEventListener('mousemove', () => this.ResetTimer());
    window.removeEventListener('keydown', () => this.ResetTimer());
    window.removeEventListener('click', () => this.ResetTimer());

    this.HandSession.ClearAllStorage();
    this.Router.navigate(['/step1']);
    alert('Tu sesión ha expirado por inactividad.');
  }
}