import { HttpContext, HttpHeaders, HttpParams } from "@angular/common/http";

export interface Brand {
    id: number;
    name: string;
    thumbnail: string;
    active: boolean;
  }
  
export interface BrandReq {
  id: number;
  name: string;
  thumbnail: File;
  active: boolean;
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
  export interface PaginationParams{
    [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean >;
    page:number;
    size:number;
    sort:string;
    direction:string;
  }
  export interface Category {
    id: number;
    name: string;
    parentCategory?: Category;
    subCategories?: Category[];
    activate: boolean;
  }
  export interface CategoryReq {
    id: number;
    name: string;
    parent_id: Number|undefined;
    activate: boolean;
  }
  export interface Voucher {
    id?: number;
    code: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT';
    value: number;
    maxDiscountAmount: number;
    minOrderAmount: number;
    startDate: Date;
    endDate: Date;
    usageLimit: number;
    description: string;
    usageCount?: number;
    active?: boolean;
    usedAmount:number;
  }
  export interface Color {
    id?: number;
    hexCode: string;
    name: string;
    active: boolean;
  }
  export interface Product {
    id: number;
    name: string;
    description: string;
    activate: boolean;
    thumbnail: string;
    productImages: ProductImage[];
    category: Category;
    brand: Brand;
    productDetails: ProductDetail[];
  }
  
  export interface ProductDetail {
    id: number;
    salePrice: number;
    discount: number;
    quantity: number;
    colorId: number;
  }
  
  export interface ProductImage {
    id: number;
    url: string;
  }
  
  export interface ProductRequest {
    id:number;
    name: string;
    description: string;
    activate: boolean;
    thumbnail: File | null;
    productImages: File[];
    categoryId: number;
    brandId: number;
    productDetails: ProductDetail[];
  }
  
  export interface ProductResponse {
    id: number;
    name: string;
    description: string;
    activate: boolean;
    thumbnail: string;
    productImages: ProductImage[];
    category: string;
    brand: string;
    productDetails: ProductDetailResponse[];
  }
  export interface ProductDetailResponse {
    id: number;
    salePrice: number;
    discount: number;
    thumbnail: string;
    quantity: number;
    productName: string;
    color: string;
    active: boolean;
  }
  export interface OrderRequest {
    id: number;
    fullName: string;
    phoneNumber: string;
    address: string;
    orderDetails: OrderDetail[];
    voucherCode: string;
    paymentMethod: 'CASH' | 'CARD';
    status: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED'|'PROCESSING'|'SUCCESS' |string;
    paymentStatus: 'PAID' | 'UNPAID';
    shippingFee: number;
    type: 'POS' | 'WEB';
    note: string;
    userId: number;
    total: number;
    createdDate: String;
  }
  export interface OrderDetail {

    productDetailId: number;
    quantity: number;

  }
  export interface UserResponse {
    id: number;
    fullName: string;
    phoneNumber: string;
    email: string;
    roles: string[];
    enabled: boolean;
    blocked: boolean;
    createdAt: Date;
    updatedAt: Date;
    username: string;
    provider: string;
    
  }
  export interface UserRequest {
    id: number;
    fullName: string;
    phoneNumber: string;
    email: string;
    password: string;
    role: string;
  }

  export interface OrderResponse {
    id: number
    fullName: string
    phoneNumber: string
    email: any
    address: any
    status: string
    paymentStatus: string
    paymentMethod: string
    totalOrderAmount: number
    shippingCost: number
    voucherAmount: number
    finalAmount: number
    totalItems: number
    type: string
    createdDate: string
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

  export interface OrderStatusCount {
    PENDING: number;
    PROCESSING: number;
    DELIVERED: number;
    SUCCESS: number;
    CANCELLED: number;
}

export interface RevenueChartData {
  labels: string[];
  values: number[];
  total: number;
}

export interface ProductDistributionData {
  categoryName: string;
  productCount: number;
  percentage: number;
}

export interface TopSellingProduct {
  id: number;
  name: string;
  thumbnail: string;
  soldQuantity: number;
  revenue: number;
  category: string;
  inStock: boolean;
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

