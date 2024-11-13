import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Options } from '../../type';


@Injectable({
  providedIn: 'root'
})

export class ApiService {

  defaultUrl : string = "http://localhost:8080/api/v1/";
  constructor(
    private httpClient : HttpClient
  ) { }
  get<T> (url : String, option? : Options): Observable<T>{
    return this.httpClient.get<T>(this.defaultUrl+url ,option) as Observable<T>;
  }
  post<T>(url : String, data : any): Observable<T>{
    return this.httpClient.post<T>(this.defaultUrl+url ,data) as Observable<T>;
  }
  put<T>(url: String, data: any, options?: any): Observable<T> {
    return this.httpClient.put<T>(this.defaultUrl + url, data, options) as Observable<T>;
  }
  delete<T>(url: String, options?: any): Observable<T> {
    return this.httpClient.delete<T>(this.defaultUrl + url, options) as Observable<T>;
  }
}
