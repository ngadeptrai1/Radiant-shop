import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Voucher } from '../../type';

@Injectable({
  providedIn: 'root'
})
export class VoucherService {
  endpoint = '/vouchers';
  constructor(private apiService: ApiService  ) { }

  apply(code: string, totalAmount: number): Observable<Voucher> {
    return this.apiService.get<Voucher>(`${this.endpoint}/apply?code=${code}&totalAmount=${totalAmount}`);
  }

  getAvailableVouchers(totalAmount: number): Observable<Voucher[]> {
    return this.apiService.get<Voucher[]>(`${this.endpoint}/valid?amount=${totalAmount}`);
  }
  getAll(): Observable<Voucher[]> {
    return this.apiService.get<Voucher[]>(`${this.endpoint}/active`);
  }
}
