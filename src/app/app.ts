import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComp } from './layout/header/header';
import { FooterComp } from './layout/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    HeaderComp, 
    FooterComp
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly Title = signal('OTPService');
}