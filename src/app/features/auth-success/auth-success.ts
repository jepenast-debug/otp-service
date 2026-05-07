import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StepperComp } from '../../shared/components/stepper/stepper';
import { HandleSession } from '../../core/Handle/HandleSession';
import { Location } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-authentication-success',
  standalone: true,
  imports: [StepperComp,TranslateModule],
  templateUrl: './auth-success.html',
  styleUrl: './auth-success.scss'
})
export class AutheSuccessComp implements OnInit {
  private Router = inject(Router);
  private HandSession = inject(HandleSession);
  private Location = inject(Location);

  ngOnInit(): void {
    // Limpiamos la basura transaccional del flujo OTP
    this.HandSession.ClearSession();
  }

  GoToPage(): void {
    this.Location.go(this.HandSession.GetUrl()+"/otplogin");
  }
}