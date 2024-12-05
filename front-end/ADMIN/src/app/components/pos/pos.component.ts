import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductDetailResponse, ProductResponse,  UserRequest,  Voucher } from '../../../type';
import { OrderRequest } from '../../../type';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { VoucherService } from '../../services/voucher-service.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { UserService } from '../../services/user.service';
import { UserResponse } from '../../../type';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { PdfExportService } from '../../services/pdf-export.service';
import { AuthService } from '../../services/auth.service';

// Thêm interface để kiểm tra trạng thái sản phẩm
interface ProductDetailWithStatus {
  id: number;
  quantity: number;
  status: 'ACTIVE' | 'INACTIVE';
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule, MatAutocompleteModule],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.scss'
})
export class POSComponent implements OnInit, OnDestroy {
  isLoading = true;

  productDetails: ProductDetailResponse[] = [];
  currentOrder!: OrderRequest;
  listOrder: OrderRequest[] = [];
  maxOrders = 5;
  showDropdown = false;
  filteredProducts: any[] = [];
  searchTerm: string = '';
  customerMoney: number = 0;
  errorMessage: string = '';
  successMessage: string = '';
  showQRModal: boolean = false;
  qrImageUrl: string = '';
  listVoucher: Voucher[] = [];
  searchCustomerTerm: string = '';
  filteredCustomers: UserResponse[] = [];
  showCustomerDropdown = false;
  private searchSubject = new Subject<string>();
  showAddCustomerModal = false;
  customers: UserResponse[] = [];
  selectedCustomer: UserResponse | null = null;
  defaultCustomerId = 11;

  currentUserId: number = 11; // id cua khach le
  newCustomer: UserRequest = {
    id: 0,
    username: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    email: '',
    role: 'CUSTOMER'

  };
  customerError: string = '';

  // Thêm property để quản lý trạng thái loading
  isProcessingOrder = false;

  isCreating: boolean = false;

  // Thêm các properties mới
  showQuantityModal: boolean = false;
  selectedProduct: ProductDetailResponse | null = null;
  tempQuantity: number = 1;
  quantityError: string = '';
  isValidQuantity: boolean = true;

  // Thêm biến để theo dõi trạng thái loading cho từng sản phẩm
  processingProducts: Set<number> = new Set();

  // Thêm biến để lưu trạng thái switch
  autoPrintInvoice: boolean = false;

  // Thêm biến để lưu trữ tất cả khách hàng
  allCustomers: UserResponse[] = [];

