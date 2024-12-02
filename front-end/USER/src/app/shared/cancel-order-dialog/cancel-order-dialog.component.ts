import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-cancel-order-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="cancel-order-dialog">
      <h2>Xác nhận hủy đơn hàng</h2>
      
      <div class="dialog-content">
        <p>Bạn có chắc chắn muốn hủy đơn hàng này?</p>
        <mat-form-field appearance="outline" class="reason-input">
          <mat-label>Lý do hủy đơn</mat-label>
          <textarea 
            matInput 
            [(ngModel)]="reason" 
            placeholder="Vui lòng nhập lý do hủy đơn hàng"
            required
            rows="3"
            [disabled]="isLoading">
          </textarea>
        </mat-form-field>
      </div>

      <div class="dialog-actions">
        <button 
          class="btn-cancel" 
          [disabled]="!reason.trim() || isLoading" 
          (click)="confirm()">
          <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          {{ isLoading ? 'Đang xử lý...' : 'Xác nhận hủy' }}
        </button>
        <button class="btn-close" [disabled]="isLoading" (click)="close()">Đóng</button>
      </div>
    </div>
  `,
  styles: [`
    .cancel-order-dialog {
      padding: 24px;
    }

    h2 {
      margin: 0 0 20px;
      color: #dc3545;
    }

    .dialog-content {
      margin-bottom: 20px;
    }

    .reason-input {
      width: 100%;
      margin-top: 10px;
    }

    .dialog-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-cancel {
      background-color: #dc3545;
      color: white;
    }

    .btn-cancel:disabled {
      background-color: #e9ecef;
      cursor: not-allowed;
    }

    .btn-close {
      background-color: #6c757d;
      color: white;
    }

    .btn-cancel:hover:not(:disabled) {
      background-color: #c82333;
    }

    .btn-close:hover {
      background-color: #5a6268;
    }
  `]
})
export class CancelOrderDialogComponent {
  reason: string = '';
  isLoading = false;

  constructor(
    private dialogRef: MatDialogRef<CancelOrderDialogComponent>
  ) {}

  confirm() {
    if (this.reason.trim()) {
      this.isLoading = true;
      this.dialogRef.close(this.reason);
    }
  }

  close() {
    if (!this.isLoading) {
      this.dialogRef.close();
    }
  }
}