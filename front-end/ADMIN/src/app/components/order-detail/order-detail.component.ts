import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { CommonModule} from '@angular/common';
import { OrderDetailResponse, OrderResponse } from '../../../type';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ProductDetailResponse } from '../../../type';
import { PdfExportService } from '../../services/pdf-export.service';
import { forkJoin, throwError, TimeoutError } from 'rxjs';
import { timeout, catchError, finalize } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operators';
declare var bootstrap: any;

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
  standalone: true,
  imports: [ CommonModule, FormsModule ]
})
export class OrderDetailComponent implements OnInit {
  order: OrderResponse | null = null;
  isLoading: boolean = false;
  orderDetails: OrderDetailResponse[] = [];
  newNote: string = '';
  isEditing: boolean = false;
  availableProducts: ProductDetailResponse[] = [];
  selectedProductId: number = 0;
  newQuantity: number = 1;
  editingDetailId: number | null = null;
  isLoadingProducts: boolean = false;
  errorMessage: string = '';

  @ViewChild('confirmModal') confirmModal!: ElementRef;
  @ViewChild('updateModal') updateModal!: ElementRef;
  @ViewChild('cancelModal') cancelModal!: ElementRef;
  
  cancelReason: string = '';
  private modalInstances: { [key: string]: any } = {};

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private productService: ProductService,
    private pdfExportService: PdfExportService,
    private router: Router
  ) {


  }

  ngOnInit() {
    this.loadOrderData();
  }

  private loadOrderData() {
    const orderId = this.route.snapshot.params['id'];
    if (!orderId) {
      this.errorMessage = 'Không tìm thấy mã đơn hàng';
      return;
    }

    this.isLoading = true;
    
    const timeoutMs = 30000;
    
    forkJoin({
      order: this.orderService.getOrderById(orderId),
      details: this.orderService.getOrderDetails(orderId),
      products: this.productService.getAllProductDetails()
    })
    .pipe(
      timeout(timeoutMs),
      catchError(error => {
        if (error instanceof TimeoutError) {
          return throwError(() => new Error('Timeout: Không thể kết nối đến server'));
        }
        return throwError(() => error);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    )
    .subscribe({
      next: (data) => {
        if (!data.order) {
          this.errorMessage = 'Không tìm thấy thông tin đơn hàng';
          return;
        }
        this.order = data.order;
        this.orderDetails = data.details;
        this.availableProducts = data.products;
        this.errorMessage = '';
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.errorMessage = this.getErrorMessage(error);
      }
    });
  }

  private getErrorMessage(error: any): string {
    if (error.status === 404) {
      return 'Không tìm thấy đơn hàng';
    }
    if (error.status === 403) {
      return 'Bạn không có quyền truy cập đơn hàng này';
    }
    if (error.message) {
      return error.message;
    }
    return 'Có lỗi xảy ra khi tải thông tin đơn hàng. Vui lòng thử lại sau.';
  }

  retryLoading() {
    this.errorMessage = '';
    this.loadOrderData();
  }

  private loadOrderDetails(orderId: number) {
    if (!orderId) return;
    
    this.isLoading = true;
    this.orderService.getOrderDetails(orderId)
      .pipe(
        timeout(10000),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (details) => {
          this.orderDetails = details;
          this.refreshOrderInfo();
        },
        error: (error) => {
          console.error('Error loading order details:', error);
          this.errorMessage = this.getErrorMessage(error);
        }
      });
  }

  private refreshOrderInfo() {
    if (!this.order?.id) return;
    
    this.orderService.getOrderById(this.order.id).subscribe({
      next: (data) => {
        this.order = data;
      },
      error: (error) => {
        console.error('Error refreshing order:', error);
      }
    });
  }

  // Thêm method để quay lại trang orders
  goBack() {
    this.router.navigate(['/orders']);
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'PENDING': 'fas fa-clock',
      'PROCESSING': 'fas fa-cog',
      'SHIPPED': 'fas fa-truck',
      'DELIVERED': 'fas fa-box',
      'CANCELLED': 'fas fa-ban',
      'SUCCESS': 'fas fa-check-circle'
    };
    return icons[status] || 'fas fa-question-circle';
  }

  isStatusCompleted(status: string): boolean {
    if (this.order?.status === 'CANCELLED') {
      return false;
    }
    
    const statusOrder = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'SUCCESS'];
    const currentIndex = statusOrder.indexOf(this.order?.status || '');
    const statusIndex = statusOrder.indexOf(status);
    return currentIndex > -1 && statusIndex < currentIndex;
  }


  canCancel(): boolean {
    if (!this.order) return false;
    return this.order.type === 'WEB' && 
           ['PENDING', 'PROCESSING'].includes(this.order.status) &&
           this.order.status !== 'CANCELLED' &&
           this.order.status !== 'SUCCESS';
  }

  canConfirm(): boolean {
    if (!this.order) return false;
    return this.order.type === 'WEB' && 
           this.order.status === 'PENDING';
  }

  canUpdateStatus(): boolean {
    if (!this.order) return false;
    return this.order.type === 'WEB' && 
           !['CANCELLED', 'SUCCESS'].includes(this.order.status);
  }

  confirmOrder() {
    if (!this.order) return;
    this.isLoading = true;
    this.orderService.confirmOrder(this.order.id).subscribe({
      next: (response) => {
        this.order = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error confirming order:', error);
        this.isLoading = false;
      }
    });
  }

  updateNextStatus() {
    if (!this.order) return;
    const currentIndex = this.orderStatuses.findIndex(s => s.value === this.order?.status);
    if (currentIndex < this.orderStatuses.length - 1) {
      const nextStatus = this.orderStatuses[currentIndex + 1].value;
      this.isLoading = true;
      this.orderService.updateOrderStatus(this.order.id, nextStatus).subscribe({
        next: (response) => {
          this.order = response;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating status:', error);
          this.isLoading = false;
        }
      });
    }
  }

  cancelOrder() {
    if (!this.order) return;
    const reason = prompt('Vui lòng nhập lý do hủy đơn:');
    if (reason) {
      this.isLoading = true;
      this.orderService.cancelOrder(this.order.id, reason).subscribe({
        next: (response) => {
          this.order = response;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
          this.isLoading = false;
        }
      });
    }
  }

  
  
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  }

  // Thay đổi orderStatuses thành getter
  get orderStatuses() {
    if (this.order?.status === 'CANCELLED') {
      return [
        { value: 'CANCELLED', label: 'Đã hủy' }
      ];
    }
    
    if (this.order?.type === 'POS') {
      return [
        { value: 'SUCCESS', label: 'Thành công' }
      ];
    }
    
    return [
      { value: 'PENDING', label: 'Chờ xác nhận' },
      { value: 'PROCESSING', label: 'Đang xử lý' },
      { value: 'SHIPPED', label: 'Đang giao hàng' },
      { value: 'DELIVERED', label: 'Đã giao hàng' },
      { value: 'SUCCESS', label: 'Thành công' }
    ];
  }

  getPaymentMethodLabel(method: string): string {
    const methods: { [key: string]: string } = {
      'CASH': 'Tiền mặt',
      'CARD': 'Ngân hàng'
    };
    return methods[method] || method;
  }

  openModal(type: 'confirm' | 'update' | 'cancel') {
    const modalElement = this.getModalElement(type);
    if (modalElement) {
      this.modalInstances[type] = new bootstrap.Modal(modalElement);
      this.modalInstances[type].show();
    }
  }

  closeModal(type: 'confirm' | 'update' | 'cancel') {
    if (this.modalInstances[type]) {
      this.modalInstances[type].hide();
      if (type === 'cancel') {
        this.cancelReason = '';
      }
    }
  }

  private getModalElement(type: string): ElementRef['nativeElement'] | null {
    switch (type) {
      case 'confirm':
        return this.confirmModal?.nativeElement;
      case 'update':
        return this.updateModal?.nativeElement;
      case 'cancel':
        return this.cancelModal?.nativeElement;
      default:
        return null;
    }
  }

  handleConfirmOrder() {
    this.confirmOrder();
    this.closeModal('confirm');
  }

  handleUpdateStatus() {
    this.updateNextStatus();
    this.closeModal('update');
  }

  handleCancelOrder() {
    if (this.cancelReason.trim()) {
      this.isLoading = true;
      this.orderService.cancelOrder(this.order!.id, this.cancelReason).subscribe({
        next: (response) => {
          this.order = response;
          this.closeModal('cancel');
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cancelling order:', error);
          this.isLoading = false;
        }
      });
    }
  }

  canEditOrder(): boolean {
    return this.order?.status === 'PENDING';
  }

  toggleEditMode() {
    this.isEditing = !this.isEditing;
    this.resetForm();
  }

  resetForm() {
    this.selectedProductId = 0;
    this.newQuantity = 1;
    this.editingDetailId = null;
  }

  startEditDetail(detail: OrderDetailResponse) {
    if (!this.isEditing) return;
    this.editingDetailId = detail.id;
    this.newQuantity = detail.quantity;
  }

  cancelEdit() {
    this.editingDetailId = null;
    this.newQuantity = 1;
  }

  addOrderDetail() {
    if (!this.selectedProductId || !this.order) return;

    this.isLoading = true;
    this.orderService.addOrderDetail(this.order.id, this.selectedProductId, this.newQuantity)
      .subscribe({
        next: () => {
          this.loadOrderDetails(this.order!.id);
          this.resetForm();
        },
        error: (error) => {
          console.error('Error adding product:', error);
          this.isLoading = false;
        }
      });
  }

  updateOrderDetail(detailId: number) {
    if (!this.order) return;

    this.isLoading = true;
    this.orderService.updateOrderDetail(detailId, this.newQuantity)
      .subscribe({
        next: () => {
          this.loadOrderDetails(this.order!.id);
          this.editingDetailId = null;
        },
        error: (error) => {
          console.error('Error updating quantity:', error);
          this.isLoading = false;
        }
      });
  }

  deleteOrderDetail(detailId: number) {
    if (!this.order || !confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    this.isLoading = true;
    this.orderService.deleteOrderDetail(this.order.id, detailId)
      .subscribe({
        next: () => {
          this.loadOrderDetails(this.order!.id);
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.isLoading = false;
        }
      });
  }

  exportToPDF() {
    if (this.order && this.orderDetails && 
        (this.order.status === 'SUCCESS' || this.order.status === 'DELIVERED')) {
      this.pdfExportService.generateOrderPDF(this.order, this.orderDetails);
    } else {
      console.warn('Chỉ có thể xuất hóa đơn cho đơn hàng đã hoàn thành');
    }
  }

  // Thêm method helper để kiểm tra trạng thái
  canExportPDF(): boolean {
    return this.order?.status === 'SUCCESS' || this.order?.status === 'DELIVERED';
  }

  // Thêm trackBy function
  trackByOrderDetail(index: number, item: OrderDetailResponse): number {
    return item.id;
  }
}