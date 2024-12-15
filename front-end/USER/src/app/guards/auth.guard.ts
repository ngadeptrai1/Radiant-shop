import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); // Inject AuthService
  const router = inject(Router);          // Inject Router

  if (authService.isAuthenticated()) {
    return true; // Người dùng đã đăng nhập, cho phép truy cập
  } else {
    // Chuyển hướng đến trang login nếu chưa đăng nhập
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url } // Lưu lại đường dẫn để quay lại sau khi đăng nhập
    });
    return false;
  }
};