  currentUserName: string = '';

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private voucherService: VoucherService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private pdfExportService: PdfExportService,
    private authService: AuthService
  ) {
    this.loadCustomers();
    this.addNewEmptyOrder();
    this.setupCustomerSearch();
  }

  ngOnInit(): void {
    // Load existing data
    const loadData$ = forkJoin({
      productDetails: this.productService.getAllProductDetails(),
      customers: this.userService.getUserByRole('CUSTOMER')
    });

    loadData$.subscribe({
      next: (data) => {
        this.productDetails = data.productDetails;
        this.allCustomers = data.customers;
        this.filteredCustomers = [...this.allCustomers]; // Khởi tạo danh sách lọc
        this.filterProducts();
        
        // Set default customer
        const defaultCustomer = this.allCustomers.find(c => c.id === this.defaultCustomerId);
        if (defaultCustomer) {
          this.selectedCustomer = defaultCustomer;
          this.updateOrderCustomerInfo(defaultCustomer);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.isLoading = false;
      }
    });

    // Lấy thông tin người dùng hiện tại
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserName = currentUser.fullName;
    }
  }
  getValidVoucher(amount: number): void {
    if (amount <= 0) {
      this.listVoucher = [];
      this.currentOrder.voucherCode = '';
      return;
    }

    // Làm tròn số tiền trước khi gửi lên server
    const roundedAmount = Math.round(amount / 1000) * 1000;
    
    this.voucherService.getValidVoucher(roundedAmount).subscribe({
      next: (vouchers) => {
        this.listVoucher = vouchers;
        
        // Kiểm tra voucher hiện tại
        if (this.currentOrder.voucherCode) {
          const isVoucherValid = vouchers.some(v => v.code == this.currentOrder.voucherCode);
          if (!isVoucherValid) {
            this.currentOrder.voucherCode = '';
            this.snackBar.open('Voucher đã được gỡ bỏ do không còn hợp lệ', 'Đóng', {
              duration: 3000,
            });
          }
        }
      },
      error: (error) => {
        console.error('Lỗi khi lấy danh sách voucher:', error);
        this.snackBar.open('Không thể lấy danh sách voucher', 'Đóng', {
          duration: 3000,
        });
      }
    });
  }

  addNewEmptyOrder(): void {
    if (this.listOrder.length >= this.maxOrders) {
      console.warn('Maximum number of orders reached');
      return;
    }

    const emptyOrder: OrderRequest = {
      id: Date.now(),
      fullName: this.selectedCustomer?.fullName || '',
      phoneNumber: this.selectedCustomer?.phoneNumber || '',
      address: '',
      orderDetails: [],
      voucherCode: '',
      paymentMethod: 'CASH',
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      shippingFee: 0,
      type: 'POS',
      note: '',
      userId: this.selectedCustomer?.id || this.defaultCustomerId,
      total: 0,
      createdDate: ''
    };

    this.listOrder.push(emptyOrder);
    this.currentOrder = emptyOrder;
  }

  openConfirmDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Xác nhận thanh toán',
        message: `Bạn có chắc chắn muốn thanh toán đơn hàng này?
                 Tổng tiền: ${this.getTotal().toLocaleString()}đ
                 Tiền khách đưa: ${this.customerMoney.toLocaleString()}đ
                 Tiền thừa: ${this.getChange().toLocaleString()}đ`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.processPayment();
      }
    });
  }

  private processPayment(): void {
    if (this.currentOrder.orderDetails.length == 0) {
      this.snackBar.open('Vui lòng thêm sản phẩm vào đơn hàng', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
      return;
    }

    if (this.customerMoney < this.getTotal()) {
      this.snackBar.open('Số tiền khách đưa chưa đủ', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
      return;
    }

    this.isProcessingOrder = true;

    this.currentOrder.paymentStatus = 'PAID';
    this.orderService.createOrder(this.currentOrder).subscribe({
      next: (response) => {
        this.snackBar.open('Tạo đơn hàng thành công!', 'Đóng', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });

        // Nếu autoPrintInvoice được bật, tự động xuất PDF
        if (this.autoPrintInvoice) {
          this.orderService.getOrderDetails(response.id).subscribe((orderDetails) => {
            this.pdfExportService.generateOrderPDF(response, orderDetails);
          });
        }

        // Xóa đơn hàng hiện tại khỏi danh sách
        this.listOrder = this.listOrder.filter(order => order.id !== this.currentOrder.id);

        // Nếu không còn đơn hàng nào, tạo đơn mới
        if (this.listOrder.length == 0) {
          this.addNewEmptyOrder();
        } else {
          // Chọn đơn hàng kế tiếp
          this.currentOrder = this.listOrder[0];
        }

        // Reset các giá trị
        this.customerMoney = 0;
        this.errorMessage = '';
        this.successMessage = '';
      },
      error: (error) => {
        console.error('Error creating order:', error);
        this.snackBar.open('Có lỗi xảy ra khi tạo đơn hàng', 'Đóng', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      },
      complete: () => {
        this.isProcessingOrder = false;
      }
    });
  }

  createOrder(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Xác nhận thanh toán',
        message: `Bạn có chắc chắn muốn thanh toán đơn hàng này?
                 Tổng tiền: ${this.getTotal().toLocaleString()}đ
                 Tiền khách đưa: ${this.customerMoney.toLocaleString()}đ
                 Tiền thừa: ${this.getChange().toLocaleString()}đ`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.processPayment();
      }
    });
  }

  updateOrder(order: OrderRequest): void {
    this.orderService.updateOrder(order).subscribe((updatedOrder) => {
      this.listOrder = this.listOrder.map((o) => o.id == updatedOrder.id ? updatedOrder : o);
    });
  }

  selectOrder(order: OrderRequest): void {
    
    this.currentOrder = order;
    this.getValidVoucher(this.getSubTotal());
  }

  removeOrder(orderId: number): void {
    if (this.listOrder.length > 1) {
      if (this.currentOrder.id == orderId) {
        this.cleanupProducts();
      }
      
      this.listOrder = this.listOrder.filter(o => o.id !== orderId);
      if (this.currentOrder.id == orderId) {
        this.currentOrder = this.listOrder[0];
      }
    }
  }

  filterProducts(): void {
    if (!this.searchTerm) {
      this.filteredProducts = this.productDetails.filter(product => 
        product.active && product.quantity > 0
      );
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredProducts = this.productDetails.filter(product => 
      product.active && 
      product.quantity > 0 && 
      product.productName.toLowerCase().includes(searchTermLower)
    );
  }
  onSelectProductDetail(productDetail: ProductDetailResponse): void {
    if (productDetail.quantity == 0) {
      this.snackBar.open('Sản phẩm đã hết hàng', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
      return;
    }

    this.selectedProduct = productDetail;
    this.tempQuantity = 1;
    this.showQuantityModal = true;
    this.validateQuantity(1);
  }

  plusProductDetailQuantity(id: number): void {
    if (this.processingProducts.has(id)) return;

    const productDetail = this.productDetails.find(pd => pd.id === id);
    const orderDetail = this.currentOrder.orderDetails.find(od => od.productDetailId === id);
    
    if (!productDetail || !orderDetail || productDetail.quantity === 0) return;

    this.processingProducts.add(id);
    this.productService.minusQuantity(id).subscribe({
      next: (remainingQuantity) => {
        orderDetail.quantity++;
        this.updateProductQuantity(id, remainingQuantity);
        this.updateVoucherList();
      },
      error: () => {
        this.snackBar.open('Không thể tăng số lượng sản phẩm', 'Đóng', { duration: 3000 });
      },
      complete: () => this.processingProducts.delete(id)
    });
  }

  minusProductDetailQuantity(id: number): void {
    if (this.processingProducts.has(id)) return;

    const orderDetail = this.currentOrder.orderDetails.find(od => od.productDetailId === id);
    if (!orderDetail || orderDetail.quantity <= 1) return;

    this.processingProducts.add(id);
    this.productService.plusQuantity(id).subscribe({
      next: (remainingQuantity) => {
        orderDetail.quantity--;
        this.updateProductQuantity(id, remainingQuantity);
        this.updateVoucherList();
      },
      error: () => {
        this.snackBar.open('Không thể giảm số lượng sản phẩm', 'Đóng', { duration: 3000 });
      },
      complete: () => this.processingProducts.delete(id)
    });
  }

  getProductName(productDetailId: number): string {
    return this.productDetails.find(p => p.id == productDetailId)?.productName || '';
  }


  getProductPrice(productDetailId: number): number {
    const productDetail = this.productDetails.find(pd => pd.id === productDetailId);
    if (!productDetail) return 0;
    return productDetail.salePrice * (1 - productDetail.discount / 100);
  }

  getSubTotal(): number {
    return Math.round(this.currentOrder.orderDetails.reduce((total, detail) => {
      const price = this.getProductPrice(detail.productDetailId);
      return total + (price * detail.quantity);
    }, 0) / 1000) * 1000;
  }

  getDiscount(): number {
    if (!this.currentOrder.voucherCode) return 0;
    
    const selectedVoucher = this.listVoucher.find(
      v => v.code == this.currentOrder.voucherCode
    );
    
    if (!selectedVoucher) return 0;

    let discountAmount = 0;
    if (selectedVoucher.type == 'PERCENTAGE') {
      discountAmount = (this.getSubTotal() * selectedVoucher.value) / 100;
      if (selectedVoucher.maxDiscountAmount && discountAmount > selectedVoucher.maxDiscountAmount) {
        discountAmount = selectedVoucher.maxDiscountAmount;
      }
    } else {
      discountAmount = selectedVoucher.value;
    }

    // Làm tròn số tiền giảm giá đến hàng nghìn
    return Math.round(discountAmount / 1000) * 1000;
  }

  getTotal(): number {
    // Làm tròn tổng tiền đến hàng nghìn
    return Math.round((this.getSubTotal() - this.getDiscount()) / 1000) * 1000;
  }

  getChange(): number {
    const change = this.customerMoney - this.getTotal();
    return change > 0 ? change : 0;
  }

  removeProduct(productDetailId: number): void {
    const orderDetail = this.currentOrder.orderDetails.find(
      detail => detail.productDetailId == productDetailId
    );
    
    if (orderDetail) {
      const quantity = orderDetail.quantity;
      // Cập nhật local trước
      this.updateLocalProductQuantity(productDetailId, quantity);
      this.currentOrder.orderDetails = this.currentOrder.orderDetails.filter(
        detail => detail.productDetailId !== productDetailId
      );
      
      // Gọi API refill để trả lại toàn bộ số lượng
      this.productService.refillQuantity(productDetailId, quantity).subscribe({
        next: () => {
          this.getValidVoucher(this.getSubTotal());
        },
        error: (error) => {
          console.error('Lỗi khi hoàn trả số lượng:', error);
          this.snackBar.open('Có lỗi xảy ra khi xóa sản phẩm', 'Đóng', {
            duration: 3000,
          });
        }
      });
    }
  }

  validateCustomerMoney(value: any): void {
    let cleanValue = value.toString().replace(/[^0-9]/g, '');
    let numericValue = cleanValue ? Number(cleanValue) : 0;
    
    this.customerMoney = numericValue;
    this.errorMessage = '';

    if (numericValue && numericValue < this.getTotal()) {
      this.errorMessage = 'Số tiền khách đưa chưa đủ';
    } else if (numericValue) {
      this.successMessage = 'Số tiền hợp lệ';
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }
  }

  toggleQRModal(): void {
    this.qrImageUrl = `https://img.vietqr.io/image/TPB-84402072002-print.png?amount=${this.getSubTotal()}&addInfo=Thanh%20toan%20don%20hang%20${this.currentOrder.id}&accountName=DO%20XUAN%20NGA`;
    this.showQRModal = !this.showQRModal;
  }

  isDigitalPayment(): boolean {
    return ['CARD', 'MOMO', 'VNPAY'].includes(this.currentOrder.paymentMethod);
  }

  // Thêm method xử lý thanh toán thành công từ QR
  handleQRPaymentSuccess(): void {
    this.showQRModal = false;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Xác nhận thanh toán',
        message: 'Xác nhận đã nhận được thanh toán qua QR?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Set số tiền khách đưa bằng tổng tiền
        this.customerMoney = this.getTotal();
        // Đóng modal QR
        this.showQRModal = false;
        // Tiến hành thanh toán
        this.processPayment();
      }
    });
  }

  private setupCustomerSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term.trim()) {
          return [];
        }
        return this.userService.searchCustomer(term, term);
      })
    ).subscribe(customers => {
      this.filteredCustomers = customers;
    });
  }

  searchCustomers(): void {
    const searchTerm = this.searchCustomerTerm.toLowerCase().trim();
    
    // Nếu searchTerm rỗng, hiển thị tất cả khách hàng
    if (!searchTerm) {
      this.filteredCustomers = [...this.allCustomers];
      return;
    }

    // Lọc khách hàng dựa trên tên hoặc số điện thoại
    this.filteredCustomers = this.allCustomers.filter(customer => 
      customer.fullName.toLowerCase().includes(searchTerm) || 
      (customer.phoneNumber && customer.phoneNumber.includes(searchTerm)) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm))
    );

    console.log('Search term:', searchTerm); // Debug
    console.log('Filtered customers:', this.filteredCustomers); // Debug
  }

  onCustomerSelected(customer: UserResponse): void {
    this.selectedCustomer = customer;
    this.updateOrderCustomerInfo(customer);
    this.searchCustomerTerm = ''; // Clear search term
    this.filteredCustomers = []; // Clear results
    this.showCustomerDropdown = false;
  }

  clearSelectedCustomer(): void {
    this.selectedCustomer = null;
    this.currentOrder.fullName = '';
    this.currentOrder.phoneNumber = '';
    this.currentOrder.userId = this.defaultCustomerId;
  }

  openAddCustomerModal(): void {
    this.showAddCustomerModal = true;
    this.customerError = '';
    this.newCustomer = {
      id: 0,
      password: '',
      fullName: '',
      phoneNumber: '',
      email: '',
      username: '',
      role: 'CUSTOMER'
    };
  }

  closeAddCustomerModal() {
    this.showAddCustomerModal = false;
  }

  async createNewCustomer() {
    try {
      this.isCreating = true;
      this.customerError = '';
      
      // Check if customer already exists
      const existingCustomers = await firstValueFrom(
        this.userService.searchCustomer(this.newCustomer.fullName, this.newCustomer.phoneNumber)
      );

      if (existingCustomers.length > 0) {
        this.customerError = 'Khách hàng đã tồn tại trong hệ thống!';
        this.isCreating = false;
        return;
      }

      // Create new customer
      const createdCustomer = await firstValueFrom(
        this.userService.createWalkInUser(this.newCustomer)
      );

      // Thêm khách hàng mới vào danh sách
      this.allCustomers = [...this.allCustomers, createdCustomer];
      this.filteredCustomers = [...this.allCustomers];
      
      // Tự động chọn khách hàng vừa tạo
      this.selectedCustomer = createdCustomer;
      this.updateOrderCustomerInfo(createdCustomer);
      
      // Đóng modal và hiển thị thông báo thành công
      this.closeAddCustomerModal();
      this.snackBar.open('Thêm khách hàng mới thành công!', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
      
    } catch (error) {
      console.error('Lỗi khi thêm khách hàng:', error);
      this.customerError = 'Có lỗi xảy ra khi thêm khách hàng. Vui lòng thử lại!';
    } finally {
      this.isCreating = false;
    }
  }

  private loadCustomers(): void {
    this.userService.getUserByRole('CUSTOMER').subscribe({
      next: (customers) => {
        this.allCustomers = customers;
        this.filteredCustomers = customers; // Ban đầu hiển thị tất cả
        // Set default customer
        const defaultCustomer = customers.find(c => c.id == this.defaultCustomerId);
        if (defaultCustomer) {
          this.selectedCustomer = defaultCustomer;
          this.updateOrderCustomerInfo(defaultCustomer);
        }
      },
      error: (error) => console.error('Error loading customers:', error)
    });
  }

  private updateOrderCustomerInfo(customer: UserResponse): void {
    this.currentOrder.userId = customer.id;
    this.currentOrder.fullName = customer.fullName;
    this.currentOrder.phoneNumber = customer.phoneNumber;
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler() {
    this.cleanupProducts();
  }

  private cleanupProducts(): void {
    if (this.currentOrder?.orderDetails?.length > 0) {
      this.currentOrder.orderDetails.forEach(detail => {
        this.productService.refillQuantity(detail.productDetailId, detail.quantity).subscribe({
          next: () => {
            console.log(`Đã hoàn trả số lượng sản phẩm thành công`);
          },
          error: (error) => {
            console.error('Lỗi khi hoàn trả số lượng:', error);
          }
        });
      });
    }
  }

  ngOnDestroy(): void {
    this.cleanupProducts();
  }

  // Thêm method kiểm tra số lượng sản phẩm có sẵn
  isProductAvailable(productDetail: ProductDetailResponse): boolean {
    // Chỉ kiểm tra sản phẩm active và số lượng > 0
    return productDetail.active && productDetail.quantity > 0;
  }

  // Thêm method lấy số lượng còn lại có thể thêm
  getAvailableQuantity(productDetailId: number): number {
    const productDetail = this.productDetails.find(pd => pd.id == productDetailId);
    if (!productDetail) return 0;
    return productDetail.quantity;
  }


  private updateLocalProductQuantity(productDetailId: number, change: number): void {
    this.productDetails = this.productDetails.map(product => ({
      ...product,
      quantity: product.id == productDetailId 
          ? product.quantity + change
        : product.quantity
    }));

    this.filterProducts();
  }

  getProductColor(productDetailId: number): string {
    const productDetail = this.productDetails.find(p => p.id == productDetailId);
    return productDetail ? productDetail.color : '';
  }

  // Thêm hàm tiện ích để format số tiền
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  // Thêm method mới để cập nhật voucher
  private updateVoucherList(): void {
    const subtotal = this.getSubTotal();
    if (subtotal <= 0) {
      this.listVoucher = [];
      this.currentOrder.voucherCode = '';
      return;
    }

    this.voucherService.getValidVoucher(subtotal).subscribe({
      next: (vouchers) => {
        this.listVoucher = vouchers;
        if (this.currentOrder.voucherCode && 
            !vouchers.some(v => v.code === this.currentOrder.voucherCode)) {
          this.currentOrder.voucherCode = '';
          this.snackBar.open('Voucher đã được gỡ bỏ do không còn hợp lệ', 'Đóng', {
            duration: 3000,
          });
        }
      },
      error: () => {
        this.snackBar.open('Không thể cập nhật danh sách voucher', 'Đóng', {
          duration: 3000,
        });
      }
    });
  }

  getCurrentQuantityInCart(productDetailId: number): number {
    return this.currentOrder.orderDetails
      .find(od => od.productDetailId == productDetailId)?.quantity || 0;
  }

  // Thêm các methods mới
  validateQuantity(value: any): void {
    // Kiểm tra nếu không phải số
    if (!/^\d+$/.test(value.toString())) {
      this.quantityError = 'Vui lòng chỉ nhập số';
      this.isValidQuantity = false;
      return;
    }

    const quantity = parseInt(value);
    
    if (quantity <= 0) {
      this.quantityError = 'Số lượng phải lớn hơn 0';
      this.isValidQuantity = false;
    } else if (this.selectedProduct && quantity > this.selectedProduct.quantity) {
      this.quantityError = 'Số lượng vượt quá hàng tồn kho';
      this.isValidQuantity = false;
    } else {
      this.quantityError = '';
      this.isValidQuantity = true;
    }
    
    this.tempQuantity = quantity;
  }

  closeQuantityModal(): void {
    this.showQuantityModal = false;
    this.selectedProduct = null;
    this.tempQuantity = 1;
    this.quantityError = '';
  }

  confirmAddToCart(): void {
    if (!this.selectedProduct || !this.isValidQuantity) return;

    this.productService.minusQuantityInPos(this.selectedProduct.id, this.tempQuantity).subscribe({
      next: (remainingQuantity) => {
        const existingOrderDetail = this.currentOrder.orderDetails.find(
          od => od.productDetailId == this.selectedProduct!.id
        );

        if (existingOrderDetail) {
          existingOrderDetail.quantity += this.tempQuantity;
        } else {
          this.currentOrder.orderDetails.push({
            productDetailId: this.selectedProduct!.id,
            quantity: this.tempQuantity
          });
        }

        // Cập nhật số lượng tồn kho
        this.productDetails = this.productDetails.map(product => {
          if (product.id == this.selectedProduct!.id) {
            return { ...product, quantity: remainingQuantity };
          }
          return product;
        });

        this.getValidVoucher(this.getSubTotal());
        this.filterProducts();
        this.closeQuantityModal();
      },
      error: (error) => {
        console.error('Lỗi khi thêm sản phẩm:', error);
        this.snackBar.open('Không thể thêm sản phẩm', 'Đóng', {
          duration: 3000,
        });
      }
    });
  }

  // Thêm hàm helper để tái sử dụng
  private updateProductQuantity(id: number, remainingQuantity: number): void {
    this.productDetails = this.productDetails.map(product => 
      product.id === id ? { ...product, quantity: remainingQuantity } : product
    );
    this.filterProducts();
  }

  @HostListener('document:click', ['$event'])
  closeCustomerDropdown(event: any): void {
    if (!event.target.closest('.customer-search-container')) {
      this.showCustomerDropdown = false;
    }
  }
}
