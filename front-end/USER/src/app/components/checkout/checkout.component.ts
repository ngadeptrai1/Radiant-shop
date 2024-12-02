import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ProductDetail } from '../../../type';

interface CartItem {
  productDetail: ProductDetail;
  quantity: number;
  thumbnail: string;
  name: string;
  color: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartService.getCartItems().subscribe(items => {
      this.cartItems = items;
    });
  }

  formatPrice(price: number): string {
    return price.toLocaleString('vi-VN') + '₫';
  }

  getDiscountedPrice(detail: ProductDetail): number {
    return detail.salePrice * (1 - (detail.discount || 0) / 100);
  }

  updateQuantity(productDetailId: number, event: any): void {
    const newQuantity = parseInt(event.target.value);
    if (newQuantity > 0) {
      this.cartService.updateQuantity(productDetailId, newQuantity);
    }
  }

  removeFromCart(productDetailId: number): void {
    this.cartService.removeFromCart(productDetailId);
  }

  increaseQuantity(item: CartItem): void {
    if (item.quantity < item.productDetail.quantity) {
      this.cartService.updateQuantity(item.productDetail.id, item.quantity + 1);
    }
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.productDetail.id, item.quantity - 1);
    }
  }

  getSubTotal(): number {
    return this.cartItems.reduce((total, item) => {
      return total + (item.productDetail.salePrice * item.quantity);
    }, 0);
  }
  getTotalDiscount(): number {
    return this.cartItems.reduce((total, item) => {
      return total + ((item.productDetail.salePrice - this.getDiscountedPrice(item.productDetail)) * item.quantity);
    }, 0);
  }
  getTotalAmount(): number {
    return this.getSubTotal() - this.getTotalDiscount();
  }
}
