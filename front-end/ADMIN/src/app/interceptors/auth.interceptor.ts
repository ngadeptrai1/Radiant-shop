import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private cookieService: CookieService,
    private snackBar: MatSnackBar, // Dùng để hiển thị thông báo
    private router: Router // Chuyển hướng khi cần
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const accessToken = this.cookieService.get('ACCESS_TOKEN');

    if (accessToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Xử lý lỗi "chưa đăng nhập"
          this.snackBar.open('Bạn chưa đăng nhập. Vui lòng đăng nhập!', 'Đóng', {
            duration: 3000,
          });
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          // Xử lý lỗi "không đủ quyền"
          this.snackBar.open('Bạn không có quyền truy cập!', 'Đóng', {
            duration: 3000,
          });
        } else {
          // Xử lý các lỗi khác
          this.snackBar.open('Đã xảy ra lỗi. Vui lòng thử lại!', 'Đóng', {
            duration: 3000,
          });
        }

        return throwError(() => error); // Trả lỗi để các phần khác xử lý nếu cần
      })
    );
  }
}
