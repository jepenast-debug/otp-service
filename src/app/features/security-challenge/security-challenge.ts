import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { StepperComp } from '../../shared/components/stepper/stepper';

@Component({
  selector: 'app-security-challenge',
  standalone: true,
  imports: [FormsModule, TranslateModule, StepperComp],
  templateUrl: './security-challenge.html',
  styleUrl: './security-challenge.scss'
})
export class SecurityChallengeComp {
  // Lista de preguntas que vienen del backend (simulado)
  SecurityQuestions = signal([
    { id: 1, key: 'SEC.Question_1', answer: '' },
    { id: 2, key: 'SEC.Question_2', answer: '' }
  ]);

  IsLoading = signal(false);

  constructor(private router: Router) {}

  ValidateAnswers() {
    this.IsLoading.set(true);
    // Aquí iría la lógica para enviar las respuestas al API
    console.log('Respuestas enviadas:', this.SecurityQuestions());
  }

  GoBack() {
    this.router.navigate(['/step1']);
  }
}