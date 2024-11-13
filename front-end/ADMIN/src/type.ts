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