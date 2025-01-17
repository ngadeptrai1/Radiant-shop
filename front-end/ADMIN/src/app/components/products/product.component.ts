import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Color, Brand, Category, ProductRequest, ProductResponse } from '../../../type';
import { MatPaginator } from '@angular/material/paginator';
import { ProductService } from '../../services/product.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../constant/confirm-dialog.component';
import { MatSort } from '@angular/material/sort';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { BrandService } from '../../services/brand-service.service';
import { CategoryService } from '../../services/category-service.service';
import { ColorService } from '../../services/color.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [MatTableModule, MatSort,
    MatPaginator,RouterLink,
    MatProgressSpinnerModule,MatIcon,
    MatChipsModule  ,
    MatButtonModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule,
    MatButton,MatSlideToggle,CommonModule
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
})
export class ProductComponent {
  displayedColumns: string[] = ['id', 'name', 'thumbnail', 'activate', 'category', 'brand', 'quantity', 'actions'];
  dataSource: MatTableDataSource<ProductResponse>;
  isLoading = false;
  categories: Category[] = [];
  brands: Brand[] = [];
  colors: Color[] = [];
  product: ProductResponse[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor(
    private productService: ProductService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private colorService: ColorService,
    private router: Router
  ) {
    this.dataSource = new MatTableDataSource<ProductResponse>();
  }

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
    this.loadBrands();
    this.loadColors();
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  loadProducts() {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.product = products;
        this.dataSource.data = this.product;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      }
    });
  }
  loadCategories() {
    // Fetch category IDs from API
    this.categoryService.getAllCategories().subscribe((categories) => {
      this.categories = categories;
    });
  }
  
  loadBrands() {
    // Fetch brand IDs from API 
    this.brandService.getAllbrands().subscribe((brands) => {
      this.brands = brands;
    });
  }
  
  loadColors() {
    // Fetch color IDs from API
    this.colorService.getAllColors().subscribe((colors) => {
      this.colors = colors;
    });
  }
  
  openDialog(product?: ProductResponse) {
    if (product) {
      this.router.navigate(['/update-product', product.id]);
    } else {
      this.router.navigate(['/add-product']);
    }
  }
  
  
  updateProduct(product: ProductRequest) {
    this.isLoading = true;
    this.productService.updateProduct(product, product.id).subscribe({
      next: (updatedProduct) => {
        const index = this.dataSource.data.findIndex(p => p.id === product.id);
        if (index !== -1) {
          this.dataSource.data[index] = updatedProduct;
          this.dataSource.data = [...this.dataSource.data];
        }
        this.showSnackBar('Cập nhật sản phẩm thành công');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.showSnackBar('Lỗi khi cập nhật sản phẩm');
        this.isLoading = false;
      }
    });
  }
  
  deleteProduct(product: ProductResponse) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Xác nhận xóa', message: `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?` }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.productService.deleteProduct(product.id).subscribe({
          next: (updatedProduct) => {
            const index = this.dataSource.data.findIndex(p => p.id === product.id);
            if (index !== -1) {
              this.dataSource.data[index] = updatedProduct;
              this.dataSource.data = [...this.dataSource.data];
            }
            this.showSnackBar('Xóa trạng thái sản phẩm thành công');
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error deleting product:', error);
            this.showSnackBar('Lỗi khi xóa sản phẩm');
            this.isLoading = false;
          }
        });
      }
    });
  }
  
  private showSnackBar(message: string) {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
