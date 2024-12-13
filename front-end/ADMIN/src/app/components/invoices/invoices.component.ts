import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { FormsModule } from '@angular/forms';
import { OrderResponse } from '../../../type';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.scss'
})
export class InvoicesComponent implements OnInit {
  invoices: OrderResponse[] = [];
  selectedType: string = 'POS';
  orderTypes = ['POS', 'WEB'];
  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  startDate: string = '';
  endDate: string = '';
  isLoading: boolean = false;
  searchTimer: any;

  // Thêm các trường tìm kiếm
  phone: string = '';
  name: string = '';
  email: string = '';

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadInvoices();
    
    // Theo dõi sự thay đổi của startDate và endDate
    this.watchDateChanges();
  }

  watchDateChanges() {
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

  onTypeChange(type: string) {
    this.selectedType = type;
    this.currentPage = 0;
    this.loadInvoices();
  }

  loadInvoices() {
    this.isLoading = true;
    this.orderService.getOrdersByStatusPaginated('SUCCESS', this.startDate, this.endDate, this.phone, this.name, this.email)
      .subscribe({
        next: (response) => {
          this.invoices = response.filter(order => order.type === this.selectedType);
          this.totalPages = Math.ceil(this.invoices.length / this.pageSize);
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

  get paginatedInvoices() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.invoices.slice(startIndex, endIndex);
  }

  onPageChange(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  }

  onDateFilterChange() {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      
      if (start > end) {
        alert('Ngày bắt đầu không thể lớn hơn ngày kết thúc');
        return;
      }
      
      this.loadInvoices();
    }
  }

  resetDateFilter() {
    this.startDate = '';
    this.endDate = '';
    this.loadInvoices();
  }

  onSearch() {
    this.loadInvoices();
  }

  resetSearchFilter() {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.loadInvoices();
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'POS': 'Tại quầy',
      'WEB': 'Website'
    };
    return labels[type] || type;
  }
}
