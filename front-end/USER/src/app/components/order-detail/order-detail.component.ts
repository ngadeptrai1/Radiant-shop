import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderDetailResponse, OrderResponse, User } from '../../../type';
import { OrderService } from '../../services/order.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CancelOrderDialogComponent } from '../../shared/cancel-order-dialog/cancel-order-dialog.component';
import { QrPaymentModalComponent } from '../../shared/qr-payment-modal/qr-payment-modal.component';
import { AuthService } from '../../services/auth.service';
import { CookieService } from 'ngx-cookie-service';

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
   userId!: number|null;
  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private authService:AuthService,
    private cookieService:CookieService
  ) {}

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    this.userId = Number(this.cookieService.get('USER_ID1'));
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
      'PROCESSING': 1,
      'SHIPPED': 2,
      'DELIVERED': 3,
      'SUCCESS': 4,
      'DELIVERY-FAILED': 4,
      'CANCELLED': -1
    };
    return statusOrder[status as keyof typeof statusOrder] ?? -1;
  }

  getStatusText(status: string): string {
    const statusText = {
      'PENDING': 'Chờ xác nhận',
      'PROCESSING': 'Đang xử lý',
      'SHIPPED': 'Đang giao hàng',
      'DELIVERED': 'Đã giao hàng',
      'SUCCESS': 'Giao hàng thành công',
      'DELIVERY-FAILED': 'Giao hàng không thành công',
      'CANCELLED': 'Đã hủy'
    };
    return statusText[status as keyof typeof statusText] ?? status;
  }

  canShowQRCode(): boolean {
    return this.order?.status == 'PENDING' && 
           this.order?.paymentStatus == 'UNPAID' && 
           this.order?.paymentMethod == 'CARD';
  }

  canCancel(): boolean {
    return this.order?.status == 'PENDING' && 
           this.order?.paymentStatus == 'UNPAID' && 
           !this.isCancelling;
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

  getPaymentStatusClass(): string {
    switch (this.order?.paymentStatus) {
      case 'PAID':
        return 'paid';
      case 'REFUNDED':
        return 'refunded';
      default:
        return 'unpaid';
    }
  }

  getPaymentStatusText(): string {
    switch (this.order?.paymentStatus) {
      case 'PAID':
        return 'Đã thanh toán';
      case 'REFUNDED':
        return 'Đã hoàn tiền';
      default:
        return 'Chưa thanh toán';
    }
  }
}
