import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { CommonModule} from '@angular/common';
import { OrderDetailResponse, OrderResponse, Voucher } from '../../../type';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ProductDetailResponse } from '../../../type';
import { PdfExportService } from '../../services/pdf-export.service';
import { forkJoin, throwError, TimeoutError } from 'rxjs';
import { timeout, catchError, finalize } from 'rxjs/operators';
import { debounceTime } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VoucherService } from '../../services/voucher-service.service';
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
  loadingProductsTimeout: any;
  selectedProduct: ProductDetailResponse | null = null;
  statusDates: { [key: string]: string } = {};
  newAddQuantity: number = 1;
  voucherOrder: Voucher | null = null;
  @ViewChild('confirmModal') confirmModal!: ElementRef;
  @ViewChild('updateModal') updateModal!: ElementRef;
  @ViewChild('cancelModal') cancelModal!: ElementRef;
  @ViewChild('confirmPaymentModal') confirmPaymentModal!: ElementRef;
  @ViewChild('deliveryFailedModal') deliveryFailedModal: ElementRef;
  @ViewChild('refundModal') refundModal: ElementRef;
  
  cancelReason: string = '';
  private modalInstances: { [key: string]: any } = {};
  newVoucherCode: string = '';
  deliveryFailedReason: string = '';

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private productService: ProductService,
    private pdfExportService: PdfExportService,
    private router: Router,
    private snackBar: MatSnackBar,
    private voucherService: VoucherService
  ) {
    this.modalInstances = {
      confirm: null,
      update: null,
      cancel: null,
      confirmPayment: null,
      deliveryFailed: null,
      refund: null
    };
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
    
    this.orderService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loadOrderDetails(orderId);
        if (order.status == 'PENDING') {
          this.loadAvailableProducts();
        }
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.errorMessage = this.getErrorMessage(error);
        this.isLoading = false;
      }
    });
  }

  private getErrorMessage(error: any): string {
    if (error.status == 404) {
      return 'Không tìm thấy đơn hàng';
    }
    if (error.status == 403) {
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
    if (!this.order) return false;
    
    // Nếu là đơn POS hoặc đã hủy, không có trạng thái completed
    if (this.order.type == 'POS' || this.order.status == 'CANCELLED') {
      return false;
    }
    
    const statusOrder = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'SUCCESS'];
    const currentIndex = statusOrder.indexOf(this.order.status);
    const statusIndex = statusOrder.indexOf(status);
    
    return currentIndex > -1 && statusIndex < currentIndex;
  }


  canCancel(): boolean {
    if (!this.order) return false;
    return this.order.type == 'WEB' && 
           ['PENDING', 'PROCESSING'].includes(this.order.status) &&
           this.order.status !== 'CANCELLED' &&
           this.order.status !== 'SUCCESS';
  }

  canConfirm(): boolean {
    if (!this.order) return false;
    
    if (this.order.paymentMethod == 'CARD') {
      return this.order.status == 'PENDING' && this.order.paymentStatus == 'PAID';
    }
    
    return this.order.status == 'PENDING';
  }

  canUpdateStatus(): boolean {
    if (!this.order) return false;
    
    // If order is DELIVERED and payment is CASH, require payment confirmation
    if (this.order.status === 'DELIVERED' && this.order.paymentMethod === 'CASH') {
      return this.order.paymentStatus === 'PAID';
    }
    
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
    const currentIndex = this.orderStatuses.findIndex(s => s.value == this.order?.status);
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
    if (this.order?.status == 'CANCELLED') {
      return [
        { value: 'CANCELLED', label: 'Đã hủy' }
      ];
    }
    
    if (this.order?.type == 'POS') {
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

  openModal(type: 'confirm' | 'update' | 'cancel' | 'confirmPayment' | 'deliveryFailed' | 'refund') {
    const modalElement = this.getModalElement(type);
    if (modalElement) {
      this.modalInstances[type] = new bootstrap.Modal(modalElement);
      this.modalInstances[type].show();
    }
  }

  closeModal(type: 'confirm' | 'update' | 'cancel' | 'confirmPayment' | 'deliveryFailed' | 'refund') {
    if (this.modalInstances[type]) {
      this.modalInstances[type].hide();
      if (type == 'cancel') {
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
      case 'confirmPayment':
        return this.confirmPaymentModal?.nativeElement;
      case 'deliveryFailed':
        return this.deliveryFailedModal?.nativeElement;
      case 'refund':
        return this.refundModal?.nativeElement;
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
    return this.order?.status == 'PENDING' && 
           this.order?.paymentStatus == 'UNPAID';
  }

  toggleEditMode() {
    if (!this.canEditOrder()) {
      alert('Không thể chỉnh sửa đơn hàng này!');
      return;
    }
    
    this.isEditing = !this.isEditing;
    this.resetForm();
    
    if (this.isEditing) {
      this.loadAvailableProducts();
    }
  }

  resetForm() {
    this.selectedProductId = 0;
    this.newAddQuantity = 1;
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

  validateQuantity(newQuantity: number, productDetailId: number): boolean {
    const productInStock = this.availableProducts.find(p => p.productDetailId == productDetailId);
    if (!productInStock) {
      this.snackBar.open('Không tìm thấy sản phẩm trong kho 1', 'Đóng', { duration: 3000 });
      return false;
    }

    const existingOrderDetail = this.orderDetails.find(detail => detail.productDetailId == productDetailId);
    const totalQuantity = existingOrderDetail ? existingOrderDetail.quantity + newQuantity : newQuantity;

    if (totalQuantity > productInStock.quantity) {
      this.snackBar.open(`Số lượng vượt quá tồn kho (còn ${productInStock.quantity} sản phẩm)`, 'Đóng', { duration: 3000 });
      return false;
    }

    return true;
  }

  addOrderDetail() {
    if (!this.selectedProductId || !this.order || this.newAddQuantity < 1) {
      this.snackBar.open('Vui lòng chọn sản phẩm và nhập số lượng hợp lệ', 'Đóng', {
        duration: 3000,
      });
      return;
    }

    // Kiểm tra sản phẩm trong kho
    const productInStock = this.availableProducts.find(p => p.productDetailId == this.selectedProductId);
    if (!productInStock) {
      this.snackBar.open('Không tìm thấy sản phẩm trong kho 2', 'Đóng', { duration: 3000 });
      return;
    }

    // Kiểm tra sản phẩm đã có trong đơn hàng chưa
    const existingOrderDetail = this.orderDetails.find(detail => detail.productDetailId == this.selectedProductId);
    if (existingOrderDetail) {
      const totalQuantity = existingOrderDetail.quantity + this.newAddQuantity;
      if (totalQuantity > productInStock.quantity) {
        this.snackBar.open(
          `Tổng số lượng (${totalQuantity}) vượt quá số trong kho (${productInStock.quantity}). Sản phẩm này đã có ${existingOrderDetail.quantity} trong đơn hàng.`, 
          'Đóng', 
          { duration: 3000 }
        );
        return;
      }
    } else {
      // Sản phẩm chưa có trong đơn hàng
      if (this.newAddQuantity > productInStock.quantity) {
        this.snackBar.open(`Số lượng vượt quá số trong kho (${productInStock.quantity})`, 'Đóng', { duration: 3000 });
        return;
      }
    }

    this.isLoading = true;
    this.orderService.addOrderDetail(this.order.id, this.selectedProductId, this.newAddQuantity)
      .subscribe({
        next: () => {
          this.loadOrderDetails(this.order!.id);
          this.resetForm();
          this.snackBar.open('Thêm sản phẩm thành công', 'Đóng', {
            duration: 3000,
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error adding product:', error);
          const message = error.error?.message || 'Có lỗi xảy ra khi thêm sản phẩm';
          this.snackBar.open(message, 'Đóng', {
            duration: 3000,
          });
          this.isLoading = false;
        }
      });
  }

  async updateOrderDetail(detailId: number) {
    if (!this.canEditOrder()) return;
    this.isLoading = true;
    const orderDetail = this.orderDetails.find(detail => detail.id == detailId);
    if (!orderDetail || !this.order || this.newQuantity < 1) return;

    const productInStock = this.availableProducts.find(p => p.productDetailId == orderDetail.productDetailId);
    if (!productInStock || this.newQuantity > productInStock.quantity) {
      this.snackBar.open(`Số lượng vượt quá số trong kho (${productInStock?.quantity || 0})`, 'Đóng', { duration: 3000 });
      return;
    }

    // Calculate new total
    const currentAmount = orderDetail.price * orderDetail.quantity;
    const newAmount = orderDetail.price * this.newQuantity;
    const totalDifference = newAmount - currentAmount;
    const newTotal = (this.order.totalOrderAmount || 0) + totalDifference;

    // Validate voucher with new total
    const isVoucherValid = await this.validateVoucherAfterEdit(newTotal);
    if (!isVoucherValid) {
      return;
    }

    
    this.orderService.updateOrderDetail(detailId, this.newQuantity)
      .subscribe({
        next: () => {
          this.loadOrderDetails(this.order!.id);
          this.editingDetailId = null;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating quantity:', error);
          this.isLoading = false;
          this.snackBar.open('Có lỗi xảy ra khi cập nhật số lượng', 'Đóng', { duration: 3000 });
        }
      });
  }

  async deleteOrderDetail(detailId: number) {
    if (!this.canEditOrder()) {
      this.snackBar.open('Không thể xóa sản phẩm khỏi đơn hàng!', 'Đóng', { duration: 3000 });
      return;
    }

    if (!this.canDeleteOrderDetail()) {
      this.snackBar.open('Không thể xóa sản phẩm cuối cùng trong đơn hàng!', 'Đóng', { duration: 3000 });
      return;
    }

    if (!this.order || !confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    // Calculate new total
    this.isLoading = true;
    const orderDetail = this.orderDetails.find(detail => detail.id == detailId);
    if (!orderDetail) return;

    const newTotal = this.order.totalOrderAmount - (orderDetail.price * orderDetail.quantity);
    
    // Validate voucher with new total
    const isVoucherValid = await this.validateVoucherAfterEdit(newTotal);
    if (!isVoucherValid) {
      return;
    }

    
    this.orderService.deleteOrderDetail(this.order.id, detailId)
      .subscribe({
        next: () => {
          this.loadOrderDetails(this.order!.id);
          this.snackBar.open('Xóa sản phẩm thành công', 'Đóng', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.snackBar.open('Có lỗi xảy ra khi xóa sản phẩm', 'Đóng', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  exportToPDF() {
    if (this.order && this.orderDetails && 
        (this.order.status == 'SUCCESS' )) {
      this.pdfExportService.generateOrderPDF(this.order, this.orderDetails);
    } else {
      console.warn('Chỉ có thể xuất hóa đơn cho đơn hàng đã hoàn thành');
    }
  }

  // Thêm method helper để kiểm tra trạng thái
  canExportPDF(): boolean {
    return this.order?.status == 'SUCCESS' ;
  }

  // Thêm trackBy function
  trackByOrderDetail(index: number, item: OrderDetailResponse): number {
    return item.id;
  }

  private loadAvailableProducts() {
    if (!this.canEditOrder()) return;

    this.isLoadingProducts = true;
    
    // Set timeout 3s
    this.loadingProductsTimeout = setTimeout(() => {
      this.isLoadingProducts = false;
    }, 3000);

    this.productService.getAllProductDetails().subscribe({
      next: (products) => {
        clearTimeout(this.loadingProductsTimeout);
        this.availableProducts = products;
        this.isLoadingProducts = false;
      },
      error: (error) => {
        clearTimeout(this.loadingProductsTimeout);
        console.error('Error loading products:', error);
        this.isLoadingProducts = false;
      }
    });
  }

  canConfirmPayment(): boolean {
    if (!this.order) return false;
    
    // For CARD payment method
    if (this.order.paymentMethod === 'CARD') {
      return this.order.status === 'PENDING' && this.order.paymentStatus === 'UNPAID';
    }
    
    // For CASH payment method
    if (this.order.paymentMethod === 'CASH') {
      return this.order.status === 'DELIVERED' && this.order.paymentStatus === 'UNPAID';
    }
    
    return false;
  }

  confirmPayment() {
    if (!this.order) return;
    
    this.isLoading = true;
    this.orderService.confirmPayment(this.order.id).subscribe({
      next: (response) => {
        this.order = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error confirming payment:', error);
        this.isLoading = false;
      }
    });
  }

  // Cập nhật method khi chọn sản phẩm
  onProductSelect(productId: number) {
    this.selectedProduct = this.availableProducts.find(p => p.productDetailId == productId) || null;
    if (this.selectedProduct) {
      // Reset số lượng khi chọn sản phẩm mới
      this.newQuantity = 1;
    }
  }

  getNextStatusLabel(): string {
    if (!this.order) return '';
    
    switch (this.order.status) {
      case 'DELIVERED':
        return 'Giao thành công';
      case 'PROCESSING':
        return 'Chuyển sang vận chuyển';
      case 'SHIPPED':
        return 'Chuyển sang đã giao';
      default:
        return 'Chuyển trạng thái tiếp theo';
    }
  }

  getNextStatusIcon(): string {
    if (!this.order) return 'fa-arrow-right';
    
    switch (this.order.status) {
      case 'DELIVERED':
        return 'fa-check-circle';
      case 'PROCESSING':
        return 'fa-shipping-fast';
      case 'SHIPPED':
        return 'fa-box';
      default:
        return 'fa-arrow-right';
    }
  }

  getNextStatusButtonClass(): string {
    if (!this.order) return 'btn-success';
    
    switch (this.order.status) {
      case 'DELIVERED':
        return 'btn-success';
      default:
        return 'btn-primary';
    }
  }

  // Add this helper method to the component class
  canDeleteOrderDetail(): boolean {
    return this.orderDetails.length > 1;
  }

  handleConfirmPayment() {
    if (!this.order) return;
    
    this.isLoading = true;
    this.orderService.confirmPayment(this.order.id).subscribe({
      next: (response) => {
        this.order = response;
        this.closeModal('confirmPayment');
        this.snackBar.open('Đã xác nhận thanh toán thành công', 'Đóng', {
          duration: 3000,
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error confirming payment:', error);
        this.snackBar.open('Có lỗi xảy ra khi xác nhận thanh toán', 'Đóng', {
          duration: 3000,
        });
        this.isLoading = false;
      }
    });
  }

  // Thêm phương thức mới để load ngày của các trạng thái

  // Thêm phương thức để lấy ngày của từng trạng thái
  getStatusDate(status: string): string | null {
    return this.statusDates[status] || null;
  }

  getAvailableQuantity(productDetailId: number): number {
    const product = this.availableProducts.find(p => p.productDetailId == productDetailId);
    return product?.quantity || 0;
  }

  private async validateVoucherAfterEdit(newTotal: number): Promise<boolean> {
    if (!this.order?.voucherCode) return true;
    
    try {
      // Get voucher details
      const vouchers = await this.voucherService.getValidVoucher(newTotal).toPromise();
      const isVoucherValid = vouchers?.some(v => v.code == this.order?.voucherCode);
      
      if (!isVoucherValid) {
        const confirmRemove = await this.showVoucherWarningDialog();
        if (confirmRemove) {
          // Remove voucher from order
          await this.removeVoucherFromOrder();
          return true;
        }
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error validating voucher:', error);
      return false;
    }
  }

  private showVoucherWarningDialog(): Promise<boolean> {
    return new Promise((resolve) => {
      const result = confirm(
        'Sau khi chỉnh sửa, đơn hàng không đủ điều kiện áp dụng voucher hiện tại. Bạn có muốn tiếp tục và xóa voucher không?'
      );
      resolve(result);
    });
  }

  private async removeVoucherFromOrder(): Promise<void> {
    if (!this.order) return;
    
    try {
      const updatedOrder = await this.orderService.removeVoucher(this.order.id).toPromise();
      if (updatedOrder) {
        this.order = updatedOrder;
        this.snackBar.open('Đã xóa voucher khỏi đơn hàng', 'Đóng', { duration: 3000 });
      }
    } catch (error) {
      console.error('Error removing voucher:', error);
      this.snackBar.open('Có lỗi xảy ra khi xóa voucher', 'Đóng', { duration: 3000 });
    }
  }

  applyVoucher() {
    if (!this.order || !this.newVoucherCode.trim()) {
      this.snackBar.open('Vui lòng nhập mã giảm giá hợp lệ', 'Đóng', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.orderService.addVoucher(this.order.id, this.newVoucherCode.trim()).subscribe({
      next: (updatedOrder) => {
        this.order = updatedOrder;
        this.snackBar.open('Áp dụng mã giảm giá thành công', 'Đóng', { duration: 3000 });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error applying voucher:', error);
        this.snackBar.open('Mã giảm giá không hợp lệ hoặc không áp dụng được với đơn hàng này', 'Đóng', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  removeVoucher() {
    if (!this.order) return;

    this.isLoading = true;
    this.orderService.removeVoucher(this.order.id).subscribe({
      next: (updatedOrder) => {
        this.order = updatedOrder;
        this.snackBar.open('Đã xóa mã giảm giá', 'Đóng', { duration: 3000 });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error removing voucher:', error);
        this.snackBar.open('Có lỗi xảy ra khi xóa mã giảm giá', 'Đóng', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  // Kiểm tra có thể đánh dấu giao hàng không thành công
  canMarkDeliveryFailed(): boolean {
    return this.order?.status === 'SHIPPED';
  }

  // Kiểm tra có thể hoàn tiền
  canRefundPayment(): boolean {
    return this.order?.status === 'CANCELLED' && 
           this.order?.paymentStatus === 'PAID' &&
           this.order?.paymentMethod === 'CARD';
  }

  // Xử lý giao hàng không thành công
  handleDeliveryFailed() {
    if (!this.order || !this.deliveryFailedReason.trim()) return;

    this.isLoading = true;
    this.orderService.markDeliveryFailed(this.order.id, this.deliveryFailedReason)
      .subscribe({
        next: (response) => {
          this.order = response;
          this.closeModal('deliveryFailed');
          this.deliveryFailedReason = '';
          this.snackBar.open('Đã cập nhật trạng thái giao hàng không thành công', 'Đóng', {
            duration: 3000,
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error marking delivery failed:', error);
          this.snackBar.open('Có lỗi xảy ra khi cập nhật trạng thái', 'Đóng', {
            duration: 3000,
          });
          this.isLoading = false;
        }
      });
  }

  // Xử lý hoàn tiền
  handleRefundPayment() {
    if (!this.order) return;

    this.isLoading = true;
    this.orderService.refundPayment(this.order.id)
      .subscribe({
        next: (response) => {
          this.order = response;
          this.closeModal('refund');
          this.snackBar.open('Đã hoàn tiền thành công', 'Đóng', {
            duration: 3000,
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error refunding payment:', error);
          this.snackBar.open('Có lỗi xảy ra khi hoàn tiền', 'Đóng', {
            duration: 3000,
          });
          this.isLoading = false;
        }
      });
  }
}