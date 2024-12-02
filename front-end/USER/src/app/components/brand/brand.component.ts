import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandService } from '../../services/brand.service';
import { RouterLink } from '@angular/router';
import { Brand } from '../../../type';

@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.css',
})
export class BrandComponent implements OnInit {
  brands: Brand[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private brandService: BrandService) {}

  ngOnInit(): void {
    this.brandService.getAllBrands().subscribe({
      next: (data) => {
        this.brands = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Không thể tải dữ liệu thương hiệu';
        this.isLoading = false;
      }
    });
  }
}
