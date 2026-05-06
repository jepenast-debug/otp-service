import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComp } from './layout/header/header';
import { FooterComp } from './layout/footer/footer';
import { LoadingComp } from './shared/components/loading/loading';
import { ToastComp } from './shared/components/toast/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    HeaderComp, 
    FooterComp,
    LoadingComp, 
    ToastComp
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly Title = signal('OTPService');
}