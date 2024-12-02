import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../services/wishlist.service';
import { Product } from '../../../type';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ProductComponent } from '../product/product.component';

@Component({
  selector: 'app-wish-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatSnackBarModule, ProductComponent],
  templateUrl: './wish-list.component.html',
  styleUrl: './wish-list.component.css'
})
export class WishListComponent implements OnInit {
  products: Product[] = [];
  loading: boolean = true;
  error: string | null = null;

  private wishlistService = inject(WishlistService);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cookieService = inject(CookieService);

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: '/wishlist' } 
      });
      return;
    }
    this.loadWishlist();
  }

  loadWishlist() {
    this.loading = true;
    const userId = this.cookieService.get('USER_ID');
    if (!userId) {
      this.error = 'Không tìm thấy thông tin người dùng';
      this.loading = false;
      return;
    }

    this.wishlistService.getProducts(userId).subscribe({
      next: (products: Product[]) => {
        this.products = products;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading wishlist:', error);
        this.error = 'Có lỗi xảy ra khi tải danh sách yêu thích';
        this.loading = false;
      }
    });
  }

  removeFromWishlist(productId: number) {
    if (!this.authService.isAuthenticated()) {
      this.showMessage('Vui lòng đăng nhập để sử dụng tính năng này');
      return;
    }

    this.wishlistService.deleteFromWishlist(productId).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== productId);
        this.showMessage('Đã xóa sản phẩm khỏi danh sách yêu thích');
        this.loadWishlist();
      },
      error: (error) => {
        console.error('Error removing from wishlist:', error);
        this.showMessage('Có lỗi xảy ra khi xóa sản phẩm khỏi danh sách yêu thích', true);
      }
    });
  }

  private showMessage(message: string, isError = false) {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
