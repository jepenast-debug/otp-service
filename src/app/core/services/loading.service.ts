import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
 
  IsLoading = signal<boolean>(false);

  Show(): void {
    this.IsLoading.set(true);
  }

  Hide(): void {
    this.IsLoading.set(false);
  }
}