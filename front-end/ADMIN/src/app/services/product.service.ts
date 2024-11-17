import { Injectable } from '@angular/core';
import { ApiService } from './api-service.service';
import { Observable } from 'rxjs';
import { ProductDetail, ProductRequest, ProductResponse } from '../../type';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly endpoint = 'products';

  constructor(private apiService: ApiService) { }
    getProducts(): Observable<ProductResponse[]> {
    return this.apiService.get<ProductResponse[]>(this.endpoint+'/get-all');
  }

  createProduct(product: FormData, productDetails: ProductDetail[]): Observable<ProductResponse> {
    product.delete('productDetails');
    for(let i = 0; i < productDetails.length; i++) {
      product.append(`productDetails[${i}].salePrice`, productDetails[i].salePrice.toString());
      product.append(`productDetails[${i}].discount`, productDetails[i].discount.toString());
      product.append(`productDetails[${i}].quantity`, productDetails[i].quantity.toString());
      product.append(`productDetails[${i}].colorId`, productDetails[i].colorId.toString());
    }
    return this.apiService.post<ProductResponse>(this.endpoint, product);
  }

  updateProduct(product: ProductRequest, id: number): Observable<ProductResponse> {
    return this.apiService.put<ProductResponse>(`${this.endpoint}/${id}`, product);
  }

  deleteProduct(id: number): Observable<ProductResponse> {
    return this.apiService.delete<ProductResponse>(`${this.endpoint}/${id}`);
  }
  private buildFormData(product: ProductRequest): FormData {
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('activate', product.activate.toString());
    formData.append('thumbnail', product.thumbnail);
    product.productImages.forEach(image => formData.append('productImages', image));
    formData.append('categoryId', product.categoryId.toString());
    formData.append('brandId', product.brandId.toString());
    product.productDetails.forEach(detail => {
      formData.append('productDetails[salePrice]', detail.salePrice.toString());
      formData.append('productDetails[discount]', detail.discount.toString());
      formData.append('productDetails[quantity]', detail.quantity.toString());
      formData.append('productDetails[colorId]', detail.colorId.toString());
    });
    return formData;
  }
}
