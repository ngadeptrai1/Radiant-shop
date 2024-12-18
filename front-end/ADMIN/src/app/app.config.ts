import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { provideLuxonDateAdapter } from '@angular/material-luxon-adapter';
import { AuthInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
     provideRouter(routes),
     provideAnimationsAsync(),
     provideHttpClient(),
     provideLuxonDateAdapter(),
     { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
    ]
};