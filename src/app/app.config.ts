import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { SecurityInterceptor } from './core/interceptors/security.interceptor';
import { routes } from './app.routes';
//Traductores
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader, TranslateHttpLoader } from '@ngx-translate/http-loader';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([SecurityInterceptor]) //Se interceptan las respuestas para desencriptarlas antes de que lleguen a los servicios.
    ),
    provideTranslateService({
      defaultLanguage: 'es'
    }),
    provideTranslateService({
      fallbackLang: 'es',
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/', 
        suffix: '.json'
      })
    })
  ]
};