import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-thank-you',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './thank-you.component.html',
  styleUrl: './thank-you.component.css'
})
export class ThankYouComponent implements OnInit {
  currentOrder: any;
  qrCodeUrl: string = '';
  bankInfo = {
    bankName: 'TPBANK',
    accountNumber: '84402072002',
    accountName: 'DO XUAN NGA',
    amount: 0,
    description: ''
  };

  constructor(
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.currentOrder = this.orderService.getCurrentOrder();
    
    if (!this.currentOrder) {
      this.router.navigate(['/']);
      return;
    }

    if (this.currentOrder.paymentMethod === 'CARD') {
      this.bankInfo.amount = this.currentOrder.finalAmount;
      this.bankInfo.description = `Thanh toan don hang ${this.currentOrder.id}`;
      this.qrCodeUrl = this.generateQRCodeUrl();
    }
  }

  generateQRCodeUrl(): string {
    const params = new URLSearchParams({
      amount: this.bankInfo.amount.toString(),
      addInfo: this.bankInfo.description,
      accountName: this.bankInfo.accountName
    });
    
    return `https://img.vietqr.io/image/${this.bankInfo.bankName}-${this.bankInfo.accountNumber}-compact.jpg?${params.toString()}`;
  }
}
