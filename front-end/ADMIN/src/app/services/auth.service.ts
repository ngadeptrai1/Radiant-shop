import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, throwError, firstValueFrom, map, switchMap } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { AuthResponse, LoginDto, User, UserResponse } from '../../type';
import { ApiService } from './api-service.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  endpoint = 'auth';
  constructor(private apiService: ApiService, private cookieService: CookieService  ) {
    this.initializeAuthentication();
  }

  initializeAuthentication(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      if (this.cookieService.check('REFRESH_TOKEN')) {
        this.refreshToken().pipe(
          switchMap(() => this.loadCurrentUser()),
          tap(user => {
            this.currentUserSubject.next(user);
            observer.next(true);
            observer.complete();
          }),
          catchError(() => {
            // Nếu refresh thất bại, kiểm tra access token
            if (this.cookieService.check('ACCESS_TOKEN') && this.cookieService.check('USER_ID')) {
              return this.loadCurrentUser().pipe(
                tap(user => {
                  this.currentUserSubject.next(user);
                  observer.next(true);
                  observer.complete();
                })
              );
            }
            throw new Error('Authentication failed');
          })
        ).subscribe({
          error: () => {
            this.handleAuthError();
            observer.next(false);
            observer.complete();
          }
        });
      } else if (this.cookieService.check('ACCESS_TOKEN') && this.cookieService.check('USER_ID')) {
        this.loadCurrentUser().subscribe({
          next: (user) => {
            this.currentUserSubject.next(user);
            observer.next(true);
            observer.complete();
          },
          error: () => {
            this.handleAuthError();
            observer.next(false);
            observer.complete();
          }
        });
      } else {
        this.handleAuthError();
        observer.next(false);
        observer.complete();
      }
    });
  }

  private loadCurrentUser(): Observable<User> {
    const userId = this.cookieService.get('USER_ID');
    return this.apiService.get<UserResponse>(`${this.endpoint}/users/${userId}`).pipe(
      map((userResponse: UserResponse) => ({
        id: userResponse.id,
        username: userResponse.username,
        email: userResponse.email,
        fullName: userResponse.fullName,
        phoneNumber: userResponse.phoneNumber
      }))
    );
  }

  private handleAuthError() {
    this.cookieService.delete('ACCESS_TOKEN', '/');
    this.cookieService.delete('REFRESH_TOKEN', '/');
    this.cookieService.delete('USER_ID', '/');
    this.currentUserSubject.next(null);
  }

  login(loginDto: LoginDto): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>(`${this.endpoint}/login`, loginDto).pipe(
      tap(response => {
        this.cookieService.set('ACCESS_TOKEN', response.accessToken);
        this.cookieService.set('REFRESH_TOKEN', response.refreshToken);
        this.cookieService.set('USER_ID', response.userId.toString());
        this.loadCurrentUser().subscribe({
          error: (error) => {
            this.handleAuthError();
            return throwError(() => error);
          }
        });
      }),
      catchError(error => throwError(() => error))
    );
  }
  getAccessToken(): Observable<string> {
    return this.apiService.get<string>(`${this.endpoint}/refresh-token`);
  }

  getUser(): Observable<User> {
    if (!this.cookieService.check('USER_ID')) {
      return throwError(() => new Error('User ID not found'));
    }
    const userId = this.cookieService.get('USER_ID');
    return this.apiService.get<UserResponse>(`${this.endpoint}/users/${userId}`).pipe(
      map((userResponse: UserResponse) => ({
        id: userResponse.id,
        username: userResponse.username,
        email: userResponse.email,
        fullName: userResponse.fullName,
        phoneNumber: userResponse.phoneNumber
      })),
      catchError(error => throwError(() => error))
    );
  }
  changePassword(newPassword: string): Observable<void> {
    if (!this.cookieService.check('USER_ID')) {
      return throwError(() => new Error('User ID not found'));
    }
    const userId = this.cookieService.get('USER_ID');
    return this.apiService.post<void>(`${this.endpoint}/user/${userId}/change-password`, { newPassword });
  }
  logout() {
    this.cookieService.delete('ACCESS_TOKEN', '/');
    this.cookieService.delete('REFRESH_TOKEN', '/');
    this.cookieService.delete('USER_ID', '/');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.cookieService.check('ACCESS_TOKEN') && 
           this.cookieService.check('USER_ID') && 
           this.currentUserSubject.value !== null;
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.cookieService.get('REFRESH_TOKEN');
    return this.apiService.post<AuthResponse>(`${this.endpoint}/refresh-token`, { refreshToken }).pipe(
      tap(response => {
        this.cookieService.set('ACCESS_TOKEN', response.accessToken);
        this.cookieService.set('REFRESH_TOKEN', response.refreshToken);
        this.cookieService.set('USER_ID', response.userId.toString());
      }),
      catchError(error => {
        this.handleAuthError();
        return throwError(() => error);
      })
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
