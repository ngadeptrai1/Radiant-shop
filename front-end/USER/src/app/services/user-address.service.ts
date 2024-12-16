import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { UserAddress } from '../../type';

@Injectable({
  providedIn: 'root'
})
export class UserAddressService {
  endpoint = '/user-address';
  constructor(private apiService: ApiService, private authService: AuthService, private cookieService: CookieService  ) { }
  create(address: UserAddress): Observable<UserAddress> {
    if (!this.cookieService.check('USER_ID1')) {
      return throwError(() => new Error('User ID not found'));
    }
    const userId = this.cookieService.get('USER_ID1');
    return this.apiService.post<UserAddress>(`${this.endpoint}/user/${userId}`, address);
  }     

  update(address: UserAddress): Observable<UserAddress> {
    if (!this.cookieService.check('USER_ID1')) {
      return throwError(() => new Error('User ID not found'));
    }
    const userId = this.cookieService.get('USER_ID1');
    return this.apiService.put<UserAddress>(`${this.endpoint}/${address.id}`, address);
  }
  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }
  getAll(): Observable<UserAddress[]> {
    if (!this.cookieService.check('USER_ID1')) {
      return throwError(() => new Error('User ID not found'));
    }
    const userId = this.cookieService.get('USER_ID1');
    return this.apiService.get<UserAddress[]>(`${this.endpoint}/user/${userId}`);
  }
}
