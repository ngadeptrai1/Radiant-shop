import { Injectable } from '@angular/core';
import { ApiService } from './api-service.service';
import { Observable } from 'rxjs';
import { Brand } from '../../type';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
 
  private readonly endpoint = 'brands';

  constructor(private apiService: ApiService) { }

  getAllbrands(): Observable<Brand[]> {
    return this.apiService.get<Brand[]>(this.endpoint);
  }

  getBrandById(id: number): Observable<Brand> {
    return this.apiService.get<Brand>(`${this.endpoint}/${id}`);
  }

  createBrand(brand: FormData): Observable<Brand> {
    
    return this.apiService.post<Brand>(this.endpoint, brand);
  }

  updateBrand(brand: FormData,id:Number): Observable<Brand> {
    return this.apiService.put<Brand>(`${this.endpoint}/${id}`, brand);
  }

  deleteBrand(id: number): Observable<Brand> {
    return this.apiService.delete<Brand>(`${this.endpoint}/${id}`);
  }
}
