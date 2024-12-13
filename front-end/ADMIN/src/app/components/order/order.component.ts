import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { FormsModule } from '@angular/forms';
import { OrderRequest, OrderResponse, OrderStatusCount } from '../../../type';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [ RouterLink, CommonModule, FormsModule],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent implements OnInit {
  orders: OrderResponse[] = [];
  selectedType: string = 'WEB';
  selectedStatus: string = 'PENDING';
  
  orderTypes = ['WEB'];
  orderStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'SUCCESS'];

  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  startDate: string = '';
  endDate: string = '';
  orderStatistics: any = null;
  cancelReason: string = '';
  isLoading: boolean = false;
  searchTimer: any;
  orderStatusCount: OrderStatusCount = {
    PENDING: 0,
    PROCESSING: 0,
    DELIVERED: 0,
    SUCCESS: 0,
    SHIPPED: 0,
    CANCELLED: 0
  };

  phone: string = '';
  name: string = '';
  email: string = '';

  // Định nghĩa mảng trạng thái cho web orders
  webOrderStatuses = [
    { value: 'PENDING', label: 'Chờ xác nhận', icon: 'fas fa-clock' },
    { value: 'PROCESSING', label: 'Đang xử lý', icon: 'fas fa-cog fa-spin' },
    { value: 'SHIPPED', label: 'Đang giao hàng', icon: 'fas fa-truck' },
    { value: 'SUCCESS', label: 'Thành công', icon: 'fas fa-check-circle' },
    { value: 'DELIVERED', label: 'Đã giao hàng', icon: 'fas fa-user-check' },
    { value: 'CANCELLED', label: 'Đã hủy', icon: 'fas fa-ban' }
  ];

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.selectedType = 'WEB';
    this.loadOrders();
    this.loadOrderStatusCount();
    this.watchDateChanges();
  }

  watchDateChanges() {
    // Sử dụng debounceTime để tránh gọi API quá nhiều lần
    const debounceTime = 500; // 500ms
    
    let dateChangeTimer: any;
    
    // Theo dõi startDate
    this.watchFormControl('startDate', () => {
      clearTimeout(dateChangeTimer);
      dateChangeTimer = setTimeout(() => {
        if (this.startDate && this.endDate) {
          this.onDateFilterChange();
        }
      }, debounceTime);
    });

    // Theo dõi endDate
    this.watchFormControl('endDate', () => {
      clearTimeout(dateChangeTimer);
      dateChangeTimer = setTimeout(() => {
        if (this.startDate && this.endDate) {
          this.onDateFilterChange();
        }
      }, debounceTime);
    });
  }

  private watchFormControl(property: string, callback: () => void) {
    let oldValue = (this as any)[property];
    
    Object.defineProperty(this, property, {
      get: () => oldValue,
      set: (newValue) => {
        oldValue = newValue;
        callback();
      }
    });
  }

  loadOrders() {
    if (!this.selectedType) return;
    
    this.isLoading = true;
    const status = this.selectedStatus || 'PENDING';
    
    this.orderService.getOrdersByStatusPaginated(status, this.startDate, this.endDate, this.phone, this.name, this.email)
      .subscribe({
        next: (response) => {
          this.orders = response.filter(order => order.type === 'WEB');
          this.totalPages = Math.ceil(this.filteredOrders.length / this.pageSize);
          this.currentPage = 0;
        },
        error: (error) => {
          console.error('Error:', error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  loadOrderStatusCount() {
    this.orderService.getOrderStatusCount().subscribe(count => {
      this.orderStatusCount = count;
    });
    
  }

  onFilterChange() {
    this.loadOrders();
  }

  get filteredOrders() {
    if (!this.orders) return [];
    
    return this.orders.filter(order => {
      if (this.selectedType === 'POS') {
        return order.type === 'POS';
      } else {
        return order.type === 'WEB' && order.status === this.selectedStatus;
      }
    });
  }

  get paginatedOrders() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredOrders.slice(startIndex, endIndex);
  }

  getStatusLabel(status: string): string {
    const statusObj = this.webOrderStatuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'POS': 'Tại quầy',
      'WEB': 'Website'
    };
    return labels[type] || type;
  }

  getOrderCountByStatus(status: string): number {
    return this.orderStatusCount[status as keyof OrderStatusCount] || 0;
  }

  onTabChange(status: string) {
    this.selectedStatus = status;
    this.loadOrders();
  }

  getStatusIcon(status: string): string {
    const statusObj = this.webOrderStatuses.find(s => s.value === status);
    return statusObj ? statusObj.icon : 'fas fa-question-circle';
  }

  getStatusIconClass(status: string): string {
    return status.toLowerCase();
  }

  onTypeChange(type: string) {
    this.selectedType = type;
    this.currentPage = 0;
    
    if (type === 'POS') {
      this.selectedStatus = 'SUCCESS';
      this.orderStatuses = ['SUCCESS'];
    } else {
      this.selectedStatus = 'PENDING';
      this.orderStatuses = this.webOrderStatuses.map(status => status.value);
    }
    
    this.loadOrders();
  }

  onPageChange(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
    }
  }

  onDateFilterChange() {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      
      if (start > end) {
        alert('Ngày bắt đầu không thể lớn hơn ngày kết thúc');
        return;
      }
      
      this.loadOrders();
    }
  }

  resetDateFilter() {
    this.startDate = '';
    this.endDate = '';
    this.loadOrders();
  }

  updatePaymentStatus(orderId: number, status: string) {
    this.orderService.updatePaymentStatus(orderId, status)
      .subscribe(() => {
        this.loadOrders();
      });
  }

  loadOrderStatistics() {
    if (this.startDate && this.endDate) {
      this.orderService.getOrderStatistics(this.startDate, this.endDate)
        .subscribe(statistics => {
          this.orderStatistics = statistics;
        });
    }
  }

  cancelOrder(orderId: number) {
    if (this.cancelReason) {
      this.orderService.cancelOrder(orderId, this.cancelReason)
        .subscribe(() => {
          this.loadOrders();
          this.cancelReason = '';
        });
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  }

  onSearch() {
    this.loadOrders();
  }

  resetSearchFilter() {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.loadOrders();
  }
}
