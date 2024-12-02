import { Injectable } from '@angular/core';
import { ApiService } from './api-service.service';
import { Observable } from 'rxjs';
import {  RevenueChartData, ProductDistributionData, TopSellingProduct } from '../../type';
@Injectable({
  providedIn: 'root'
})
export class StatisticService {

  constructor( private apiService: ApiService) { }

  // Lấy doanh thu theo ngày/tháng/năm
  getRevenue(type: 'day' | 'month' | 'year'): Observable<number> {
    return this.apiService.get(`statistics/revenue/${type}`);
  }

  // Lấy dữ liệu biểu đồ doanh thu theo tháng trong năm
  getMonthlyRevenueChart(year: number): Observable<RevenueChartData> {
    return this.apiService.get<RevenueChartData>(`statistics/monthly-revenue/${year}`);
  }

  // Lấy dữ liệu phân bổ sản phẩm theo danh mục
  getProductDistribution(): Observable<ProductDistributionData[]> {
    return this.apiService.get<ProductDistributionData[]>('statistics/product-distribution');
  }

  // Lấy top 10 sản phẩm bán chạy
  getTopSellingProducts(): Observable<TopSellingProduct[]> {
    return this.apiService.get<TopSellingProduct[]>('statistics/top-selling');
  }

  // Lấy danh sách năm có dữ liệu
  getAvailableYears(): Observable<number[]> {
    return this.apiService.get<number[]>('statistics/available-years');
  }
}
