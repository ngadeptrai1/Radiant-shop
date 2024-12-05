import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { UserResponse, UserRequest } from '../../../../type';
import { MatProgressSpinnerModule, MatSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSpinner
  ],
  template: `
    <h2 mat-dialog-title>{{data.user ? 'Sửa' : 'Thêm'}} {{translateType(data.type)}}</h2>
    <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
      <div mat-dialog-content>
        <mat-form-field appearance="outline">
          <mat-label>Họ tên</mat-label>
          <input matInput formControlName="fullName" required>
          <mat-error>{{getErrorMessage('fullName')}}</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email">
          <mat-hint>Không bắt buộc</mat-hint>
          <mat-error>{{getErrorMessage('email')}}</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Số điện thoại</mat-label>
          <input matInput formControlName="phoneNumber" required>
          <mat-hint>Định dạng: 10 số</mat-hint>
          <mat-error>{{getErrorMessage('phoneNumber')}}</mat-error>
        </mat-form-field>

        @if (data.type === 'Staff') {
          <mat-form-field appearance="outline">
            <mat-label>Vai trò</mat-label>
            <mat-select formControlName="role" required>
              @for (role of data.roles; track role) {
                <mat-option [value]="role">{{translateRole(role)}}</mat-option>
              }
            </mat-select>
            <mat-error>{{getErrorMessage('role')}}</mat-error>
          </mat-form-field>

          @if (!data.user) {
            <mat-form-field appearance="outline">
              <mat-label>Mật khẩu</mat-label>
              <input matInput formControlName="password" type="password" required>
              <mat-hint>Tối thiểu 6 ký tự, bao gồm chữ và số</mat-hint>
              <mat-error>{{getErrorMessage('password')}}</mat-error>
            </mat-form-field>
          }
        }
      </div>

      <div mat-dialog-actions align="end">
        <button mat-button type="button" [disabled]="isLoading" (click)="onCancel()">Hủy</button>
        <button mat-raised-button color="primary" type="submit" 
                [disabled]="!userForm.valid || isLoading">
          {{data.user ? 'Cập nhật' : 'Thêm'}}
          @if (isLoading) {
            <mat-spinner diameter="20" style="margin-left: 8px;"></mat-spinner>
          }
        </button>
      </div>
    </form>
  `,
  styles: [`
    mat-form-field {
      width: 100%;
      margin-bottom: 15px;
    }
    mat-dialog-content {
      min-width: 350px;
    }
  `]
})
export class UserDialogComponent {
  userForm: FormGroup;
  isLoading = false;
  @Output() submitForm = new EventEmitter<UserRequest>();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      user?: UserResponse,
      type: 'Customer' | 'Staff',
      roles: string[]
    }
  ) {
    const isNewStaff = data.type === 'Staff' && !data.user;
    
    this.userForm = this.fb.group({
      fullName: [data.user?.fullName || '', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZÀ-ỹ\s]*$/)
      ]],
      email: [data.user?.email || '', [
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      phoneNumber: [data.user?.phoneNumber || '', [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/)
      ]],
      role: [data.user?.roles[0] || (data.type === 'Customer' ? 'CUSTOMER' : 'STAFF'), 
        data.type === 'Staff' ? Validators.required : null],
      password: ['', isNewStaff ? [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
      ] : []]
    });

    // Disable email khi cập nhật nhân viên
    if (data.user && data.type === 'Staff') {
      this.userForm.get('email')?.disable();
    }
  }

  translateType(type: string): string {
    return type === 'Customer' ? 'khách hàng' : 'nhân viên';
  }

  translateRole(role: string): string {
    const roleMap: { [key: string]: string } = {
      'CUSTOMER': 'Khách hàng',
      'STAFF': 'Nhân viên',
      'ADMIN': 'Quản trị viên'
    };
    return roleMap[role] || role;
  }

  getErrorMessage(controlName: string): string {
    const control = this.userForm.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'Trường này là bắt buộc';
    }
    if (control.hasError('email')) {
      return 'Email không đúng định dạng';
    }
    if (control.hasError('pattern')) {
      switch (controlName) {
        case 'phoneNumber':
          return 'Số điện thoại phải có 10 chữ số';
        case 'password':
          return 'Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ và số';
        case 'fullName':
          return 'Họ tên chỉ được chứa chữ cái và dấu';
        case 'email':
          return 'Email không đúng định dạng';
      }
    }
    if (control.hasError('minlength')) {
      return `Tối thiểu ${control.errors?.['minlength'].requiredLength} ký tự`;
    }
    if (control.hasError('maxlength')) {
      return `Tối đa ${control.errors?.['maxlength'].requiredLength} ký tự`;
    }
    return '';
  }

  onSubmit() {
    if (this.userForm.valid) {
      const formValue = this.userForm.getRawValue();
      const userData = {
        ...formValue,
        role: formValue.role || (this.data.type === 'Customer' ? 'CUSTOMER' : 'STAFF')
      };
      this.submitForm.emit(userData);
    }
  }

  onCancel() {
    if (!this.isLoading) {
      this.dialogRef.close();
    }
  }
}
