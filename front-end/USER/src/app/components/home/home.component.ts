import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { BrandService } from '../../services/brand.service';
import { CategoryService } from '../../services/category.service';
import { Product, Brand, Category, Voucher } from '../../../type';
import { NgOptimizedImage } from '@angular/common';
import { LoadingComponent } from '../shared/loading/loading.component';
import { VoucherService } from '../../services/voucher.service';
import { NestedVoucherComponent } from '../nested-voucher/nested-voucher.component';
import { ProductComponent } from '../product/product.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RouterLink, LoadingComponent,NestedVoucherComponent, ProductComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  brands: Brand[] = [];
  categories: Category[] = [];
  loadingProducts: boolean = false;
  loadingBrands: boolean = false;
  loadingCategories: boolean = false;
  error: string = '';
  currentPage: number = 0;
  pageSize: number = 8;
  totalPages: number = 0;
  loadingVouchers: boolean = false;
  vouchers: Voucher[] = [];
  constructor(
    private productService: ProductService,
    private brandService: BrandService,
    private categoryService: CategoryService,
    private router: Router,
    private voucherService: VoucherService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadBrands();
    this.loadCategories();
    this.loadVouchers();
  }

  loadProducts(): void {
    this.loadingProducts = true;
    this.productService.getProducts({page:this.currentPage,size:this.pageSize,sort:"id",direction:"asc"}).subscribe({
      next: (response) => {
        this.products = response.content;
        this.totalPages = response.totalPages;
        this.loadingProducts = false;
      },
      error: (error) => {
        this.error = 'Không thể tải sản phẩm';
        this.loadingProducts = false;
        console.error('Error loading products:', error);
      },
    });
  }

  loadBrands(): void {
    this.loadingBrands = true;
    this.brandService.getAllBrands().subscribe({
      next: (brands) => {
        this.brands = brands;
        this.loadingBrands = false;
      },
      error: (error) => {
        console.error('Error loading brands:', error);
        this.loadingBrands = false;
      },
    });
  }

  loadCategories(): void {
    this.loadingCategories = true;
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loadingCategories = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loadingCategories = false;
      },
    });
  }
  loadVouchers(): void {
    this.loadingVouchers = true;
    this.voucherService.getAll().subscribe({
      next: (vouchers) => {
        this.vouchers = vouchers;
        this.loadingVouchers = false;
      },
      error: (error) => {
        console.error('Error loading vouchers:', error);
        this.loadingVouchers = false;
      },
    });
  }

  loadMore(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  onProductClick(id: number): void {
    this.router.navigate(['/product', id]);
  }
}
