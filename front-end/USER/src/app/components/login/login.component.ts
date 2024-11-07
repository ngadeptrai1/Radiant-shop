import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LocalStorage } from '../constans/constants';
import { LoginPayload } from '../../../type';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NgxSpinnerModule,
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    FooterComponent,
    HeaderComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  modalVisible: boolean = false;
  modalMessage: string = '';
  isLoading: boolean = false;
  form_si: any;

  constructor(
    private spinner: NgxSpinnerService,
    private si_form: NonNullableFormBuilder,
    private authService: AuthService,
    private matSnackBar: MatSnackBar,
    private router: Router
  ) {
    this.form_si = this.si_form.group({
      account_name: [
        '',
        [
          Validators.required,
          Validators.maxLength(12),
          Validators.minLength(6),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.maxLength(12),
          Validators.minLength(6),
        ],
      ],
    });
  }

  onModalClose(): void {
    this.modalVisible = false;
    this.modalMessage = '';
  }
  onSubmitLogin() {
    if (this.form_si.invalid) {
      this.form_si.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.showSpin();
    localStorage.removeItem(LocalStorage.token);
    this.authService.login(this.form_si.value as LoginPayload).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.isLoading = false;
        }, 5000);

        this.matSnackBar.open('Login Successfuly', '', { duration: 3000 });
        location.replace('/');
      },
      error: (err) => {
        this.matSnackBar.open(err.error.message);
      },
      complete: () => {
        console.log('ok');
      },
    });
  }

  private showSpin(): void {
    if (this.isLoading) {
      this.spinner.show();
    } else {
      this.spinner.hide();
    }
  }
}
