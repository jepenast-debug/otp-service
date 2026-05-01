import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mask',
  standalone: true
})
export class MaskPipe implements PipeTransform {
  transform(value: string | undefined | null, type: 'email' | 'phone' | 'text' = 'email'): string {
    if (!value) return '';

    if (type === 'email') {
      const parts = value.split('@');
      if (parts.length !== 2) return value; // Si no es un correo válido, lo devuelve intacto
      
      const user = parts[0];
      const domain = parts[1];
      
      // Deja la primera y última letra del usuario visibles
      const maskedUser = user.length > 2 
        ? user[0] + '*'.repeat(user.length - 2) + user[user.length - 1]
        : user[0] + '*';
        
      return `${maskedUser}@${domain}`;
    }

    if (type === 'phone') {
      // Oculta todo excepto los últimos 4 dígitos
      const visibleDigits = 4;
      if (value.length <= visibleDigits) return value;
      return '*'.repeat(value.length - visibleDigits) + value.slice(-visibleDigits);
    }

    // Comportamiento por defecto (text)
    return value.length > 4 
      ? value.slice(0, 2) + '*'.repeat(value.length - 4) + value.slice(-2)
      : '*'.repeat(value.length);
  }
}