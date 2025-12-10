// src/app/app.config.ts

// MUDANÇA 1: Importar o provider de Zona
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http'; 

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(), 
    provideRouter(routes),
    provideHttpClient()
  ]
};