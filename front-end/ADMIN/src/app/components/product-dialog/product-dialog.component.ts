import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { Category, Brand, ProductDetailResponse, ProductRequest, ProductResponse, Color } from '../../../type';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [MatDialogContent,MatFormField,MatLabel
    ,MatError,MatDialogActions,MatSlideToggle,
    ReactiveFormsModule,MatInput,MatButton,
  MatSelect,MatOption,MatIcon,CommonModule],
  templateUrl: './product-dialog.component.html',
  styleUrl: './product-dialog.component.scss'
})
export class ProductDialogComponent {
  form: FormGroup;
  dialogTitle: string;
  categories: Category[] = [];
  brands: Brand[] = [];
  colors: Color[] = [];
  thumbnailPreview: string | undefined;
  productImagePreviews: string[] = [];
  file: File | undefined;
  files: File[] | undefined;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product?: ProductResponse, categories: Category[], brands: Brand[], colors: Color[] }
  ) {
    this.categories = this.data.categories;
    this.brands = this.data.brands;
    this.colors = this.data.colors;
    this.dialogTitle = 'Cập nhật sản phẩm';

    this.form = this.fb.group({
      id: [data.product?.id],
      name: [data.product?.name, [Validators.required]],
      description: [data.product?.description, [Validators.required]],
      activate: [data.product?.activate ?? true],
      categoryId: [data.product?.category.id, [Validators.required]],
      brandId: [data.product?.brand.id, [Validators.required]],
      productDetails: this.fb.array([])
    });

    if (data.product?.productDetails) {
      data.product.productDetails.forEach(detail => {
        this.addProductDetail(detail);
      });
    } else {
      this.addProductDetail();
    }

    this.thumbnailPreview = data.product?.thumbnail;
    this.productImagePreviews = data.product?.productImages?.map(img => img.url) || [];
  }

  get productDetails(): FormArray {
    return this.form.get('productDetails') as FormArray;
  }

  addProductDetail(detail?: ProductDetailResponse) {
    const productDetailForm = this.fb.group({
      id: [detail?.id],
      salePrice: [detail?.salePrice, [Validators.required, Validators.min(0)]],
      discount: [detail?.discount, [Validators.required, Validators.min(0), Validators.max(100)]],
      quantity: [detail?.quantity, [Validators.required, Validators.min(0)]],
      colorId: [detail?.color.id?.toString(), [Validators.required]],
      active: [detail?.active ?? true]
    });
    
    // Check for duplicate colors before adding
    const newColorId = detail?.color.id;
    const existingColors = this.productDetails.controls.map(control => control.get('colorId')?.value);
    
    if (Number(newColorId) && existingColors.includes(newColorId)) {
      alert('Không thể thêm chi tiết sản phẩm với màu đã tồn tại');
      return;
    }
    
    this.productDetails.push(productDetailForm);
  }

  removeProductDetail(index: number) {
    if (this.productDetails.length <= 1) {
      alert('Phải có ít nhất một chi tiết sản phẩm');
      return;
    }

    const detail = this.productDetails.at(index);
    if (detail.get('id')?.value) {
      alert('Không thể xóa chi tiết sản phẩm đã tồn tại');
      return;
    }

    this.productDetails.removeAt(index);
  }

  onSubmit() {
    if (this.form.valid) {
      // Check for duplicate colors
      const colors = this.productDetails.controls.map(control => control.get('colorId')?.value);
      const uniqueColors = new Set(colors);
      if (colors.length !== uniqueColors.size) {
        alert('Không thể có hai chi tiết sản phẩm cùng màu!');
        return;
      }

      const formValue = this.form.value;
      const productRequest: ProductRequest = {
        id: formValue.id,
        name: formValue.name,
        description: formValue.description,
        activate: formValue.activate,
        thumbnail: formValue.thumbnail,
        productImages: formValue.productImages,
        categoryId: formValue.categoryId,
        brandId: formValue.brandId,
        productDetails: formValue.productDetails
      };
      this.dialogRef.close(productRequest);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

}