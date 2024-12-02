import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { OrderDetailResponse, OrderRequest, OrderResponse } from '../../type';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly BASE_URL = '/orders';
  private currentOrder: any = null;

  constructor(private apiService: ApiService) { }

  createOrder(orderRequest: OrderRequest): Observable<OrderResponse> {
    return this.apiService.post<OrderResponse>(this.BASE_URL+"/website", orderRequest);
  }

  getOrderById(orderId: number): Observable<OrderResponse> {
    return this.apiService.get<OrderResponse>(`${this.BASE_URL}/${orderId}`);
  }

  getOrdersByUserId(userId: number): Observable<OrderResponse[]> {
    return this.apiService.get<OrderResponse[]>(`${this.BASE_URL}/user/${userId}`);
  }

  getOrderDetailById(orderId: number): Observable<OrderDetailResponse[]> {
    return this.apiService.get<OrderDetailResponse[]>(`${this.BASE_URL}/order-details/${orderId}`);
  }

  setCurrentOrder(order: any) {
    this.currentOrder = order;
  }

  getCurrentOrder() {
    return this.currentOrder;
  }

  cancelOrder(orderId: number, reason: string): Observable<OrderResponse> {
    return this.apiService.post(`${this.BASE_URL}/${orderId}/cancel?reason=${reason}`, {});
  }
}
