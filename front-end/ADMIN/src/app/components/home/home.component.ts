import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentComponent } from '../content/content.component';
import { SlideBarComponent } from '../slide-bar/slide-bar.component';
import { StatisticService } from '../../services/statistic.service';
import Chart from 'chart.js/auto';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ContentComponent, SlideBarComponent, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  todayRevenue: number = 0;
  monthlyRevenue: number = 0;
  yearlyRevenue: number = 0;
  selectedYear: number = new Date().getFullYear();
  availableYears: number[] = [];
  topSellingProducts: any[] = [];

  constructor(private statisticService: StatisticService) {}

  ngOnInit() {
    this.loadStatistics();
    this.loadAvailableYears();
  }

  loadStatistics() {
    this.statisticService.getRevenue('day').subscribe(revenue => {
      this.todayRevenue = revenue;
    });

    this.statisticService.getRevenue('month').subscribe(revenue => {
      this.monthlyRevenue = revenue;
    });

    this.statisticService.getRevenue('year').subscribe(revenue => {
      this.yearlyRevenue = revenue;
    });

    this.statisticService.getTopSellingProducts().subscribe(products => {
      this.topSellingProducts = products;
      this.initTopSellingChart();
    });

    this.loadChartData();
  }

  loadAvailableYears() {
    this.statisticService.getAvailableYears().subscribe(years => {
      this.availableYears = years;
    });
  }

  onYearChange(year: number) {
    this.selectedYear = year;
    this.loadChartData();
  }

  private loadChartData() {
    this.initMonthlyRevenueChart();
    this.initProductDistributionChart();
  }

  private initMonthlyRevenueChart() {
    this.statisticService.getMonthlyRevenueChart(this.selectedYear).subscribe(data => {
      const ctx = document.getElementById('monthlyRevenueChart') as HTMLCanvasElement;
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [{
            label: 'Doanh thu theo tháng',
            data: data.values,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return value.toLocaleString('vi-VN') + 'đ';
                }
              }
            }
          }
        }
      });
    });
  }

  private initProductDistributionChart() {
    this.statisticService.getProductDistribution().subscribe(data => {
      const ctx = document.getElementById('productDistribution') as HTMLCanvasElement;
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: data.map(item => item.categoryName),
          datasets: [{
            data: data.map(item => item.productCount),
            backgroundColor: [
              'rgb(78, 115, 223)',
              'rgb(28, 200, 138)',
              'rgb(54, 185, 204)'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    });
  }

  private initTopSellingChart() {
    if (!this.topSellingProducts || this.topSellingProducts.length === 0) return;

    const ctx = document.getElementById('topSellingChart') as HTMLCanvasElement;
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.topSellingProducts.map(p => p.name),
        datasets: [{
          label: 'Số lượng đã bán',
          data: this.topSellingProducts.map(p => p.soldQuantity),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          barPercentage: 0.5,
          categoryPercentage: 0.8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
}
