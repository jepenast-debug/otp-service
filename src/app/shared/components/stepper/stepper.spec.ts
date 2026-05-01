import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stepper',
  standalone: true,
  templateUrl: './stepper.html',
  styleUrl: './stepper.scss'
})
export class StepperComponent {
  // Recibimos el paso actual desde el componente padre (por defecto el paso 1)
  CurrentStep = input<number>(1);

  // Definimos los pasos con los nuevos nombres SaaS
  Steps = [
    { Id: 1, Label: 'Identificación' },
    { Id: 2, Label: 'Desafío de Seguridad' },
    { Id: 3, Label: 'Método de Envío' },
    { Id: 4, Label: 'Validación de Código' },
    { Id: 5, Label: 'Acceso Concedido' }
  ];
}