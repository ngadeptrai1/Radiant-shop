import { Injectable } from '@angular/core';
import axios from 'axios';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { OrderRequest } from '../../type';
interface PayOSResponse {
  code: any
  desc: any
  data: Data
  signature: any
}

export interface Data {
  bin: any
  accountNumber: any
  accountName: any
  amount: any
  description: any
  orderCode: any
  curency: any
  paymentLinkId: any
  status: any
  checkoutUrl: any
  qrCode: any
}


@Injectable({
  providedIn: 'root'
})
export class PayosService {

  private API_URL = 'https://api-merchant.payos.vn';
  private CLIENT_ID = '4a591da5-e9af-4760-a33b-833f7d6e6279';
  private API_KEY = '1a9a0200-afb5-408e-8048-2f7fc8bbb542';

  constructor(private http: HttpClient) {}

  // Tạo đơn thanh toán
  createPaymentOrder(data: {
    orderCode: string;
    amount: number;
    description: string;
    returnUrl: string;
    cancelUrl: string;
  }): Observable<any> {
    let signature = this.generateSignature(data);

    // Convert axios promise to Observable using 'from'
    return from(axios.post(`${this.API_URL}/v1/payments/create`, {
      orderCode: data.orderCode,
      amount: data.amount,
      description: data.description,
      returnUrl: data.returnUrl,
      cancelUrl: data.cancelUrl,
      signature: signature
    }, {
      headers: {
        'x-api-key': this.API_KEY,
        'x-client-id': this.CLIENT_ID,
        'Content-Type': 'application/json'
      }
    }));
  }

  // Kiểm tra trạng thái thanh toán
  async checkPaymentStatus(orderCode: number) {
    try {
      const response = await axios.get(`${this.API_URL}/v1/payments/${orderCode}`, {
        headers: {
          'x-api-key': this.API_KEY
        }
      });

      return {
        status: response.data.status,
        amount: response.data.amount,
        transactionId: response.data.transactionId
      };
    } catch (error) {
      console.error('Lỗi kiểm tra trạng thái thanh toán:', error);
      throw error;
    }
  }
  generateSignature(data: any) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(data)));
  }
}