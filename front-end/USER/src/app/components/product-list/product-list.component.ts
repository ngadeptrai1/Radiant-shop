import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductComponent } from '../product/product.component';
import { ProductService } from '../../services/product.service';
import { Product, Products } from '../../../type';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrandService } from '../../services/brand.service';
import { CategoryService } from '../../services/category.service';
import { forkJoin } from 'rxjs';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, 
    ProductComponent,
    ReactiveFormsModule, 
    NgxSpinnerModule,
    FormsModule, 
    NgxSliderModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products!:Products;
  page !:number|undefined;
  name!:String|null|undefined;
  sort!:string|null|undefined ;
  direction!:string|null|undefined;
  brand!:string|null;
  category!:string|null;
  minPrice!:Number|null;
  maxPrice!:Number|null;

  isLoading = true;
  protected Math = Math;
  currentPage = 1;
  pageSize = 12; // Items per page
  totalItems = 0;
  error: string | null = null;
  filterForm: FormGroup;
  categories: any[] = [];
  brands: any[] = [];

  paramCategories:Number|null=null;
  paramBrands:Number|null=null;

  categorySearch: string = '';
  brandSearch: string = '';
  maxVisibleItems: number = 5;
  showAllCategories: boolean = false;
  showAllBrands: boolean = false;
  priceRange = {
    min: 0,
    max: 10000000,
    currentMin: 0,
    currentMax: 10000000
  };
  dataLoaded: boolean = false;

  sliderOptions = {
    floor: this.priceRange.min,
    ceil: this.priceRange.max,
    step: 100000,
    translate: (value: number): string => {
      return value.toLocaleString('vi-VN') + '₫';
    }
  };

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private cateService: CategoryService,
    private brandService: BrandService
  ) {
    this.filterForm = this.fb.group({
      categories: [[]],
      brands: [[]],
      name: [''],
      minPrice: [0],
      maxPrice: [10000000],
      active: [true],
      sortBy: ['name'],
      direction: ['ASC']
    });
    this.ngOnInit();
  }

  ngOnInit(): void {
    // Subscribe to route query params
    this.route.queryParams.subscribe(params => {
      const formValues = { ...this.filterForm.value };
      
      if (params['category']) {
        formValues.categories = [params['category']];
        this.paramCategories = Number(params['category']);
      }
      if (params['brand']) {
        formValues.brands = [params['brand']];
        this.paramBrands = Number(params['brand']);
      }
      if (params['name']) {
        formValues.name = [params['name']];
        this.name = params['name'];
      }
      
      this.filterForm.patchValue(formValues);
    });

    // Thêm subscription cho thay đổi giá
    this.filterForm.patchValue({
      minPrice: this.priceRange.currentMin,
      maxPrice: this.priceRange.currentMax
    });

    // Load categories and brands
    forkJoin({
      categories: this.cateService.getAllCategories(),
      brands: this.brandService.getAllBrands()
    }).subscribe({
      next: (data) => {
        this.categories = data.categories;
        this.brands = data.brands;
        this.dataLoaded = true;
        this.loadProduct();
      },
      error: (error) => {
        this.error = 'Có lỗi xảy ra khi tải dữ liệu';
        this.dataLoaded = true;
      }
    });
  }

  onFilter(): void {
    this.currentPage = 1; // Reset to first page when filtering
    this.loadProduct();
  }

  loadProduct(): void {
    this.isLoading = true;
    const formValues = this.filterForm.value;
    
    const params: any = {
      page: this.currentPage - 1,
      size: this.pageSize,
      categories: formValues.categories.join(','),
      brands: formValues.brands.join(','),
      name: formValues.name,
      minPrice: formValues.minPrice,
      maxPrice: formValues.maxPrice,
      active: formValues.active,
      sortBy: formValues.sortBy,
      direction: formValues.direction
    };

    // Remove empty values
    Object.keys(params).forEach(key => {
      if (params[key] === null || params[key] === undefined || params[key] === '') {
        delete params[key];
      }
    });

    this.productService.getProducts(params).subscribe({
      next: (products: Products) => {
        this.products = products;
        this.totalItems = products.totalElements;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Có lỗi xảy ra khi tải dữ liệu';
        this.isLoading = false;
      }
    });
  }

  onPageChange(page: number): void {
    if (page !== this.currentPage && page >= 1 && page <= this.getMaxPages()) {
      this.currentPage = page;
      this.loadProduct();
    }
  }

  getMaxPages(): number {
    return Math.ceil(this.products.totalElements / this.pageSize);
  }
  
  getPaginationRange(): number[] {
    const maxPages = this.getMaxPages();
    const current = this.currentPage;
    const delta = 2; // Number of pages to show before and after current page
    
    let start = Math.max(1, current - delta);
    let end = Math.min(maxPages, current + delta);

    // Adjust if we're near the beginning or end
    if (current <= delta) {
      end = Math.min(maxPages, 5);
    }
    if (current >= maxPages - delta) {
      start = Math.max(1, maxPages - 4);
    }

    return Array.from({length: end - start + 1}, (_, i) => start + i);
  }
  onCategoryChange(event:any,id:any){
    const formValues = this.filterForm.value;
    if(event.target.checked){
      formValues.categories.push(id);
    }else{
      formValues.categories = formValues.categories.filter((cat:any) => cat !== id);
    }
    this.filterForm.patchValue(formValues);
  }

  onBrandChange(event:any,id:any){
    const formValues = this.filterForm.value;
    if(event.target.checked){
      formValues.brands.push(id);
    }else{
      formValues.brands = formValues.brands.filter((brand:any) => brand !== id);
    }
  }

  getFilteredCategories() {
    return this.categories.filter(cat => 
      cat.name.toLowerCase().includes(this.categorySearch.toLowerCase())
    );
  }

  getFilteredBrands() {
    return this.brands.filter(brand => 
      brand.name.toLowerCase().includes(this.brandSearch.toLowerCase())
    );
  }

  getVisibleCategories() {
    const filtered = this.getFilteredCategories();
    return this.showAllCategories ? filtered : filtered.slice(0, this.maxVisibleItems);
  }

  getVisibleBrands() {
    const filtered = this.getFilteredBrands();
    return this.showAllBrands ? filtered : filtered.slice(0, this.maxVisibleItems);
  }

  toggleCategories() {
    this.showAllCategories = !this.showAllCategories;
  }

  toggleBrands() {
    this.showAllBrands = !this.showAllBrands;
  }

  onPriceRangeChange(event: any) {
    this.filterForm.patchValue({
      minPrice: event.target.value[0],
      maxPrice: event.target.value[1]
    });
  }

  isCategoryChecked(categoryId: string): boolean {
    const selectedCategories = this.filterForm.get('categories')?.value || [];
    return selectedCategories.includes(categoryId);
  }

  // Thêm method mới để handle thay đổi slider
  onSliderChange(event: any): void {
    this.filterForm.patchValue({
      minPrice: event.value,
      maxPrice: event.highValue
    });
  }
  isBrandChecked(brandId: string): boolean {
    const selectedBrands = this.filterForm.get('brands')?.value || [];
    return selectedBrands.includes(brandId);
  }
}
