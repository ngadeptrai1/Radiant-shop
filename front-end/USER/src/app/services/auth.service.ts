import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, throwError, firstValueFrom } from 'rxjs';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { AuthResponse, LoginDto, RegisterDto, User } from '../../type';
import { ApiService } from './api.service';



@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  endpoint = '/auth';
  constructor(private apiService: ApiService, private cookieService: CookieService) {
    this.initializeAuthentication();
  }

  private initializeAuthentication() {
    if (this.cookieService.check('ACCESS_TOKEN1') && this.cookieService.check('USER_ID1')) {
      this.loadCurrentUser().subscribe({
        next: (user) => {
          this.currentUserSubject.next(user);
        },
        error: async (error) => {
          if (error.status === 401 && this.cookieService.check('REFRESH_TOKEN1')) {
            try {
              const refreshResult = await firstValueFrom(this.refreshToken());
              if (refreshResult) {
                this.loadCurrentUser().subscribe({
                  next: (user) => this.currentUserSubject.next(user),
                  error: () => this.handleAuthError()
                });
              }
            } catch {
              this.handleAuthError();
            }
          } else {
            this.handleAuthError();
          }
        }
      });
    } else {
      this.handleAuthError();
    }
  }

  private loadCurrentUser(): Observable<User> {
    const userId = this.cookieService.get('USER_ID1');
    return this.apiService.get<User>(`${this.endpoint}/users/${userId}`).pipe(
      tap(user => {
        if (user) {
          this.currentUserSubject.next(user);
        }
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  private handleAuthError() {
    this.logout();
  }

  register(registerDto: RegisterDto): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>(`${this.endpoint}/register`, registerDto);
  }
  login(loginDto: LoginDto): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>(`${this.endpoint}/login`, loginDto).pipe(
      tap(response => {
        this.cookieService.set('ACCESS_TOKEN1', response.accessToken);
        this.cookieService.set('REFRESH_TOKEN1', response.refreshToken);
        this.cookieService.set('USER_ID1', response.userId.toString());
        this.loadCurrentUser().subscribe();
      })
    );
  }
  getAccessToken(): Observable<string> {
    return this.apiService.get<string>(`${this.endpoint}/refresh-token`);
  }

  getUser(): Observable<User> {
    if (!this.cookieService.check('USER_ID1')) {
      return throwError(() => new Error('User ID not found'));
    }
    const userId = this.cookieService.get('USER_ID1');
    return this.apiService.get<User>(`${this.endpoint}/users/${userId}`);
  }
  changePassword(newPassword: string): Observable<void> {
    if (!this.cookieService.check('USER_ID1')) {
      return throwError(() => new Error('User ID not found'));
    }
    const userId = this.cookieService.get('USER_ID1');
    return this.apiService.post<void>(`${this.endpoint}/user/${userId}/change-password`, { newPassword });
  }
  logout() {
    this.cookieService.delete('ACCESS_TOKEN1', '/');
    this.cookieService.delete('REFRESH_TOKEN1', '/');
    this.cookieService.delete('USER_ID1', '/');
    this.currentUserSubject.next(null);
  }

  checkUsernameExists(username: string): Observable<boolean> {
    return this.apiService.get<boolean>(`${this.endpoint}/check-username/${username}`);
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.apiService.get<boolean>(`${this.endpoint}/check-email/${email}`);
  }

  isAuthenticated(): boolean {
    return this.cookieService.check('ACCESS_TOKEN1') && 
           this.cookieService.check('USER_ID1') && 
           !!this.currentUserSubject.value;
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.cookieService.get('REFRESH_TOKEN1');
    return this.apiService.post<AuthResponse>(`${this.endpoint}/refresh-token`, { refreshToken }).pipe(
      tap(response => {
        this.cookieService.set('ACCESS_TOKEN1', response.accessToken);
        this.cookieService.set('REFRESH_TOKEN1', response.refreshToken);
      })
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
