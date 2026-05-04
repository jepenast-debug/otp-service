import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { StepperComp } from '../../shared/components/stepper/stepper';
import { AuthService } from '../../core/services/auth.service';
import { SecQuest } from '../../core/models/response';
import { ChallengeValidationReq, SecAnswerReq } from '../../core/models/request';
import { AuthStep } from '../../core/models/Enums';
import { HandleSession } from '../../core/Handle/HandleSession';

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
  private Router = inject(Router);
  private HandSession = inject(HandleSession);

  // Signals para el estado de la vista
  Questions = signal<SecQuestUI[]>([]);
  IsLoading = signal(false);
  ErrorMessage = signal('');

  ngOnInit(): void {
    this.LoadQuestions();
  }

  LoadQuestions(): void {
     if (!this.HandSession.CheckStep(AuthStep.SecChallenge)) {
      return;
    }

    this.IsLoading.set(true);
    this.AuthService.GetSecQuestions().subscribe({
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
    if (this.HandSession.CheckStep(AuthStep.SecChallenge)) {
      return;
    }

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
      UserId: this.HandSession.GetSid(),
      Answers: Answers
    };

    this.AuthService.ValidateSecAnswers(request).subscribe({
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
    this.HandSession.MoveStep(AuthStep.Ident);
    // Alternativamente: this.router.navigate(['/step1']);
  }
}