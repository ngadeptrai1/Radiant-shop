import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-qr-payment-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="qr-payment-modal">
      <h2>Quét mã QR để thanh toán</h2>
      
      <div class="bank-info">
        <p><strong>Ngân hàng:</strong> TPBank</p>
        <p><strong>Số tài khoản:</strong> 84402072002</p>
        <p><strong>Chủ tài khoản:</strong> DO XUAN NGA</p>
        <p><strong>Số tiền:</strong> {{data.amount | number}}đ</p>
        <p><strong>Nội dung:</strong> {{data.description}}</p>
      </div>

      <div class="qr-code-container">
        <img [src]="data.qrUrl" alt="QR Code thanh toán" class="qr-code-image">
      </div>

      <div class="payment-note">
        <p>Vui lòng quét mã QR để hoàn tất thanh toán.</p>
        <p>Đơn hàng sẽ được xử lý sau khi nhận được thanh toán.</p>
      </div>

      <div class="modal-actions">
        <button class="btn-close" (click)="close()">Đóng</button>
      </div>
    </div>
  `,
  styles: [`
    .qr-payment-modal {
      padding: 24px;
      max-width: 500px;
      text-align: center;
    }

    h2 {
      margin-bottom: 20px;
      color: #333;
    }

    .bank-info {
      text-align: left;
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .bank-info p {
      margin-bottom: 8px;
    }

    .qr-code-container {
      margin: 20px 0;
    }

    .qr-code-image {
      max-width: 300px;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    .payment-note {
      color: #666;
      font-size: 0.9rem;
      margin: 20px 0;
      padding: 15px;
      background: #fff;
      border-radius: 8px;
      border: 1px dashed #dee2e6;
    }

    .modal-actions {
      margin-top: 20px;
    }

    .btn-close {
      padding: 8px 24px;
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .btn-close:hover {
      background: #5a6268;
    }
  `]
})
export class QrPaymentModalComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      amount: number;
      description: string;
      qrUrl: string;
    },
    private dialogRef: MatDialogRef<QrPaymentModalComponent>
  ) {}

  close() {
    this.dialogRef.close();
  }
} 