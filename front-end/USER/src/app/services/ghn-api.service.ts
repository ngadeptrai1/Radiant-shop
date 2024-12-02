import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

// Định nghĩa interface cho địa chỉ
export interface AddressData {
  provinceId?: number;
  provinceName?: string;
  districtId?: number;
  districtName?: string;
  wardCode?: string;
  wardName?: string;
  address?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GhnApiService {
  private readonly BASE_URL = 'https://online-gateway.ghn.vn/shiip/public-api/master-data';
  private readonly TOKEN = 'd98b0799-57f9-11ef-8bc2-4a97213a3cb1'; // Token từ GHN
  private readonly SAVED_ADDRESS_KEY = 'ghn_saved_addresses';
  private savedAddressesSubject = new BehaviorSubject<AddressData[]>([]);
  savedAddresses$ = this.savedAddressesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadSavedAddresses();
  }

  // Headers mặc định cho API
  private getHeaders(): HttpHeaders {
    return new HttpHeaders()
      .set('Token', this.TOKEN)
      .set('Content-Type', 'application/json');
  }

  // Lấy địa chỉ đã lưu từ localStorage
  private loadSavedAddresses(): void {
    const savedAddresses = localStorage.getItem(this.SAVED_ADDRESS_KEY);
    if (savedAddresses) {
      this.savedAddressesSubject.next(JSON.parse(savedAddresses));
    }
  }

  // Lưu địa chỉ mới
  saveAddress(address: AddressData): void {
    const currentAddresses = this.savedAddressesSubject.value;
    // Kiểm tra địa chỉ trùng lặp
    const isDuplicate = currentAddresses.some(addr => 
      addr.provinceId === address.provinceId &&
      addr.districtId === address.districtId &&
      addr.wardCode === address.wardCode
    );

    if (!isDuplicate) {
      const updatedAddresses = [...currentAddresses, address];
      localStorage.setItem(this.SAVED_ADDRESS_KEY, JSON.stringify(updatedAddresses));
      this.savedAddressesSubject.next(updatedAddresses);
    }
  }

  // Xóa địa chỉ đã lưu
  removeAddress(index: number): void {
    const currentAddresses = this.savedAddressesSubject.value;
    currentAddresses.splice(index, 1);
    localStorage.setItem(this.SAVED_ADDRESS_KEY, JSON.stringify(currentAddresses));
    this.savedAddressesSubject.next(currentAddresses);
  }

  // Lấy danh sách địa chỉ đã lưu
  getSavedAddresses(): AddressData[] {
    return this.savedAddressesSubject.value;
  }

  // Cập nhật địa chỉ đã lưu
  updateAddress(index: number, address: AddressData): void {
    const currentAddresses = this.savedAddressesSubject.value;
    currentAddresses[index] = address;
    localStorage.setItem(this.SAVED_ADDRESS_KEY, JSON.stringify(currentAddresses));
    this.savedAddressesSubject.next(currentAddresses);
  }

  // Lấy danh sách tỉnh/thành phố
  getProvinces(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/province`, {
      headers: this.getHeaders()
    });
  }

  // Lấy danh sách quận/huyện theo tỉnh/thành
  getDistricts(provinceId: number): Observable<any> {
    return this.http.get(`${this.BASE_URL}/district`, {
      headers: this.getHeaders(),
      params: { province_id: provinceId }
    });
  }

  // Lấy danh sách phường/xã theo quận/huyện
  getWards(districtId: number): Observable<any> {
    return this.http.get(`${this.BASE_URL}/ward`, {
      headers: this.getHeaders(),
      params: { district_id: districtId }
    });
  }

  // Tính phí vận chuyển
  calculateShippingFee(data: {
    from_district_id: number;
    to_district_id: number;
    to_ward_code: string;
    weight: number;
    insurance_value: number;
    coupon: any;
    height: number;
    length: number;
    width: number;
    service_id: number;
  }|any): Observable<any> {
    return this.http.post(
      'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee',
      data,
      { headers: this.getHeaders() }
    );
  }

  getAvailableServices(fromDistrictId: number, toDistrictId: number): Observable<any> {
    return this.http.get(
      'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services',
      {
        headers: this.getHeaders(),
        params: {
          shop_id: 5255878,
          from_district: fromDistrictId,
          to_district: toDistrictId
        }
      }
    );
  }
}
