import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Options } from '../../type';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // https://authen-hkxg.onrender.com/api/v1/
  // http://localhost:8080/api/v1/products?brand=Becosi
  defaultUrl: string = 'https://authen-hkxg.onrender.com/api/v1/';
  constructor(private httpClient: HttpClient) {}
  get<T>(url: String, option?: Options): Observable<T> {
    return this.httpClient.get<T>(
      this.defaultUrl + url,
      option
    ) as Observable<T>;
  }
  post<T>(url: String, data: any): Observable<T> {
    return this.httpClient.post<T>(
      this.defaultUrl + url,
      data
    ) as Observable<T>;
  }
  getTest<T>(): Observable<T> {
    return this.httpClient.get<T>(
      'http://localhost:8080/api/test'
    ) as Observable<T>;
  }
}
