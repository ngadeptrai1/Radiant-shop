import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    // Nếu đã authenticated, cho phép truy cập
    if (this.authService.isAuthenticated()) {
      return of(true);
    }

    // Thử initialize authentication
    return this.authService.initializeAuthentication().pipe(
      map(isAuthenticated => {
        if (!isAuthenticated) {
          const currentUrl = window.location.pathname;
          if (currentUrl != '/login') {
            this.router.navigate(['/login'], { 
              queryParams: { returnUrl: currentUrl }
            });
          }
          return false;
        }
        return true;
      })
    );
  }
} 