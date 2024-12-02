import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { Category, Brand, ProductDetailResponse, ProductRequest, ProductResponse, Color } from '../../../type';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    CommonModule,MatDialogContent,MatDialogActions
  ],
  templateUrl: './product-dialog.component.html'
})
export class ProductDialogComponent {
  form: FormGroup;
  dialogTitle: string;
  categories: Category[] = [];
  brands: Brand[] = [];
  colors: Color[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      product?: ProductResponse, 
      categories: Category[], 
      brands: Brand[], 
      colors: Color[] 
    }
  ) {
    this.categories = this.data.categories;
    this.brands = this.data.brands;
    this.colors = this.data.colors;
    this.dialogTitle = data.product ? 'Cập nhật sản phẩm' : 'Thêm mới sản phẩm';

    this.form = this.fb.group({
      id: [data.product?.id],
      name: [data.product?.name, [Validators.required]],
      description: [data.product?.description, [Validators.required]],
      activate: [data.product?.activate ?? true],
      categoryId: [this.getCategoryId(data.product?.category), [Validators.required]],
      brandId: [this.getBrandId(data.product?.brand), [Validators.required]],
      productDetails: this.fb.array([])
    });

    if (data.product?.productDetails) {
      data.product.productDetails.forEach(detail => {
        this.addProductDetail(detail);
      });
    } else {
      this.addProductDetail();
    }
  }

  private getCategoryId(categoryName?: string): number | null {
    if (!categoryName) return null;
    const category = this.categories.find(c => c.name === categoryName);
    return category?.id || null;
  }

  private getBrandId(brandName?: string): number | null {
    if (!brandName) return null;
    const brand = this.brands.find(b => b.name === brandName);
    return brand?.id || null;
  }

  private getColorId(colorName?: string): number | null {
    if (!colorName) return null;
    const color = this.colors.find(c => c.name === colorName);
    return color?.id || null;
  }

  get productDetails(): FormArray {
    return this.form.get('productDetails') as FormArray;
  }

  addProductDetail(detail?: ProductDetailResponse) {
    const productDetailForm = this.fb.group({
      id: [detail?.id],
      salePrice: [detail?.salePrice ?? null, [Validators.required, Validators.min(0)]],
      discount: [detail?.discount ?? 0, [Validators.required, Validators.min(0), Validators.max(100)]],
      quantity: [detail?.quantity ?? null, [Validators.required, Validators.min(0)]],
      colorId: [this.getColorId(detail?.color), [Validators.required]],
      active: [detail?.active ?? true]
    });

    productDetailForm.get('colorId')?.valueChanges.subscribe(newColorId => {
      if (newColorId) {
        const currentIndex = this.productDetails.controls.length;
        const existingColors = this.productDetails.controls
          .filter((_, index) => index !== currentIndex - 1)
          .map(control => control.get('colorId')?.value);

        if (existingColors.includes(Number(newColorId))) {
          productDetailForm.get('colorId')?.setErrors({ duplicateColor: true });
        } else {
          const errors = productDetailForm.get('colorId')?.errors;
          if (errors) {
            delete errors['duplicateColor'];
            productDetailForm.get('colorId')?.setErrors(Object.keys(errors).length ? errors : null);
          }
        }
      }
    });
    
    this.productDetails.push(productDetailForm);
    this.form.updateValueAndValidity();
  }

  removeProductDetail(index: number) {
    if (this.productDetails.length <= 1) {
      alert('Phải có ít nhất một chi tiết sản phẩm');
      return;
    }

    const detail = this.productDetails.at(index);
    if (detail.get('id')?.value) {
      alert('Không thể xóa chi tiết sản phẩm đã có trong hệ thống.');
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
        alert('Không thể có hai chi tiết sản phẩm đang hoạt động cùng màu!');
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
        productDetails: formValue.productDetails.map((detail: any) => ({
          ...detail,
          colorId: Number(detail.colorId)
        })),
        thumbnail: null,
        productImages: []
      };
      
      this.dialogRef.close(productRequest);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}