import { Injectable } from '@angular/core';
import { ApiService } from './api-service.service';
import { Observable } from 'rxjs';
import { Color } from '../../type';

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  private readonly endpoint = 'colors';

  constructor(private apiService: ApiService) { }

  getAllColors(): Observable<Color[]> {
    return this.apiService.get<Color[]>(this.endpoint);
  }

  getColorById(id: number): Observable<Color> {
    return this.apiService.get<Color>(`${this.endpoint}/${id}`);
  }

  createColor(category: Color): Observable<Color> {
    return this.apiService.post<Color>(this.endpoint, category);
  }

  updateColor(category: Color): Observable<Color> {
    return this.apiService.put<Color>(`${this.endpoint}/${category.id}`, category);
  }

  deleteColor(id: number): Observable<Color> {
    return this.apiService.delete<Color>(`${this.endpoint}/${id}`);
  }
}
