import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { PaginationParams, Product, Products, WishlistItem } from '../../type';
import { Observable, of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { CookieService } from 'ngx-cookie-service';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  endpoint = '/wishlist';

  constructor(private apiService: ApiService, private authService: AuthService, private cookieService: CookieService) { }

  addToWishlist(productId: number): Observable<WishlistItem> {
    if (!this.cookieService.check('USER_ID')) {
      return throwError(() => new Error('Vui lòng đăng nhập để sử dụng tính năng này'));
    }
    const userId = this.cookieService.get('USER_ID');
    return this.apiService.post<WishlistItem>(`${this.endpoint}/${userId}/${productId}`, {}).pipe(
      catchError(error => throwError(() => error))
    );
  }
  deleteFromWishlist(productId: number): Observable<void> {
    if (!this.cookieService.check('USER_ID')) {
      return throwError(() => new Error('Vui lòng đăng nhập để sử dụng tính năng này'));
    }
    const userId = this.cookieService.get('USER_ID');
    return this.apiService.delete<void>(`${this.endpoint}/${userId}/${productId}`).pipe(
      catchError(error => throwError(() => error))
    );
  }
  isInWishlist(productId: number): Observable<boolean> {
    if (!this.cookieService.check('USER_ID')) {
      return of(false);
    }
    const userId = this.cookieService.get('USER_ID');
    return this.apiService.get<boolean>(`${this.endpoint}/${userId}/${productId}`);
  }
  getProducts(userId:string) :Observable<Product[]>{
    return this.apiService.get<Product[]>(this.endpoint+'/product/'+userId);
  }
}
