import { Injectable } from '@angular/core';
import { ApiService } from './api-service.service';
import { Observable } from 'rxjs';
import { OrderDetailResponse, OrderRequest, OrderResponse, OrderStatusCount } from '../../type';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly endpoint = 'orders';

  constructor(private apiService: ApiService) { }

  createOrder(order: OrderRequest): Observable<OrderResponse> {
    return this.apiService.post<OrderResponse>(this.endpoint+'/counter', order);
  } 

  getOrders(): Observable<OrderRequest[]> {
    return this.apiService.get<OrderRequest[]>(this.endpoint);
  }

  getOrderById(id: number): Observable<OrderResponse> {
    return this.apiService.get<OrderResponse>(`${this.endpoint}/${id}`);
  }

  updateOrder(order: OrderRequest,): Observable<OrderRequest> {
    return this.apiService.put<OrderRequest>(`${this.endpoint}/${order.id}`, order);
  }

  deleteOrder(id: number): Observable<OrderRequest> {
    return this.apiService.delete<OrderRequest>(`${this.endpoint}/${id}`);
  }

  getOrdersByStatus(status: string): Observable<OrderRequest[]> {
    return this.apiService.get<OrderRequest[]>(`${this.endpoint}?status=${status}`);
  }

  getOrdersByPaymentStatus(paymentStatus: string): Observable<OrderRequest[]> {
    return this.apiService.get<OrderRequest[]>(`${this.endpoint}?paymentStatus=${paymentStatus}`);
  }

  getOrdersByType(type: string): Observable<OrderRequest[]> {
    return this.apiService.get<OrderRequest[]>(`${this.endpoint}?type=${type}`);
  }

  getOrdersByVoucherCode(voucherCode: string): Observable<OrderRequest[]> {
    return this.apiService.get<OrderRequest[]>(`${this.endpoint}?voucherCode=${voucherCode}`);
  }


  getOrdersByCustomer(customerId: number): Observable<OrderRequest[]> {
    return this.apiService.get<OrderRequest[]>(`${this.endpoint}?customerId=${customerId}`);
  }

  getOrdersByProduct(productId: number): Observable<OrderRequest[]> {
    return this.apiService.get<OrderRequest[]>(`${this.endpoint}?productId=${productId}`);
  }

  getOrdersByProductDetail(productDetailId: number): Observable<OrderRequest[]> {
    return this.apiService.get<OrderRequest[]>(`${this.endpoint}?productDetailId=${productDetailId}`);
  }

  getOrdersByDateRangeAndStatus(startDate: string, endDate: string, status: string): Observable<OrderRequest[]> {
    return this.apiService.get<OrderRequest[]>(`${this.endpoint}?startDate=${startDate}&endDate=${endDate}&status=${status}`);
  }

  getOrdersByDateRangeAndPaymentStatus(startDate: string, endDate: string, paymentStatus: string): Observable<OrderRequest[]> {
    return this.apiService.get<OrderRequest[]>(`${this.endpoint}?startDate=${startDate}&endDate=${endDate}&paymentStatus=${paymentStatus}`);
  }

  getOrdersByDateRangeAndType(startDate: string, endDate: string, type: string): Observable<OrderRequest[]> {
    return this.apiService.get<OrderRequest[]>(`${this.endpoint}?startDate=${startDate}&endDate=${endDate}&type=${type}`);
  }

  getOrdersByDateRangeAndVoucherCode(startDate: string, endDate: string, voucherCode: string): Observable<OrderRequest[]> {
    return this.apiService.get<OrderRequest[]>(`${this.endpoint}?startDate=${startDate}&endDate=${endDate}&voucherCode=${voucherCode}`);
  }

  getOrdersByDateRangeAndCustomer(startDate: string, endDate: string, customerId: number): Observable<OrderRequest[]> {
    return this.apiService.get<OrderRequest[]>(`${this.endpoint}?startDate=${startDate}&endDate=${endDate}&customerId=${customerId}`);
  }

  getOrdersByStatusPaginated(status: string, startDate: string, endDate: string , phone: string,name: string,email: string): Observable<any> {
    return this.apiService.get(`${this.endpoint}/status/${status}?startDate=${startDate}&endDate=${endDate}&phone=${phone}&name=${name}&email=${email}  `);
  }

  getOrdersByDateRange(startDate: string, endDate: string, page: number = 0, size: number = 5): Observable<any> {
    return this.apiService.get(
      `${this.endpoint}/date-range?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`
    );
  }

  updatePaymentStatus(orderId: number, paymentStatus: string): Observable<OrderRequest> {
    return this.apiService.put(`${this.endpoint}/${orderId}/payment-status?paymentStatus=${paymentStatus}`, {});
  }

  getOrderStatistics(startDate: string, endDate: string): Observable<any> {
    return this.apiService.get(
      `${this.endpoint}/statistics?startDate=${startDate}&endDate=${endDate}`
    );
  }

  cancelOrder(orderId: number, reason: string): Observable<OrderResponse> {
    return this.apiService.post(`${this.endpoint}/${orderId}/cancel?reason=${reason}`, {});
  }

  updateOrderStatus(orderId: number, status: string): Observable<OrderResponse> {
    return this.apiService.put<OrderResponse>(`${this.endpoint}/${orderId}/status?status=${status}`, {});
  }

  confirmOrder(orderId: number): Observable<OrderResponse> {
    return this.apiService.put<OrderResponse>(`${this.endpoint}/${orderId}/confirm`, {});
  }

  getOrderDetails(orderId: number): Observable<any[]> {
    return this.apiService.get<any[]>(`${this.endpoint}/order-details/${orderId}`);
  }

  getOrderStatusCount(): Observable<OrderStatusCount> {
    return this.apiService.get<OrderStatusCount>(`${this.endpoint}/status-statistics`);
  } 

  addOrderDetail(orderId: number, productDetailId: number, quantity: number): Observable<OrderDetailResponse> {
    return this.apiService.post<OrderDetailResponse>(`${this.endpoint}/${orderId}/order-details`, {
      productDetailId,
      quantity
    });
  }
  
  confirmPayment(orderId: number): Observable<OrderResponse> {
    return this.apiService.put<OrderResponse>(`${this.endpoint}/${orderId}/confirm-payment`, {});
  }

  updateOrderDetail( orderDetailId: number, quantity: number): Observable<OrderDetailResponse> {
    return this.apiService.put<OrderDetailResponse>(
      `${this.endpoint}/details/${orderDetailId}?quantity=${quantity}`, 
    {});
  }

  deleteOrderDetail(orderId: number, orderDetailId: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/details/${orderDetailId}`);
  }

  removeVoucher(orderId: number): Observable<OrderResponse> {
    return this.apiService.delete<OrderResponse>(`${this.endpoint}/${orderId}/voucher`);
  }
  addVoucher(orderId: number, voucherCode: string): Observable<OrderResponse> {
    return this.apiService.put<OrderResponse>(`${this.endpoint}/${orderId}/voucher?code=${voucherCode}`, {});
  }

  markDeliveryFailed(orderId: number, reason: string): Observable<OrderResponse> {
    return this.apiService.put<OrderResponse>(`${this.endpoint}/${orderId}/delivery-failed?reason=${reason}`, {});
  }

  refundPayment(orderId: number): Observable<OrderResponse> {
    return this.apiService.put<OrderResponse>(`${this.endpoint}/${orderId}/refund`, {});
  }
}
