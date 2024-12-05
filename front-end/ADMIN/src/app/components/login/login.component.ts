import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { LoginDto } from '../../../type';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginData: LoginDto = {
    username: '',
    password: ''
  };
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.loginData.username && this.loginData.password) {
      this.authService.login(this.loginData).subscribe({
        next: (response) => {
          if (response) {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          if (error.status === 401) {
            this.errorMessage = 'Tên đăng nhập hoặc mật khẩu không chính xác';
          } else {
            this.errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
          }
          console.error('Login error:', error);
        }
      });
    }
  }
}
