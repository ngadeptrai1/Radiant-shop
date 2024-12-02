import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderDetailResponse, OrderResponse } from '../../../type';
import { OrderService } from '../../services/order.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CancelOrderDialogComponent } from '../../shared/cancel-order-dialog/cancel-order-dialog.component';
import { QrPaymentModalComponent } from '../../shared/qr-payment-modal/qr-payment-modal.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule, 
    MatSnackBarModule, 
    RouterModule, 
    MatDialogModule, 
    CancelOrderDialogComponent,
    QrPaymentModalComponent
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css'
})
export class OrderDetailComponent implements OnInit {
  orderId!: number;
  order?: OrderResponse;
  orderDetails: OrderDetailResponse[] = [];
  loading = true;
  error = false;
  router = inject(Router);
  snackBar = inject(MatSnackBar);
  dialog = inject(MatDialog);
  isCancelling = false;
  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadOrderData();
  }

  loadOrderData() {
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (data) => {
        this.order = data;
        this.loadOrderDetails();
      },
      error: (err) => {
        this.error = true;
        this.loading = false;
        console.error('Error loading order:', err);
      }
    });
  }

  loadOrderDetails() {
    this.orderService.getOrderDetailById(this.orderId).subscribe({
      next: (data) => {
        this.orderDetails = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = true;
        this.loading = false;
        console.error('Error loading order details:', err);
      }
    });
  }

  getTimelineStatus(status: string): number {
    const statusOrder = {
      'PENDING': 0,
      'CONFIRMED': 1,
      'SHIPPING': 2,
      'SUCCESS': 3
    };
    return statusOrder[status as keyof typeof statusOrder] || -1;
  }

  getStatusText(status: string): string {
    const statusText = {
      'PENDING': 'Chờ xác nhận',
      'CONFIRMED': 'Đã xác nhận',
      'SHIPPING': 'Đang giao hàng',
      'SUCCESS': 'Giao hàng thành công',
      'CANCELLED': 'Đã hủy'
    };
    return statusText[status as keyof typeof statusText] || status;
  }

  canShowQRCode(): boolean {
    return this.order?.status === 'PENDING' && 
           this.order?.paymentStatus === 'UNPAID' && 
           this.order?.paymentMethod === 'CARD';
  }

  canCancel(): boolean {
    return this.order?.status === 'PENDING' && !this.isCancelling;
  }

  cancelOrder() {
    const dialogRef = this.dialog.open(CancelOrderDialogComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(reason => {
      if (reason) {
        this.isCancelling = true;
        this.orderService.cancelOrder(this.orderId, reason).subscribe({
          next: () => {
            this.snackBar.open('Đơn hàng đã được hủy thành công', 'Đóng', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
            this.loadOrderData();
          },
          error: (error) => {
            console.error('Error canceling order:', error);
            this.snackBar.open('Có lỗi xảy ra khi hủy đơn hàng', 'Đóng', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          },
          complete: () => {
            this.isCancelling = false;
          }
        });
      }
    });
  }

  showQRCode() {
    const qrUrl = this.generateQRUrl();
    
    this.dialog.open(QrPaymentModalComponent, {
      width: '500px',
      data: {
        amount: this.order?.finalAmount || 0,
        description: `Thanh toan don hang ${this.order?.id}`,
        qrUrl: qrUrl
      }
    });
  }

  private generateQRUrl(): string {
    if (!this.order) return '';
    
    const params = new URLSearchParams({
      amount: this.order.finalAmount.toString(),
      addInfo: `Thanh toan don hang ${this.order.id}`,
      accountName: 'DO XUAN NGA'
    });

    return `https://img.vietqr.io/image/TPB-84402072002-print.png?${params.toString()}`;
  }
}
