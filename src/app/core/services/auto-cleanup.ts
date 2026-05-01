import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class CleanupService {
  private Router = inject(Router);

  StartTimer(): void {
    setTimeout(() => {
      sessionStorage.clear();
      this.Router.navigate(['/step1']);
      alert('La sesión ha expirado por inactividad (5 min).');
    }, 300000); 
  }
}