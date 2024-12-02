import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../type';
import { ProductReviewService } from '../../services/product-review.service';
import { WishlistService } from '../../services/wishlist.service';
import { tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent {
  @Input() product!: Product;
  averageRating: number = 0;
  protected readonly Array = Array;
  protected readonly Math = Math;
  isInWishlistFlag: boolean = false;
  private snackBar = inject(MatSnackBar);
  authService = inject(AuthService);
  productReviewService = inject(ProductReviewService);
  wishlistService = inject(WishlistService);

  ngOnInit() {
    if (this.product) {
      this.productReviewService.getAverageRating(this.product.id).subscribe(rating => {
        this.averageRating = rating;
      });
      this.checkWishlistStatus();
    }
  }

  checkWishlistStatus() {
    this.wishlistService.isInWishlist(this.product.id).subscribe(
      status => this.isInWishlistFlag = status
    );
  }

  toggleWishlist() {
    if (!this.authService.isAuthenticated()) {
      this.showMessage('Vui lòng đăng nhập để sử dụng tính năng này');
      return;
    }

    if (this.isInWishlistFlag) {
      this.wishlistService.deleteFromWishlist(this.product.id).subscribe({
        next: () => {
          this.isInWishlistFlag = false;
          this.showMessage('Đã xóa khỏi danh sách yêu thích');
        },
        error: () => {
          this.showMessage('Có lỗi xảy ra khi xóa khỏi danh sách yêu thích', true);
        }
      });
    } else {
      this.wishlistService.addToWishlist(this.product.id).subscribe({
        next: () => {
          this.isInWishlistFlag = true;
          this.showMessage('Đã thêm vào danh sách yêu thích');
        },
        error: () => {
          this.showMessage('Có lỗi xảy ra khi thêm vào danh sách yêu thích', true);
        }
      });
    }
  }

  private showMessage(message: string, isError = false) {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  calculateFinalPrice(detail: any): number {
    if (!detail) return 0;
    const originalPrice = detail.salePrice;
    const discount = detail.discount || 0;
    return originalPrice - (originalPrice * discount / 100);
  }

  getFirstActivePrice(): number {
    if (!this.product.productDetails 
      || this.product.productDetails.length == 0) return 0;
    
    // Tìm sản phẩm chi tiết đầu tiên có active = true
    const activeDetail = this.product.productDetails.find(detail => detail.active);
    if (activeDetail) {
      return this.calculateFinalPrice(activeDetail);
    }
    return 0;
  }

  getStarClass(position: number): string {
    if (this.averageRating >= position) {
      return 'fas fa-star';
    } else if (this.averageRating > position - 1) {
      return 'fas fa-star-half-alt';
    }
    return 'far fa-star';
  }

}
