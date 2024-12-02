import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product, PaginationParams, Products } from '../../type';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private url = `/products`;

  constructor(private apiService: ApiService) {}

  getProducts(params:PaginationParams) :Observable<Products>{
    return this.apiService.get(this.url,{
      params,
      responseType:"json"
    });
  }

  getProduct(id:any) :Observable<Product>{
    return this.apiService.get(this.url+"/"+id)
  }
  getProductsByIds(ids: string[]): Observable<Product[]> {
    const requests = ids.map(id => this.getProduct(id));
    return forkJoin(requests);
  }

  getProductsByCategory(categoryId: any):Observable<Products> {
    return this.apiService.get(this.url+"/category/"+categoryId);
  }

  getProductsByBrand(brandId: number): Observable<Products> {
      return this.apiService.get(this.url+"/brand/"+brandId);
  }

}
