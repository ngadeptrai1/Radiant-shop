import { HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';

export interface LoginDto {
  userName: string;
  password: string;
}
export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNum: string;
}
export interface Brand {
  id: number;
  name: string;
  thumbnail: string;
  active: boolean;
}

export interface Category {
  id: number;
  name: string;
  parentCategory?: Category ;
  subCategories?: Category[];
  activate: boolean;
}
export interface Product {
  active: boolean;
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  productImages: ProductImage[];
  productDetails: ProductDetail[];

}

export interface ProductImage {
  id: number;
  url: string;
}
export interface Color {
  id: number
  hexCode: string
  name: string
  active: boolean
}


export interface ProductDetail {
  active: boolean;
  id: number;
  salePrice: number;
  discount: number;
  quantity: number;
  thumbnail: string;
  product:Product;
  color:string;
}

export interface Products{
  content:[Product];
  totalElements:number;
  totalPages:number;
  first:boolean;
  last:boolean;
  size:number;
  empty:boolean;
  number:number;
}
export interface PaginationParams{
  [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean >;
  page:number;
  size:number;
  sort:string;
  direction:string;
}
export interface Options{
  headers?: HttpHeaders | {
      [header: string]: string | string[];
  };
  observe?: 'body';
  context?: HttpContext;
  params?: HttpParams | {
      [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
  };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
  transferCache?: {
      includeHeaders?: string[];
  } | boolean;
}
export interface Voucher {
  id: number
  code: string
  type: 'FIXED_AMOUNT' | 'PERCENTAGE'
  value: number
  maxDiscountAmount: any
  minOrderAmount: number
  startDate: Date
  endDate: Date
  usageLimit: number
  description: any
  usedAmount: number
  active: boolean
}
export interface OrderRequest {
  fullName: string;
  phoneNumber: string;
  address: string;
  orderDetails: OrderDetail[];
  voucherCode: string;
  paymentMethod: 'CASH' | 'CARD';
  status: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PAID' | 'UNPAID';
  shippingCost: number;
  type: 'WEB';
  note: string;
  userId: number|null;
  email: string;
}
export interface OrderDetail {
  productDetailId: number;
  quantity: number;
}
export interface OrderResponse {
  id: number
  fullName: string
  phoneNumber: string
  email: any
  address: any
  status: 'PENDING'|'SHIPPED' | 'DELIVERED' | 'CANCELLED'|'PROCESSING'|'SUCCESS'|'DELIVERY_FAILED' |string;
  paymentStatus: string|'REFUNDED';
  paymentMethod: string;
  totalOrderAmount: number;
  shippingCost: number;
  voucherAmount: number;
  finalAmount: number;
  totalItems: number;
  type: string
  createdDate: string;
  updatedDate:string;
  note: string
  userId: number
  voucherCode: any
  reason: string;
}

export interface OrderDetailResponse {
  id: number
  quantity: number
  price: number
  productName: string
  productColor: string
  thumbnail: string
}
export interface CartItem {
  productDetail: ProductDetail;
  quantity: number;
  thumbnail: string;
  name: string;
  color: string;
}

export interface ProductReview {
  id: number;
  rating: number;
  email: string;
  fullName: string;
  reviewText: string;
  productName: string;
  thumbnail: string;
  active: boolean;
  phoneNumber: string;
  reviewDate: Date;
  productId: number;
}
export interface WishlistItem {
  id: number;
  productId: number;
}
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
}


export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
}

export interface UserAddress {
  id: number;
  address: string;
  fullname: string;
  phoneNumber: string;
  email: string;
  userId: number;
  active: boolean;
  provinceId: number;
  provinceName: string;
  districtId: number;
  districtName: string;
  wardCode: string;
  wardName: string;
}
