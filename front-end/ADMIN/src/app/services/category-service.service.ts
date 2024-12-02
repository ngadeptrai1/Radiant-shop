import { Injectable } from '@angular/core';
import { ApiService } from './api-service.service';
import { Observable } from 'rxjs';
import { Category, CategoryReq } from '../../type';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private readonly endpoint = 'categories';

  constructor(private apiService: ApiService) { }

  getAllCategories(): Observable<Category[]> {
    return this.apiService.get<Category[]>(this.endpoint+'/get-all');
  }

  getCategoryById(id: number): Observable<Category> {
    return this.apiService.get<Category>(`${this.endpoint}/${id}`);
  }

  createCategory(category: CategoryReq): Observable<Category> {
    return this.apiService.post<Category>(this.endpoint, category);
  }

  updateCategory(category: CategoryReq): Observable<Category> {
    return this.apiService.put<Category>(`${this.endpoint}/${category.id}`, category);
  }

  deleteCategory(id: number): Observable<Category> {
    return this.apiService.delete<Category>(`${this.endpoint}/${id}`);
  }
}
