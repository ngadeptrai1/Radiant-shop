import { Injectable } from '@angular/core';
import { Options } from '../../type';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private defaultUrl = `${environment.apiUrl}`;

  constructor(private httpClient: HttpClient) { }
  get<T> (url : String, option? : Options): Observable<T>{
    return this.httpClient.get<T>(this.defaultUrl+url ,option) as Observable<T>;
  }

  post<T>(url : String, data : any): Observable<T>{
    return this.httpClient.post<T>(this.defaultUrl+url ,data) as Observable<T>;
  }

  put<T>(url : String, data : any): Observable<T>{
    return this.httpClient.put<T>(this.defaultUrl+url ,data) as Observable<T>;
  }
  delete<T>(url : String): Observable<T>{
    return this.httpClient.delete<T>(this.defaultUrl+url) as Observable<T>;
  }
}
