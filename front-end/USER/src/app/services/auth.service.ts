import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import {
  ApiResponse,
  LoginPayload,
  RegisterPayload,
  UserInterface,
} from '../../type';
import { map } from 'rxjs';
import { LocalStorage } from '../components/constans/constants';
import { jwtDecode } from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  registerUrl: string = 'auth/register';
  loginUrl: string = 'auth/authenticate';

  constructor(private service: ApiService, private cookie: CookieService) {}

  register(payload: RegisterPayload) {
    return this.service.post<ApiResponse<any>>(this.registerUrl, payload);
  }

  login(payload: LoginPayload) {
    return this.service
      .post<ApiResponse<UserInterface>>(this.loginUrl, payload)
      .pipe(
        map((response) => {
          if (response.token) {
            this.cookie.set('123', response.token);
            // localStorage.setItem(LocalStorage.token,response.token);
          }
          return response;
        })
      );
  }
  getToken(): string | null {
    console.log(this.cookie.get('123'));
    return this.cookie.get('123');
  }

  getDecodedToken(): any {
    const token = this.getToken();
    if (token) {
      return jwtDecode(token);
    }
    return null;
  }

  getUserId(): number {
    const decodedToken = this.getDecodedToken();
    return decodedToken ? decodedToken.sub : null;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    const decodedToken = this.getDecodedToken();
    const expirationDate = new Date(decodedToken.exp * 1000);
    return expirationDate > new Date();
  }

  logout(): void {
    this.cookie.delete('123');
  }
}
