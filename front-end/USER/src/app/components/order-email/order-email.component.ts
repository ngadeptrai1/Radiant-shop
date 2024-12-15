import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderResponse, User } from '../../../type';
import { OrderService } from '../../services/order.service';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-order-email',
  standalone: true,
    imports: [CommonModule, RouterModule],
  templateUrl: './order-email.component.html',
  styleUrl: './order-email.component.css'
})
export class OrderEmailComponent implements OnInit {
  email: string = '';


  orders: OrderResponse[] = [];
    loading: boolean = true;
    currentUser: User | null = null;
    constructor(
      private orderService: OrderService,
      private cookieService: CookieService,
      private authService: AuthService,
      private route: ActivatedRoute
    ) {
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        console.log(this.currentUser);
      });
      this.ngOnInit();
    }
  
    ngOnInit(): void {
      this.route.queryParams.subscribe(params => {
        this.email = params['email'] || '';
      });
      const userId = Number(this.cookieService.get('USER_ID1'));
      console.log(userId);
      if (this.email) {
        this.orderService.getOrdersByEmail(this.email).subscribe({
          next: (data) => {
            console.log(data);
            this.orders = data;
            this.loading = false;
          },
          error: (error) => {
            console.error('Error fetching orders:', error);
            this.loading = false;
          }
        });
      }
    }
  
    getStatusClass(status: string): string {
      switch (status) {
        case 'PENDING': return 'Chờ xác nhận';
        case 'CONFIRMED': return 'Đã xác nhận';
        case 'DELIVERED': return 'Đã giao';
        case 'CANCELLED': return 'Đã hủy';
        default: return '';
      }
    }
}
