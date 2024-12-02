import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CartItem, ProductDetail } from '../../type';



@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_KEY = 'shopping_cart';
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  private cartItemCount = new BehaviorSubject<number>(0);

  constructor(private snackBar: MatSnackBar) {
    this.loadCart();
  }

  private loadCart(): void {
    const savedCart = localStorage.getItem(this.CART_KEY);
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      this.cartItems.next(cart);
      this.updateCartItemCount();
    }
  }

  private saveCart(items: CartItem[]): void {
    localStorage.setItem(this.CART_KEY, JSON.stringify(items));
    this.cartItems.next(items);
    this.updateCartItemCount();
  }

  private updateCartItemCount(): void {
    const count = this.cartItems.value.reduce((acc, item) => acc + item.quantity, 0);
    this.cartItemCount.next(count);
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartItems.asObservable();
  }

  getCartItemCount(): Observable<number> {
    return this.cartItemCount.asObservable();
  }

  addToCart(productDetail: ProductDetail, quantity: number, thumbnail: string, name: string, color: string): void {
    const currentItems = this.cartItems.value;
    const existingItemIndex = currentItems.findIndex(
      item => item.productDetail.id === productDetail.id
    );

    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      const updatedItems = [...currentItems];
      const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
      
      if (newQuantity > productDetail.quantity) {
        this.snackBar.open('Số lượng vượt quá tồn kho!', 'Đóng', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
        return;
      }
      
      updatedItems[existingItemIndex].quantity = newQuantity;
      this.saveCart(updatedItems);
    } else {
      // Add new item with thumbnail
      const newItems = [...currentItems, { 
        productDetail, 
        quantity,
        thumbnail:thumbnail , // Lưu thumbnail từ product
        name: name,
        color: color
      }];
      this.saveCart(newItems);
    }

    this.snackBar.open('Đã thêm sản phẩm vào giỏ hàng!', 'Đóng', {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  removeFromCart(productDetailId: number): void {
    const currentItems = this.cartItems.value;
    const updatedItems = currentItems.filter(
      item => item.productDetail.id !== productDetailId
    );
    this.saveCart(updatedItems);
    
    this.snackBar.open('Đã xóa sản phẩm khỏi giỏ hàng!', 'Đóng', {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  updateQuantity(productDetailId: number, quantity: number): void {
    const currentItems = this.cartItems.value;
    const itemIndex = currentItems.findIndex(
      item => item.productDetail.id === productDetailId
    );

    if (itemIndex !== -1) {
      const updatedItems = [...currentItems];
      updatedItems[itemIndex].quantity = quantity;
      this.saveCart(updatedItems);
    }
  }

  clearCart(): void {
    localStorage.removeItem(this.CART_KEY);
    this.cartItems.next([]);
    this.cartItemCount.next(0);
  }
}
