import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ProductReview } from '../../type';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductReviewService {
  endpoint = '/reviews';
  constructor(private apiService: ApiService  ) { }
  create(review: ProductReview): Observable<ProductReview> {
    return this.apiService.post<ProductReview>(`${this.endpoint}`, review);
  }
  getByProductId(productId: number): Observable<ProductReview[]> {
    return this.apiService.get<ProductReview[]>(`${this.endpoint}/product/${productId}`);
  }
  getAverageRating(productId: number): Observable<number> {
    return this.apiService.get<number>(`${this.endpoint}/avg-rating/${productId}`);
  }
}
