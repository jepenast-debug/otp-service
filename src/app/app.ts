import { Component, signal, inject, OnInit, Renderer2,Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Environment } from '../environments/environment';
import { CleanupService } from './core/services/auto-cleanup';
import { HeaderComp } from './layout/header/header';
import { FooterComp } from './layout/footer/footer';
import { LoadingComp } from './shared/components/loading/loading';
import { ToastComp } from './shared/components/toast/toast';
import { LanguageService } from './core/services/language.service';

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
export class App implements OnInit{
  protected readonly Title = signal('OTPService');
  private LangService = inject(LanguageService);
  private CleanupService = inject(CleanupService);

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    this.LangService.InitLanguage(); 
    this.loadReCaptcha();
     this.CleanupService.StartTimer();
  }

  private loadReCaptcha() {
    const script = this.renderer.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${Environment.ReCaptSiteKey}`;
    script.async = true;
    script.defer = true;

    this.renderer.appendChild(this.document.head, script);
  }

}