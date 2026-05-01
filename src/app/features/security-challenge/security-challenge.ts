import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { StepperComp } from '../../shared/components/stepper/stepper';
import { AuthService } from '../../core/services/auth.service';
import { SessionService } from '../../core/services/session.service';
import { SecQuest } from '../../core/models/response';
import { ChallengeValidationReq, SecAnswerReq } from '../../core/models/request';
import { AuthStep } from '../../core/models/Enums';
import { Location } from '@angular/common'; 

interface SecQuestUI extends SecQuest {
  UserAnswer?: string;
}

@Component({
  selector: 'app-security-challenge',
  standalone: true,
  imports: [FormsModule, StepperComp, TranslateModule],
  templateUrl: './security-challenge.html',
  styleUrl: './security-challenge.scss'
})
export class SecurityChallengeComp implements OnInit {
  private AuthService = inject(AuthService);
  private SessionService = inject(SessionService);
  private Router = inject(Router);
  private Location = inject(Location);

  // Signals para el estado de la vista
  Questions = signal<SecQuestUI[]>([]);
  IsLoading = signal(false);
  ErrorMessage = signal('');

  ngOnInit(): void {
    this.LoadQuestions();
  }

  LoadQuestions(): void {
    const sid = this.SessionService.sid;
    const Step=this.SessionService.Step;

    if (!sid || Step !== AuthStep.SecChallenge) {
      this.Router.navigate(['/step1']);
      return;
    }

    this.IsLoading.set(true);
    this.AuthService.GetSecQuestions(sid,Step).subscribe({
      next: (Response) => {
        if (Response.success && Response.data.Questions) {
          this.Questions.set(Response.data.Questions);
        }
        this.IsLoading.set(false);
      },
      error: () => {
        this.IsLoading.set(false);
        this.ErrorMessage.set('Error al cargar las preguntas de seguridad.');
      }
    });
  }

  ValidateAnswers(): void {
    const sid = this.SessionService.sid;
    const Step=this.SessionService.Step;
    if (!sid || Step !== AuthStep.SecChallenge) return;

    // 1. Mapeamos las respuestas
    const Answers: SecAnswerReq[] = this.Questions().map(q => ({
      QuestId: q.Id,
      Answer: q.UserAnswer?.trim() || ''
    }));

    if (Answers.some(a => !a.Answer)) {
      this.ErrorMessage.set('Por favor, responda todas las preguntas.');
      return;
    }

    this.IsLoading.set(true);

    const request: ChallengeValidationReq = {
      UserId: sid,  //token de sesion, identifica al usuario
      Answers: Answers
    };

    this.AuthService.ValidateSecAnswers(sid,request,Step).subscribe({
      next: (response) => {
        if (response.success) {
          this.Router.navigate(['/step3']);
        } else {
          this.IsLoading.set(false);
          this.ErrorMessage.set('Respuestas incorrectas. Inténtelo de nuevo.');
        }
      },
      error: () => {
        this.IsLoading.set(false);
        this.ErrorMessage.set('Error de validación. Verifique sus respuestas.');
      }
    });
  }

   GoBack(): void {
    this.SessionService.SetStep(AuthStep.Ident)
    this.Location.back();
    // Alternativamente: this.router.navigate(['/step1']);
  }
}