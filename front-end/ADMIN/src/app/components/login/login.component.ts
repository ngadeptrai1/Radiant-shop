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
  showModal = false;
  modalMessage = '';
  modalClass = '';
  modalIcon = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.loginData.username && this.loginData.password) {
      this.authService.login(this.loginData).subscribe({
        next: (response) => {
          if (response) {
            this.showSuccessModal();
            // Reset form
            this.loginData = {
              username: '',
              password: ''
            };
            this.errorMessage = '';
            
            // Chuyển hướng sau 2 giây
            setTimeout(() => {
              this.hideModal();
              this.router.navigate(['/']);
            }, 2000);
          }
        },
        error: (error) => {
          this.showErrorModal(error);
        }
      });
    }
  }

  private showSuccessModal() {
    this.modalMessage = 'Đăng nhập thành công!';
    this.modalClass = 'text-success';
    this.modalIcon = 'fas fa-check-circle fa-3x';
    this.showModal = true;
  }

  private showErrorModal(error: any) {
    this.modalMessage = error.status === 401 
      ? 'Tên đăng nhập hoặc mật khẩu không chính xác'
      : 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
    this.modalClass = 'text-danger';
    this.modalIcon = 'fas fa-times-circle fa-3x';
    this.showModal = true;

    // Tự động ẩn modal lỗi sau 2 giây
    setTimeout(() => {
      this.hideModal();
    }, 2000);
  }

  private hideModal() {
    this.showModal = false;
  }
}
