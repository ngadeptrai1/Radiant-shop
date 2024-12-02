import { Injectable } from '@angular/core';
import { ApiService } from './api-service.service';
import { ProductReview } from '../../type';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductReviewService {
  private productReviewUrl = 'reviews';
  constructor(private apiService: ApiService) { }

  getProductReviews(): Observable<ProductReview[]> {
    return this.apiService.get(this.productReviewUrl);
  }

  getProductReviewById(id: string): Observable<ProductReview> {
    return this.apiService.get(`${this.productReviewUrl}/${id}`);
  }

  deleteProductReview(id: string): Observable<void> {
    return this.apiService.delete(`${this.productReviewUrl}/${id}`);
  }

  rejectProductReview(id: string): Observable<void> {
    return this.apiService.put(`${this.productReviewUrl}/${id}/reject`, {});
  }

  approveProductReview(id: string): Observable<void> {
    return this.apiService.put(`${this.productReviewUrl}/${id}/approve`, {});
  }
  
  
}
