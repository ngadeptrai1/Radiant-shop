import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService } from 'src/app/services/cart.service';
import { GhnApiService } from 'src/app/services/ghn-api.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserAddressService } from 'src/app/services/user-address.service';
import { OrderService } from 'src/app/services/order.service';
import { VoucherService } from 'src/app/services/voucher.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ModalService } from 'src/app/services/modal.service';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit, OnDestroy {
  paymentForm: FormGroup;
  cartItems: CartItem[] = [];
  provinces: any[] = [];
  districts: any[] = [];
  wards: any[] = [];
  isLoggedIn = false;
  userAddresses: UserAddress[] = [];
  selectedAddress: UserAddress | null = null;
  isProcessing = false;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private ghnService: GhnApiService,
    private authService: AuthService,
    private userAddressService: UserAddressService,
    private orderService: OrderService,
    private voucherService: VoucherService,
    private snackBar: MatSnackBar,
    private router: Router,
    private modalService: ModalService
  ) {
    this.paymentForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      provinceId: ['', Validators.required],
      districtId: ['', Validators.required],
      wardCode: ['', Validators.required],
      address: ['', [Validators.required, Validators.minLength(5)]],
      paymentMethod: ['CASH', Validators.required],
      voucherCode: ['']
    });
  }

  ngOnInit() {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.loadCartItems();
    this.loadProvinces();
    if (this.isLoggedIn) {
      this.loadUserAddresses();
    }
  }

  private loadCartItems() {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
    });
  }

  private loadProvinces() {
    this.ghnService.getProvinces().subscribe(response => {
      this.provinces = response.data;
    });
  }

  private loadUserAddresses() {
    this.userAddressService.getAll().subscribe(addresses => {
      this.userAddresses = addresses;
    });
  }

  onSubmit() {
    if (this.paymentForm.invalid) {
      return;
    }

    this.modalService.showModal({
      title: 'Xác nhận đặt hàng',
      message: 'Bạn có chắc chắn muốn đặt hàng không?',
      type: 'info'
    });

    this.modalService.modalConfig$.subscribe(config => {
      if (config) {
        if (config.type === 'confirm') {
          this.placeOrder();
        }
      }
    });
  }

  private placeOrder() {
    this.isProcessing = true;
    const orderData = this.paymentForm.value;
    this.orderService.placeOrder(orderData).subscribe({
      next: () => {
        this.snackBar.open('Đặt hàng thành công!', 'Đóng', { duration: 3000 });
        this.router.navigate(['/order-success']);
      },
      error: () => {
        this.snackBar.open('Đặt hàng thất bại!', 'Đóng', { duration: 3000 });
        this.isProcessing = false;
      }
    });
  }

  ngOnDestroy() {
    // Cleanup logic if needed
  }
}