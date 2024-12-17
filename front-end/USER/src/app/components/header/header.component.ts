import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { CookieService } from 'ngx-cookie-service';
import { Category, ProductDetail } from '../../../type';
import { LoadingComponent } from '../shared/loading/loading.component';
import { NestedCategoryComponent } from "../nested-category/nested-category.component";
import { CartService } from '../../services/cart.service';
import { FormsModule } from '@angular/forms';

interface CartItem {
  productDetail: ProductDetail;
  quantity: number;
  thumbnail: string;
  name: string;
  color: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, LoadingComponent, NestedCategoryComponent,FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  userName: string = '';
  userFullName: string = '';
  userAvatar: string = '';
  categories: Category[] = [];
  loadingCategories: boolean = false;
  activeCategory: string | null = null;
  cartItemCount: number = 0;
  cartItems: CartItem[] = [];
  isCartDropdownVisible: boolean = false;
  email: string = ''; // Biến lưu trữ email
  name: string = '';
  constructor(
    private authService: AuthService,
    private categoryService: CategoryService,
    private router: Router,
    private cartService: CartService,
    private cookieService: CookieService
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (user) {
        this.userName = user.username;
        this.userFullName = user.fullName || user.username;
      } else {
        this.resetUserInfo();
      }
    });

    this.cartService.getCartItemCount().subscribe(count => {
      this.cartItemCount = count;
    });

    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
    });

    console.log(this.cookieService.get('ACCESS_TOKEN1'));
    
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.loadUserProfile();
    }
    this.loadCategories();
  }

  private loadUserProfile() {
    this.authService.getUser().subscribe({
      next: (user) => {
        if (user) {
          this.isLoggedIn = true;
          this.userName = user.username;
          this.userFullName = user.fullName || user.username;
        }
      },
      error: () => {
        this.logout();
      }
    });
  }

  private resetUserInfo() {
    this.isLoggedIn = false;
    this.userName = '';
    this.userFullName = '';
    this.userAvatar = '';
  }

  logout() {
    this.cartService.clearCart();
    this.authService.logout();
    this.router.navigate(['/']);
  }

  loadCategories() {
    this.loadingCategories = true;  
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loadingCategories = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loadingCategories = false;
      }
    });
  }
  setActiveCategory(categoryId: string): void {
    this.activeCategory = categoryId;
  }

  clearActiveCategory(): void {
    this.activeCategory = null;
  }

  hasSubCategories(category: Category): boolean {
    return category.subCategories != undefined && category.subCategories.length > 0;
  }

  formatPrice(price: number): string {
    return price.toLocaleString('vi-VN') + '₫';
  }

  getDiscountedPrice(detail: ProductDetail): number {
    if (!detail) return 0;
    return detail.salePrice * (1 - (detail.discount || 0) / 100);
  }

  getTotalAmount(): number {
    if (!this.cartItems) return 0;
    
    return this.cartItems.reduce((total, item) => {
      if (item?.productDetail) {
        const itemPrice = this.getDiscountedPrice(item.productDetail);
        return total + (itemPrice * (item.quantity || 0));
      }
      return total;
    }, 0);
  }

  toggleCartDropdown(event: Event): void {
    event.stopPropagation();
    this.isCartDropdownVisible = !this.isCartDropdownVisible;
  }

  @HostListener('document:click')
  closeCartDropdown(): void {
    if (this.isCartDropdownVisible) {
      this.isCartDropdownVisible = false;
    }
  }

  onCartDropdownClick(event: Event): void {
    event.stopPropagation();
  }

  onImageError(event: any): void {
    event.target.src = '';
  }

  removeFromCart(productDetailId: number): void {
    event?.stopPropagation();
    this.cartService.removeFromCart(productDetailId);
  }

  isValidCartItem(item: CartItem): boolean {
    return !!(item?.productDetail?.product);
  }
  submitForm() {
    if (this.email) {
      // Chuyển hướng sang trang tra cứu với query params
      this.router.navigate(['/order-lookup'], { queryParams: { email: this.email } });
    }
  }
  submitFormpProduct() {
    console.log(this.name);
    
    if (this.name) {
      // Chuyển hướng sang trang tra cứu với query params
      this.router.navigate(['/product-list'], { queryParams: { name: this.name } });
    }
  }
}
