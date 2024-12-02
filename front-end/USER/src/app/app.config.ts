import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { IMAGE_LOADER } from '@angular/common';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: IMAGE_LOADER,
      useValue: (config: { src: string }) => {
        return config.src;
      },
    },
    provideAnimations(),
  ],
};
