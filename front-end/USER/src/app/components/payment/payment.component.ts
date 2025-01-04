import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { GhnApiService, AddressData } from '../../services/ghn-api.service';
import { CartService } from '../../services/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { CartItem, OrderRequest } from '../../../type';
import { VoucherService } from '../../services/voucher.service';
import { Voucher } from '../../../type';
import { AuthService } from '../../services/auth.service';
import { UserAddressService } from '../../services/user-address.service';
import { UserAddress } from '../../../type';
import { forkJoin, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit, OnDestroy {
  paymentForm: FormGroup;
  cartItems: CartItem[] = [];
  provinces: any[] = [];
  districts: any[] = [];
  wards: any[] = [];
  savedAddresses: AddressData[] = [];
  totalAmount = 0;
  shippingFee = 0;
  discountAmount = 0;
  isLoading = false;
  subTotal = 0;
  voucherAmount = 0;
  isProcessing = false;
  availableVouchers: Voucher[] = [];
  selectedVoucher: Voucher | null = null;
  isLoggedIn = false;
  userAddresses: UserAddress[] = [];
  selectedAddress: UserAddress | null = null;
  availableServices: any[] = [];
  selectedServiceId: number | null = null;
  isApplyingVoucher = false;
  constructor(
    private fb: FormBuilder,
    private ghnService: GhnApiService,
    private cartService: CartService,
    private snackBar: MatSnackBar,
    private router: Router,
    private orderService: OrderService,
    private voucherService: VoucherService,
    private authService: AuthService,
    private userAddressService: UserAddressService,
    private productService: ProductService
  ) {
    this.paymentForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      provinceId: ['', Validators.required],
      provinceName: [''],
      districtId: ['', Validators.required],
      districtName: [''],
      wardCode: ['', Validators.required],
      wardName: [''],
      address: ['', [Validators.required, Validators.minLength(5)]],
      note: [''],
      paymentMethod: ['CASH', Validators.required],
      voucherCode: [''],
      type: ['WEB'],
      status: ['PENDING'],
      paymentStatus: ['UNPAID']
    });
   
  }

  ngOnInit() {
    this.isLoggedIn = this.authService.isAuthenticated();
    
    // Load cart items và provinces cho tất cả người dùng
    this.loadCartItems();
    this.loadProvinces();
    
    // Chỉ load địa chỉ người dùng nếu đã đăng nhập
    if (this.isLoggedIn) {
      this.loadUserAddresses();
    } else {
      // Nếu chưa đăng nhập, khôi phục form data từ session storage nếu có
      this.restoreAddressFromSession();
    }

    // Khôi phục thông tin shipping từ session storage
    const savedShippingInfo = sessionStorage.getItem('shippingInfo');
    if (savedShippingInfo) {
      const shippingInfo = JSON.parse(savedShippingInfo);
      this.selectedServiceId = shippingInfo.serviceId;
      this.shippingFee = shippingInfo.fee;
      
      // Nếu có địa chỉ đã chọn, tính lại phí ship
      if (shippingInfo.districtId && shippingInfo.wardCode) {
        this.calculateShippingFee(shippingInfo.districtId);
      }
    }
  }

  private loadUserAddresses() {
    this.userAddressService.getAll().subscribe({
      next: (addresses) => {
        this.userAddresses = addresses;
        
        // Kiểm tra địa chỉ đã chọn từ session storage
        const savedAddressId = sessionStorage.getItem('selectedAddressId');
        if (savedAddressId) {
          const savedAddress = addresses.find(addr => addr.id === Number(savedAddressId));
          if (savedAddress) {
            this.selectUserAddress(savedAddress);
          }
        } else if (addresses.length > 0 && !this.paymentForm.get('provinceId')?.value) {
          // Chỉ select địa chỉ đầu tiên nếu form chưa có dữ liệu
          this.selectUserAddress(addresses[0]);
        }
      },
      error: (error) => {
        console.error('Error loading addresses:', error);
        this.showError('Không thể tải danh sách địa chỉ');
      }
    });
  }

  private loadProvinces() {
    this.ghnService.getProvinces().subscribe(
      response => {
        this.provinces = response.data;
      },
      error => {
        this.showError('Không thể tải danh sách tỉnh thành');
      }
    );
  }


  selectUserAddress(address: UserAddress) {
    if (!this.isLoggedIn) return; // Chỉ cho phép chọn địa chỉ khi đã đăng nhập
    
    this.selectedAddress = address;
    sessionStorage.setItem('selectedAddressId', address.id.toString());
    
    this.paymentForm.patchValue({
      fullName: address.fullname,
      phoneNumber: address.phoneNumber,
      email: address.email,
      provinceId: address.provinceId,
      provinceName: address.provinceName,
      districtId: address.districtId,
      districtName: address.districtName,
      wardCode: address.wardCode,
      wardName: address.wardName,
      address: address.address
    });

    this.loadDistrictsAndWards(address);
  }

  private loadDistrictsAndWards(address: UserAddress) {
    this.ghnService.getDistricts(address.provinceId).subscribe({
      next: (response) => {
        if (response.code === 200 && response.data) {
          this.districts = response.data;
          
          this.ghnService.getWards(address.districtId).subscribe({
            next: (wardResponse) => {
              if (wardResponse.code === 200 && wardResponse.data) {
                this.wards = wardResponse.data;
                if (this.selectedServiceId) {
                  this.calculateShippingFee(address.districtId);
                } else {
                  this.loadAvailableServices(address.districtId);
                }
              }
            }
          });
        }
      }
    });
  }

  private restoreAddressFromSession() {
    const formData = sessionStorage.getItem('paymentFormData');
    if (formData) {
      const savedData = JSON.parse(formData);
      this.paymentForm.patchValue(savedData);
      
      // Load related data
      if (savedData.provinceId) {
        this.ghnService.getDistricts(savedData.provinceId).subscribe({
          next: (response) => {
            this.districts = response.data;
            if (savedData.districtId) {
              this.ghnService.getWards(savedData.districtId).subscribe({
                next: (wardResponse) => {
                  this.wards = wardResponse.data;
                }
              });
            }
          }
        });
      }
    }
  }

  // Cập nhật phương thức calculateShippingFee
  calculateShippingFee(districtId: number) {
    if (!this.selectedServiceId || !this.paymentForm.get('wardCode')?.value) {
      return;
    }

    // Tính tổng số lượng sản phẩm
    const totalItems = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Tính trọng lượng dựa vào số lượng sản phẩm
    const weight = totalItems > 10 ? 10000 : 200; // 10kg nếu > 10 sản phẩm, ngược lại 200g

    const shippingData = {
      from_district_id: 1454,
      from_ward_code: "21211",
      to_district_id: districtId,
      to_ward_code: this.paymentForm.get('wardCode')?.value,
      service_id: this.selectedServiceId,
      service_type_id: null,
      height: 50,
      length: 20,
      weight: weight, // Trọng lượng thay đổi theo số lượng sản phẩm
      width: 20,
      insurance_value: 0,
      coupon: null,
      cod_failed_amount: 2000
    };

    this.ghnService.calculateShippingFee(shippingData).subscribe({
      next: (response) => {
        if (response.code === 200 && response.data) {
          this.shippingFee = response.data.total || 0;
          this.calculateTotal();
          
          // Lưu thông tin shipping vào session storage
          const shippingInfo = {
            serviceId: this.selectedServiceId,
            fee: this.shippingFee,
            districtId: districtId,
            wardCode: this.paymentForm.get('wardCode')?.value
          };
          sessionStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));
        }
      },
      error: (error) => {
        console.error('Error calculating shipping fee:', error);
        this.showError('Không thể tính phí vận chuyển');
      }
    });
  }

  // Cleanup khi component bị hủy
  ngOnDestroy() {
    // Xóa dữ liệu session khi rời khỏi trang
    sessionStorage.removeItem('selectedAddressId');
    sessionStorage.removeItem('paymentFormData');
  }

  private loadCartItems() {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
      this.validateCartItems();
      this.calculateSubTotal();
      // Thêm dòng này để load vouchers sau khi tính được subTotal
      this.loadAvailableVouchers();
    });
  }

  private validateCartItems() {
    this.cartItems.forEach(item => {
      if (item.quantity > item.productDetail.quantity) {
        this.showError(`Sản phẩm "${item.name}" vượt quá số lượng tồn kho`);
        item.quantity = item.productDetail.quantity;
        this.cartService.updateQuantity(item.productDetail.id, item.quantity);
      }
    });
  }

  private calculateSubTotal() {
    this.subTotal = this.cartItems.reduce((total, item) => {
      // Calculate price after discount percentage
      const discountPercentage = item.productDetail.discount || 0;
      const discountAmount = (item.productDetail.salePrice * discountPercentage) / 100;
      const finalPrice = item.productDetail.salePrice - discountAmount;
      return total + (finalPrice * item.quantity);
    }, 0);
    this.calculateTotal();
  }

  calculateTotal() {
    this.totalAmount = this.subTotal + this.shippingFee - this.voucherAmount;
  }

  applyCoupon() {
    const code = this.paymentForm.get('voucherCode')?.value;
    if (!code) {
      this.showError('Vui lòng nhập mã giảm giá');
      return;
    }

    this.isApplyingVoucher = true;
    this.voucherService.apply(code, this.subTotal).subscribe({
      next: (voucher) => {
        this.selectedVoucher = voucher;
        this.voucherAmount = this.calculateVoucherDiscount(voucher);
        this.calculateTotal();
        this.showSuccess('Áp dụng mã giảm giá thành công');
        this.paymentForm.patchValue({ voucherCode: '' });
      },
      error: (error) => {
        console.error('Error applying voucher:', error);
        this.showError(  'Mã giảm giá không hợp lệ');
        this.isApplyingVoucher = false;
      },
      complete: () => {
        this.isApplyingVoucher = false;
      }
    });
  }

  // Thêm phương thức kiểm tra sản phẩm
  private async validateProductsAvailability(): Promise<boolean> {
    try {
      // Tạo mảng các Observable để kiểm tra từng sản phẩm
      const checks = this.cartItems.map(item => 
        this.productService.checkActiveProduct(item.productDetail.id)
      );

      // Sử dụng firstValueFrom thay vì toPromise
      const results = await firstValueFrom(forkJoin(checks));
      
      // Tìm các sản phẩm không có sẵn
      const unavailableItems = this.cartItems.filter((item, index) => !results[index]);
      
      if (unavailableItems.length > 0) {
        const itemNames = unavailableItems.map(item => item.name).join(', ');
        this.showError(`Sản phẩm "${itemNames}" hiện không có sẵn`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking product availability:', error);
      this.showError('Không thể kiểm tra trạng thái sản phẩm');
      return false;
    }
  }

  // Sửa lại phương thức onSubmit
  async onSubmit() {
    if (this.isProcessing) {
      return;
    }

    // Validate form
    if (this.paymentForm.invalid) {
      this.showError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Validate cart items
    if (!this.cartItems.length) {
      this.showError('Giỏ hàng của bạn đang trống');
      return;
    }

    // Kiểm tra sản phẩm có sẵn không
    const productsAvailable = await this.validateProductsAvailability();
    if (!productsAvailable) {
      return;
    }

    // Validate shipping service
    if (!this.selectedServiceId) {
      this.showError('Vui lòng chọn phương thức vận chuyển');
      return;
    }

    // Validate stock availability
    const invalidItems = this.cartItems.filter(item => 
      item.quantity > item.productDetail.quantity
    );
    
    if (invalidItems.length > 0) {
      const itemNames = invalidItems.map(item => item.name).join(', ');
      this.showError(`Sản phẩm "${itemNames}" không đủ số lượng trong kho`);
      return;
    }

    // Validate minimum order amount (if needed)
    if (this.subTotal < 10000) { // Example minimum amount
      this.showError('Giá trị đơn hàng tối thiểu là 10,000đ');
      return;
    }

    this.isProcessing = true;

    try {
      const formValue = this.paymentForm.value;
      
      const orderRequest: OrderRequest = {
        fullName: formValue.fullName,
        phoneNumber: formValue.phoneNumber,
        email: formValue.email,
        address: this.formatAddress(formValue),
        orderDetails: this.cartItems.map(item => ({
          productDetailId: item.productDetail.id,
          quantity: item.quantity
        })),
        voucherCode: this.selectedVoucher?.code || '',
        paymentMethod: formValue.paymentMethod,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        shippingCost: this.shippingFee,
        type: 'WEB',
        note: formValue.note || '',
        userId: this.isLoggedIn ? Number(this.authService.getCurrentUser()?.id) : null,
      };

      this.orderService.createOrder(orderRequest).subscribe({
        next: (order) => {
          // Lưu order hiện tại
          this.orderService.setCurrentOrder(order);
          
          // Xóa giỏ hàng
          this.cartService.clearCart();
          
          // Xóa dữ liệu session storage
          sessionStorage.removeItem('selectedAddressId');
          sessionStorage.removeItem('paymentFormData');
          
          // Chuyển hướng đến trang thank you
          this.router.navigate(['/thank-you']);
        },
        error: (error) => {
          console.error('Error creating order:', error);
          this.showError('Có lỗi xảy ra khi đặt hàng');
          this.isProcessing = false;
        }
      });
      
    } catch (error) {
      console.error('Error creating order:', error);
      this.showError('Có lỗi xảy ra khi đặt hàng');
      this.isProcessing = false;
    }
  }

  private formatAddress(formValue: any): string {
    const province = this.provinces.find(p => p.ProvinceID === Number(formValue.provinceId))?.ProvinceName;
    const district = this.districts.find(d => d.DistrictID === Number(formValue.districtId))?.DistrictName;
    const ward = this.wards.find(w => w.WardCode === formValue.wardCode)?.WardName;
    
    return `${formValue.address}, ${ward}, ${district}, ${province}`;
  }

  // Load districts when province changes
  onProvinceChange(event: any) {
    const provinceId = event.target.value;
    if (provinceId) {
      // Reset district and ward
      this.paymentForm.patchValue({
        districtId: '',
        wardCode: ''
      });
      this.districts = [];
      this.wards = [];

      // Add loading state if needed
      this.ghnService.getDistricts(Number(provinceId)).subscribe({
        next: (response) => {
          if (response.code === 200 && response.data) {
            this.districts = response.data;
          } else {
            this.showError('Không thể tải danh sách quận huyện');
          }
        },
        error: (error) => {
          console.error('Error loading districts:', error);
          this.showError('Không thể tải danh sách quận huyện');
        }
      });
    }
  }

  // Load wards when district changes
  onDistrictChange(event: any) {
    const districtId = event.target.value;
    if (districtId) {
      this.paymentForm.patchValue({ wardCode: '' });
      this.wards = [];

      this.ghnService.getWards(Number(districtId)).subscribe({
        next: (response) => {
          if (response.code === 200 && response.data) {
            this.wards = response.data;
            // Không tính phí ship ở đây nữa, sẽ tính khi chọn ward
          }
        },
        error: (error) => {
          console.error('Error loading wards:', error);
          this.showError('Không thể tải danh sách phường xã');
        }
      });
    }
  }

  // Use saved address
  useSavedAddress(address: AddressData) {
    // Đầu tiên set provinceId và load districts
    this.paymentForm.patchValue({
      provinceId: address.provinceId
    });

    // Load districts dựa trên provinceId
    this.ghnService.getDistricts(Number(address.provinceId)).subscribe({
      next: (response) => {
        if (response.code === 200 && response.data) {
          this.districts = response.data;
          
          // Sau khi có districts, set districtId và load wards
          this.paymentForm.patchValue({
            districtId: address.districtId
          });

          // Load wards dựa trên districtId
          this.ghnService.getWards(Number(address.districtId)).subscribe({
            next: (wardResponse) => {
              if (wardResponse.code === 200 && wardResponse.data) {
                this.wards = wardResponse.data;
                
                // Cuối cùng set wardCode và address
                this.paymentForm.patchValue({
                  wardCode: address.wardCode,
                  address: address.address
                });

                // Tính phí ship sau khi có đầy đủ thông tin
                this.calculateShippingFee(Number(address.districtId));
              }
            },
            error: (error) => {
              console.error('Error loading wards:', error);
              this.showError('Không thể tải danh sách phường xã');
            }
          });
        }
      },
      error: (error) => {
        console.error('Error loading districts:', error);
        this.showError('Không thể tải danh sách quận huyện');
      }
    });
  }

  // Save current address
  saveCurrentAddress() {
    if (!this.isLoggedIn) {
      this.showError('Vui lòng đăng nhập để lưu địa chỉ');
      return;
    }

    if (this.isAddressValid()) {
      const formValue = this.paymentForm.value;
      const address: AddressData = {
        provinceId: formValue.provinceId,
        provinceName: this.getProvinceName(formValue.provinceId),
        districtId: formValue.districtId,
        districtName: this.getDistrictName(formValue.districtId),
        wardCode: formValue.wardCode,
        wardName: this.getWardName(formValue.wardCode),
        address: formValue.address
      };
      
      this.ghnService.saveAddress(address);
      this.showSuccess('Đã lưu địa chỉ thành công');
    }
  }

  // Helper methods to get names
  getProvinceName(id: number): string {
    return this.provinces.find(p => p.ProvinceID === id)?.ProvinceName || '';
  }

  getDistrictName(id: number): string {
    return this.districts.find(d => d.DistrictID === id)?.DistrictName || '';
  }

  getWardName(code: string): string {
    return this.wards.find(w => w.WardCode === code)?.WardName || '';
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  // Kiểm tra form địa chỉ hợp lệ
  isAddressValid(): boolean {
    const form = this.paymentForm;
    return !!(
      form.get('provinceId')?.value &&
      form.get('districtId')?.value &&
      form.get('wardCode')?.value &&
      form.get('address')?.value
    );
  }

  // Thêm thông báo thành công
  private showSuccess(message: string) {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }


  // Thêm phương thức xử lý khi thay đổi phường/xã
  onWardChange() {
    const districtId = this.paymentForm.get('districtId')?.value;
    if (districtId) {
      this.loadAvailableServices(Number(districtId));
    }
  }

  private loadAvailableServices(toDistrictId: number) {
    const defaultFromDistrictId = 1454; // ID quận/huyện shop
    this.ghnService.getAvailableServices(defaultFromDistrictId, toDistrictId).subscribe({
      next: (response) => {
        if (response.code === 200 && response.data && response.data.length > 0) {
          this.availableServices = response.data;
          
          // Tính tổng số lượng sản phẩm
          const totalItems = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
          
          // Chọn dịch vụ dựa vào số lượng sản phẩm
          if (totalItems > 10 && this.availableServices.length > 1) {
            // Nếu số lượng > 10 và có sẵn dịch vụ thứ 2, chọn dịch vụ thứ 2
            this.selectedServiceId = this.availableServices[1].service_id;
          } else {
            // Ngược lại chọn dịch vụ đầu tiên
            this.selectedServiceId = this.availableServices[0].service_id;
          }
          
          // Tính phí ship với dịch vụ đã chọn
          this.calculateShippingFee(toDistrictId);
        } else {
          this.availableServices = [];
          this.selectedServiceId = null;
          this.shippingFee = 0;
          this.showError('Không có dịch vụ vận chuyển khả dụng cho khu vực này');
        }
      },
      error: (error) => {
        console.error('Error loading services:', error);
        this.showError('Không thể tải danh sách dịch vụ vận chuyển');
      }
    });
  }

  private loadAvailableVouchers() {
    if (this.subTotal > 0) {
      this.voucherService.getAvailableVouchers(this.subTotal).subscribe({
        next: (vouchers) => {
          this.availableVouchers = vouchers.filter(voucher => 
            this.subTotal >= (voucher.minOrderAmount || 0)
          );
        },
        error: (error) => {
          console.error('Error loading vouchers:', error);
          this.showError('Không thể tải danh sách voucher');
        }
      });
    } else {
      this.availableVouchers = [];
    }
  }

  applyVoucher(voucher: Voucher) {
    this.voucherService.apply(voucher.code, this.subTotal).subscribe({
      next: (appliedVoucher) => {
        this.selectedVoucher = appliedVoucher;
        this.voucherAmount = this.calculateVoucherDiscount(appliedVoucher);
        this.calculateTotal();
        this.showSuccess('Áp dụng mã giảm giá thành công');
      },
      error: (error) => {
        console.error('Error applying voucher:', error);
        this.showError('Không thể áp dụng mã giảm giá');
      }
    });
  }

  private calculateVoucherDiscount(voucher: Voucher): number {
    if (voucher.type === 'FIXED_AMOUNT') {
      return voucher.value;
    } else {
      const discount = (this.subTotal * voucher.value) / 100;
      return voucher.maxDiscountAmount 
        ? Math.min(discount, voucher.maxDiscountAmount)
        : discount;
    }
  }



  // Thêm phương thức để chọn dịch vụ vận chuyển
  onShippingServiceChange(serviceId: number) {
    this.selectedServiceId = serviceId;
    const districtId = this.paymentForm.get('districtId')?.value;
    const wardCode = this.paymentForm.get('wardCode')?.value;
    if (districtId && wardCode) {
      this.calculateShippingFee(Number(districtId));
    }
  }
}
