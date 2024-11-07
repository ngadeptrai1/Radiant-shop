import { HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';

export interface Options {
  headers?:
    | HttpHeaders
    | {
        [header: string]: string | string[];
      };
  observe?: 'body';
  context?: HttpContext;
  params?:
    | HttpParams
    | {
        [param: string]:
          | string
          | number
          | boolean
          | ReadonlyArray<string | number | boolean>;
      };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
  transferCache?:
    | {
        includeHeaders?: string[];
      }
    | boolean;
}
export interface UserInterface {
  email: String;
  token: String;
  accountName: string;
}
export interface ApiResponse<T> {
  message?: String;
  error?: string;
  status?: boolean;
  token?: string;
  data: T;
}

export interface LoginPayload {
  account_name: String;
  password: string;
}
export interface RegisterPayload {
  full_name: string;
  account_name: string;
  password: string;
  email: string;
  rePassword: string;
}
export interface ProductImage {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  quantity: number;
  activate: boolean;
  thumbnail: string;
  product_images: ProductImage[];
  origin_price: number;
  sale_price: number;
  category_id: number;
  brand_id: number;
}

export interface Products {
  content: [Product];
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  size: number;
  empty: boolean;
  number: number;
}
export interface PaginationParams {
  [param: string]:
    | string
    | number
    | boolean
    | ReadonlyArray<string | number | boolean>;
  page: number;
  size: number;
  sort: string;
  direction: string;
}
export interface Brand {
  id: number;
  name: string;
  activate: boolean;
  description: string;
}
export interface Category {
  id: number;
  name: string;
  activate: boolean;
  description: string;
}

export interface Order {
  user_id: number;
  full_name: string;
  phone_number: string;
  address: string;
  note: string;
  status: string;
  total_money: number;
  discount_money: number;
  created_date: Date;
  quantity_product: number;
  attribute_discount: number;
  code: string;
  order_details: Order_detail[];
}
export interface Order_detail {
  product_id: number;
  quantity: number;
}
