import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product, ProductDetail } from '../../../type';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CartService } from '../../services/cart.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductReviewService } from '../../services/product-review.service';
import { ProductReview } from '../../../type';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { VoucherService } from '../../services/voucher.service';
import { Voucher } from '../../../type';

import { NestedVoucherComponent } from "../nested-voucher/nested-voucher.component";

@Component({
  selector: 'app-detail-product',
  standalone: true,
  imports: [RouterLink, FormsModule, ReactiveFormsModule, CommonModule, NgxSpinnerModule,
    MatSnackBarModule, NestedVoucherComponent],
  templateUrl: './detail-product.component.html',
  styleUrl: './detail-product.component.css',
})
export class DetailProductComponent implements OnInit {
  product?: Product;
  selectedQuantity: number = 1;
  selectedProductDetail?: ProductDetail;
  currentImageIndex: number = 0;
  userRating: number = 0;
  isLoading: boolean = true;
  reviewForm: FormGroup;
  reviews: ProductReview[] = [];
  isSubmittingReview = false;
  isLoadingReviews: boolean = true;
  isLoadingVouchers: boolean = true;
  vouchers: Voucher[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private fb: FormBuilder,
    private reviewService: ProductReviewService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private voucherService: VoucherService
  ) {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      reviewText: ['', [Validators.required, Validators.minLength(10)]],
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });
  }

  ngOnInit() {
    this.isLoading = true;
    this.isLoadingReviews = true;
    this.isLoadingVouchers = true;
    
    // Load tất cả data cần thiết
    Promise.all([
      this.loadProduct(),
      this.loadReviews(),
      this.loadVouchers()
    ]).finally(() => {
      this.isLoading = false;
    });
    
    // Pre-fill form if user is logged in
    if (this.authService.isAuthenticated()) {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.reviewForm.patchValue({
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber
        });
      }
    }
  }

  loadProduct() {
    return new Promise((resolve) => {
      const productId = this.route.snapshot.params['id'];
      if (productId) {
        this.productService.getProduct(productId).subscribe({
          next: (data) => {
            this.product = data;
            this.selectDefaultProductDetail();
            resolve(true);
          },
          error: (error) => {
            console.error('Error fetching product:', error);
            this.showError('Không thể tải thông tin sản phẩm');
            this.router.navigate(['/products']);
            resolve(false);
          }
        });
      }
    });
  }

  selectDefaultProductDetail() {
    if (!this.product) return;

    // Tìm sản phẩm chi tiết đầu tiên có active = true
    let firstActiveDetail: ProductDetail | undefined;
    this.product.productDetails.forEach(
      (detail) => {
        if (detail.active) {
          firstActiveDetail = detail;
        }
      } 
    );
    
    if (firstActiveDetail) {
      this.selectedProductDetail = firstActiveDetail;
      
      // Tìm index của hình ảnh đầu tiên (nếu có)
        this.currentImageIndex = 0;
      
    } else {
      this.showInactiveProductMessage();
    }
  }

  selectProductDetail(detail: ProductDetail) {
    if (!detail.active || detail.quantity === 0) {
      this.showError('Sản phẩm này hiện không có sẵn');
      return;
    }
    this.selectedProductDetail = detail;
    this.selectedQuantity = 1;
  }

  showInactiveProductMessage() {
    alert('Sản phẩm hiện không hoạt động');
    this.router.navigate(['/product-list']);
  }

  changeMainImage(index: number) {
    this.currentImageIndex = index;
  }

  setRating(rating: number) {
    this.reviewForm.patchValue({ rating });
  }

  isRatingSelected(star: number): boolean {
    return star <= this.userRating;
  }

  formatPrice(price: number): string {
    return price.toLocaleString('vi-VN') + '₫';
  }

  onQuantityChange(event: any) {
    const value = parseInt(event.target.value);
    if (value < 1) {
      this.selectedQuantity = 1;
    }
    
    // Kiểm tra số lượng tồn kho
    if (this.selectedProductDetail && value > this.selectedProductDetail.quantity) {
      this.selectedQuantity = this.selectedProductDetail.quantity;
      alert('Số lượng đã đạt giới hạn tồn kho');
    }
  }

  getDiscountedPrice(detail: ProductDetail): number {
    return detail.salePrice * (1 - detail.discount / 100);
  }

  addToCart(): void {
    if (!this.selectedProductDetail || !this.product) {
      alert('Vui lòng chọn màu sắc sản phẩm');
      return;
    }

    if (this.selectedQuantity > this.selectedProductDetail.quantity) {
      alert('Số lượng vượt quá tồn kho');
      return;
    }

    this.cartService.addToCart(
      this.selectedProductDetail,
      this.selectedQuantity,
      this.product?.thumbnail || '',
      this.product?.name || '',
      this.selectedProductDetail.color || ''
    );
  }

  private loadReviews() {
    return new Promise((resolve) => {
      const productId = this.route.snapshot.params['id'];
      if (productId) {
        this.reviewService.getByProductId(productId).subscribe({
          next: (reviews) => {
           
            this.reviews = reviews;
            console.log(this.reviews);
            this.isLoadingReviews = false;
            resolve(true);
          },
          error: (error) => {
            console.error('Error loading reviews:', error);
            this.showError('Không thể tải đánh giá sản phẩm');
            this.isLoadingReviews = false;
            resolve(false);
          }
        });
      }
    });
  }

  submitReview() {
    if (this.reviewForm.invalid) {
      this.showError('Vui lòng điền đầy đủ thông tin đánh giá');
      return;
    }

    if (this.isSubmittingReview || !this.product) return;

    this.isSubmittingReview = true;
    const review: ProductReview = {
      ...this.reviewForm.value,
      productId: this.product.id,
      productName: this.product.name,
      thumbnail: this.product.thumbnail,
      reviewDate: new Date(),
      active: true,
      id: 0 // API sẽ tự sinh ID
    };

    this.reviewService.create(review).subscribe({
      next: (newReview) => {
        this.reviews.unshift(newReview);
        this.reviewForm.reset();
        this.showSuccess('Đánh giá của bạn đã được gửi thành công');
        this.isSubmittingReview = false;
      },
      error: (error) => {
        console.error('Error submitting review:', error);
        this.showError('Không thể gửi đánh giá. Vui lòng thử lại sau');
        this.isSubmittingReview = false;
      }
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private loadVouchers() {
    return new Promise((resolve) => {
      this.voucherService.getAll().subscribe({
        next: (vouchers) => {
          this.vouchers = vouchers;
          this.isLoadingVouchers = false;
          resolve(true);
        },
        error: (error) => {
          console.error('Error loading vouchers:', error);
          this.showError('Không thể tải mã giảm giá');
          this.isLoadingVouchers = false;
          resolve(false);
        }
      });
    });
  }

  buyNow(): void {
    if (!this.selectedProductDetail || !this.product) {
      this.showError('Vui lòng chọn màu sắc sản phẩm');
      return;
    }

    if (this.selectedQuantity > this.selectedProductDetail.quantity) {
      this.showError('Số lượng vượt quá tồn kho');
      return;
    }

    // Thêm sản phẩm vào giỏ hàng
    this.cartService.addToCart(
      this.selectedProductDetail,
      this.selectedQuantity,
      this.product?.thumbnail || '',
      this.product?.name || '',
      this.selectedProductDetail.color || ''
    );

    // Chuyển hướng đến trang thanh toán
    this.router.navigate(['/payment']);
  }
}
