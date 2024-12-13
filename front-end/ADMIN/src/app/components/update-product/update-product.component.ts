import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Brand, Category, Color, ProductDetailResponse, ProductRequest, ProductResponse } from '../../../type';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category-service.service';
import { BrandService } from '../../services/brand-service.service';
import { ColorService } from '../../services/color.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-update-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './update-product.component.html'
})
export class UpdateProductComponent implements OnInit {
  form: FormGroup;
  categories: Category[] = [];
  brands: Brand[] = [];
  colors: Color[] = [];
  isLoading = false;
  productId: number;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private colorService: ColorService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.form = this.createForm();
  }

  ngOnInit() {
    this.loadData();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      activate: [true],
      categoryId: [null, [Validators.required]],
      brandId: [null, [Validators.required]],
      productDetails: this.fb.array([])
    });
  }

  private loadData() {
    this.isLoading = true;
    Promise.all([
      this.categoryService.getAllCategories().toPromise(),
      this.brandService.getAllbrands().toPromise(),
      this.colorService.getAllColors().toPromise(),
      this.productService.getProductById(this.productId).toPromise(),
      this.productService.getProductDetailsById(this.productId).toPromise()
    ]).then(([categories, brands, colors, product, details]) => {
      this.categories = categories || [];
      this.brands = brands || [];
      this.colors = colors || [];
      this.initializeForm(product!, details!);
      this.isLoading = false;
    }).catch(error => {
      this.showSnackBar('Lỗi khi tải dữ liệu');
      this.isLoading = false;
    });
  }

  private initializeForm(product: ProductResponse, details: ProductDetailResponse[]) {
  
    
    this.form.patchValue({
      id: product.id,
      name: product.name,
      description: product.description,
      activate: product!.activate,
      categoryId: this.getCategoryId(product.category),
      brandId: this.getBrandId(product.brand)
    });

    details.forEach(detail => {
      this.addProductDetail(detail);
    });
  }

  private getCategoryId(categoryName: string): number | null {
    const category = this.categories.find(c => c.name === categoryName);
    return category?.id || null;
  }

  private getBrandId(brandName: string): number | null {
    const brand = this.brands.find(b => b.name === brandName);
    return brand?.id || null;
  }

  get productDetails(): FormArray {
    return this.form.get('productDetails') as FormArray;
  }

  addProductDetail(detail?: ProductDetailResponse) {
    console.log(detail);
    
    const productDetailForm = this.fb.group({
      id: [detail?.id],
      salePrice: [detail?.salePrice, [Validators.required, Validators.min(0)]],
      discount: [detail?.discount ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]],
      quantity: [detail?.quantity, [Validators.required, Validators.min(0)]],
      colorId: [this.getColorId(detail?.color), [Validators.required]],
      active: [detail?.active]
    });

    this.setupColorValidation(productDetailForm);
    this.productDetails.push(productDetailForm);
  }

  private getColorId(colorName?: string): number | null {
    if (!colorName) return null;
    const color = this.colors.find(c => c.name === colorName);
    return color?.id || null;
  }

  private setupColorValidation(form: FormGroup) {
    form.get('colorId')?.valueChanges.subscribe(newColorId => {
      if (newColorId) {
        const existingColors = this.productDetails.controls
          .filter(control => control !== form)
          .map(control => control.get('colorId')?.value);

        if (existingColors.includes(Number(newColorId))) {
          form.get('colorId')?.setErrors({ duplicateColor: true });
        } else {
          const errors = form.get('colorId')?.errors;
          if (errors) {
            delete errors['duplicateColor'];
            form.get('colorId')?.setErrors(Object.keys(errors).length ? errors : null);
          }
        }
      }
    });
  }

  removeProductDetail(index: number) {
    if (this.productDetails.length <= 1) {
      this.showSnackBar('Phải có ít nhất một chi tiết sản phẩm');
      return;
    }

    const detail = this.productDetails.at(index);
    if (detail.get('id')?.value) {
      this.showSnackBar('Không thể xóa chi tiết sản phẩm đã có trong hệ thống');
      return;
    }
    this.productDetails.removeAt(index);
  }

  onSubmit() {
    if (this.form.valid) {
      const colors = this.productDetails.controls
        .filter(control => control.get('active')?.value)
        .map(control => control.get('colorId')?.value);
      
      const uniqueColors = new Set(colors);
      if (colors.length !== uniqueColors.size) {
        this.showSnackBar('Không thể có hai chi tiết sản phẩm đang hoạt động cùng màu!');
        return;
      }

      const formValue = this.form.value;
      const productRequest: ProductRequest = {
        id: formValue.id,
        name: formValue.name,
        description: formValue.description,
        activate: formValue.activate,
        categoryId: formValue.categoryId,
        brandId: formValue.brandId,
        productDetails: formValue.productDetails,
        thumbnail: null,
        productImages: []
      };

      this.isLoading = true;
      this.productService.updateProduct(productRequest, this.productId).subscribe({
        next: () => {
          this.showSnackBar('Cập nhật sản phẩm thành công');
          this.router.navigate(['/products']);
        },
        error: () => {
          this.showSnackBar('Lỗi khi cập nhật sản phẩm');
          this.isLoading = false;
        }
      });
    }
  }

  private showSnackBar(message: string) {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}
