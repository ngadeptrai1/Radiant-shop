import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ModalService } from '../../services/modal.service';
import { ModalComponent } from '../shared/modal/modal.component';
import { Observable, of, catchError, map } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cookieService: CookieService,
    private modalService: ModalService
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)], this.checkUsernameAvailability.bind(this)],
      email: ['', [Validators.required, Validators.email], this.checkEmailAvailability.bind(this)],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/) // Ít nhất 1 chữ và 1 số
      ]],
      rePassword: ['', Validators.required],
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNum: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    }, { validator: this.passwordMatchValidator });
  }

  onRegister() {
    if (this.registerForm.invalid || this.isLoading) return;

    this.isLoading = true;
    const registerData = this.registerForm.value;

    this.authService.register(registerData).subscribe({
      next: () => {
        this.modalService.showModal({
          title: 'Đăng ký thành công',
          message: 'Chào mừng bạn đến với hệ thống của chúng tôi!',
          type: 'success'
        });

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      },
      error: (error) => {
        this.modalService.showModal({
          title: 'Lỗi đăng ký',
          message: error.message || 'Đã có lỗi xảy ra khi đăng ký',
          type: 'error'
        });
        this.isLoading = false;
      }
    });
  }

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const rePassword = group.get('rePassword')?.value;
    return password === rePassword ? null : { mismatch: true };
  }

  // Kiểm tra username có sẵn
  private checkUsernameAvailability(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.authService.checkUsernameExists(control.value).pipe(
      map(exists => exists ? { usernameExists: true } : null),
      catchError(() => of(null))
    );
  }

  // Kiểm tra email có sẵn
  private checkEmailAvailability(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.authService.checkEmailExists(control.value).pipe(
      map(exists => exists ? { emailExists: true } : null),
      catchError(() => of(null))
    );
  }
}
