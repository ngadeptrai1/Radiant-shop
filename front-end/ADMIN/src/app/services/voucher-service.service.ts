import { Injectable } from '@angular/core';
import { ApiService } from './api-service.service';
import { Observable } from 'rxjs';
import { Voucher } from '../../type';

@Injectable({
  providedIn: 'root'
})
export class VoucherService {

  private readonly endpoint = 'vouchers';

  constructor(private apiService: ApiService) { }

  getAllvouchers(): Observable<Voucher[]> {
    return this.apiService.get<Voucher[]>(this.endpoint);
  }

  getVoucherById(id: number): Observable<Voucher> {
    return this.apiService.get<Voucher>(`${this.endpoint}/${id}`);
  }

  createVoucher(voucher: Voucher): Observable<Voucher> {
    const data = {
      code:voucher.code,
      type: voucher.type,
      value: voucher.value,
      maxDiscountAmount: voucher.maxDiscountAmount,
      minOrderAmount: voucher.minOrderAmount,
      startDate:new Date( voucher.startDate).toISOString().slice(0, 19) + 'Z',
      endDate: new Date(voucher.endDate.toString()).toISOString().slice(0, 19) + 'Z',
      usageLimit: voucher.usageLimit,
      description: voucher.description,
      active: voucher.active};      
    return this.apiService.post<Voucher>(this.endpoint, data);
  }

  updateVoucher(voucher: Voucher): Observable<Voucher> {
    const data = {
      code:voucher.code,
      type: voucher.type,
      value: voucher.value,
      maxDiscountAmount: voucher.maxDiscountAmount,
      minOrderAmount: voucher.minOrderAmount,
      startDate:new Date( voucher.startDate).toISOString().slice(0, 19) + 'Z',
      endDate: new Date(voucher.endDate.toString()).toISOString().slice(0, 19) + 'Z',
      usageLimit: voucher.usageLimit,
      description: voucher.description,
      active: voucher.active};
    return this.apiService.put<Voucher>(`${this.endpoint}/${voucher.id}`, data);
  }

  deleteVoucher(id: number): Observable<Voucher> {
    return this.apiService.delete<Voucher>(`${this.endpoint}/${id}`);
  }
  getValidVoucher(amount: number): Observable<Voucher[]> {
    return this.apiService.get<Voucher[]>(`${this.endpoint}/valid?amount=${amount}`);
  }
}
