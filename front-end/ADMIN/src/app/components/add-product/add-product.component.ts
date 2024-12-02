import { Component } from '@angular/core';
import { Brand,  Category, Color, ProductDetail, ProductResponse } from '../../../type';
import { CategoryService } from '../../services/category-service.service';
import { BrandService } from '../../services/brand-service.service';
import { ColorService } from '../../services/color.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { ProductService } from '../../services/product.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule
    ,MatSlideToggle,MatSnackBarModule,MatFormFieldModule,MatInputModule,MatSelectModule,MatIcon,
    MatProgressSpinnerModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss'
})
export class AddProductComponent {
  categories: Category[] = [];
  brands: Brand[] = [];
  colors: Color[] = [];
  formBuilder: FormGroup;
  thumbnailPreview:  string |undefined ='https://th.bing.com/th/id/R.3156efdb345eadfa73224a6a32531124?rik=sFtdqrFD%2f60DrA&pid=ImgRaw&r=0&sres=1&sresct=1';
  productImagePreviews: string[] | undefined = ['https://th.bing.com/th/id/R.3156efdb345eadfa73224a6a32531124?rik=sFtdqrFD%2f60DrA&pid=ImgRaw&r=0&sres=1&sresct=1','https://th.bing.com/th/id/R.3156efdb345eadfa73224a6a32531124?rik=sFtdqrFD%2f60DrA&pid=ImgRaw&r=0&sres=1&sresct=1'];
  productDetails: FormGroup[] = [];
  file:File | undefined;
  files:File[] | undefined;
  isLoading = false;
  existingProductName: boolean = false;
  
  constructor(  private fb: FormBuilder,
    private categoryService: CategoryService, 
    private brandService: BrandService,
    private productService: ProductService,
     private colorService: ColorService,
     private snackBar: MatSnackBar) {
    this.categoryService.getAllCategories().subscribe(categories => this.categories = categories);
    this.brandService.getAllbrands().subscribe(brands => this.brands = brands);
    this.colorService.getAllColors().subscribe(colors => this.colors = colors);

    this.formBuilder = this.fb.group({
      name: [null,[Validators.required,Validators.minLength(3),Validators.maxLength(100)]],
      description: [null, [Validators.required,Validators.minLength(3),Validators.maxLength(1000)]],
      activate: [true],
      thumbnail: [null,[Validators.required]],
      productImages: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(4)]],
      categoryId: ['',   [Validators.required]],
      brandId: ['',  [Validators.required]],
      productDetails: this.fb.array([])
    });
    this.addProductDetail();
  }   

  get productDetailsArray() {
    return this.formBuilder.get('productDetails') as FormArray;
  }

  addProductDetail() {
    const productDetailForm = this.fb.group({
      salePrice: ['', [
        Validators.required, 
        Validators.min(10000),
        Validators.pattern(/^[0-9]+$/)
      ]],
      discount: [0, [
        Validators.required, 
        Validators.min(0), 
        Validators.max(100),
        Validators.pattern(/^[0-9]+$/)
      ]],
      quantity: [1, [
        Validators.required, 
        Validators.min(1),
        Validators.pattern(/^[0-9]+$/)
      ]],
      colorId: [null, [Validators.required]]
    });

    // Subscribe to color changes
    productDetailForm.get('colorId')?.valueChanges.subscribe(colorId => {
        if (!colorId) return;
        setTimeout(() => {
            this.updateDuplicateColorErrors();
        });
    });
    
    if (this.productDetailsArray.length >= 10) {
        this.showSnackBar('Không thể thêm quá 10 chi tiết sản phẩm');
        return;
    }
    
    this.productDetailsArray.push(productDetailForm);
  }

  removeProductDetail(index: number) {
    if (this.productDetailsArray.length <= 1) {
      alert('Phải có ít nhất một chi tiết sản phẩm');
      return;
    }
   
    this.productDetailsArray.removeAt(index);
  }

  onFileSelect(event: any, controlName: string) {
    if (controlName === 'thumbnail') {
      this.file = event.target.files[0];
      const input = event.target as HTMLInputElement;
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          this.thumbnailPreview = e.target?.result?.toString();
        };
        reader.readAsDataURL(input.files[0]);
      }
    } else if (controlName === 'productImages') {
      this.files = event.target.files;
      const input = event.target as HTMLInputElement;
      if (input.files) {
        this.productImagePreviews = [];
        Array.from(input.files).forEach(file => {
          const reader = new FileReader();
          reader.onload = (e: ProgressEvent<FileReader>) => {
            if (e.target?.result) {
              this.productImagePreviews?.push(e.target.result.toString());
            }
          };
          reader.readAsDataURL(file);
        });
      }
    }

  
  }
  async onSubmit() {
    // Kiểm tra tên sản phẩm trùng lặp
    const productName = this.formBuilder.get('name')?.value;
    try {
        const existingProducts = await this.productService.searchByName(productName).toPromise();
        if (existingProducts && existingProducts.length > 0) {
            this.formBuilder.get('name')?.setErrors({ 'duplicate': true });
            this.showSnackBar('Tên sản phẩm đã tồn tại!');
            return;
        }
    } catch (error) {
        this.showSnackBar('Có lỗi xảy ra khi kiểm tra tên sản phẩm!');
        return;
    }

    // Validate product details array
    const productDetails = this.formBuilder.get('productDetails') as FormArray;
    if (productDetails.length === 0) {
        this.showSnackBar('Phải có ít nhất một chi tiết sản phẩm!');
        return;
    }

    // Check for duplicate colors
    const colors = productDetails.controls.map(control => control.get('colorId')?.value);
    const uniqueColors = new Set(colors);
    if (colors.length !== uniqueColors.size) {
        this.showSnackBar('Không thể có hai chi tiết sản phẩm cùng màu!');
        return;
    }

    // Validate each product detail
    for (let i = 0; i < productDetails.length; i++) {
        const detail = productDetails.at(i);
        if (detail.invalid) {
            this.showSnackBar('Vui lòng điền đầy đủ thông tin chi tiết sản phẩm!');
            return;
        }
    }

    // Validate thumbnail
    if (!this.file) {
        this.showSnackBar('Vui lòng chọn ảnh đại diện!');
        return;
    }

    // Validate product images
    if (!this.files || this.files.length < 2) {
        this.showSnackBar('Vui lòng chọn ít nhất 2 ảnh sản phẩm!');
        return;
    }
    if (!this.files || this.files.length > 5) {
        this.showSnackBar('Ảnh sản phẩm không vượt quá 4 ảnh!');
        return;
    }

    const formValue = this.formBuilder.value;
    const formData = new FormData();
    Object.keys(formValue).forEach(key => {
        formData.append(key, formValue[key]);
    });
    
    // Set file values
    formData.set('thumbnail', this.file);
    for(let i = 0; i < this.files?.length; i++) {
        formData.set(`productImages[${i}]`, this.files[i]);
    }
    formData.delete('productImages');
    
    this.isLoading = true;
    this.createProduct(formData, this.formBuilder.value.productDetails);
  }

  showSnackBar(message: string) {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
    createProduct(product: FormData, productDetails: ProductDetail[]) {
    this.productService.createProduct(product, productDetails).subscribe({
      next: (newProduct: ProductResponse) => {
        console.log(newProduct);
        this.showSnackBar('Thêm sản phẩm thành công');
        this.isLoading = false;
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      },
      error: (error) => {
        this.showSnackBar('Lỗi khi thêm sản phẩm');
        this.isLoading = false;
      }
    });
  }

  private checkDuplicateColor(colorId: string, currentIndex: number): boolean {
    if (!colorId || colorId === '') return false;
    
    // Kiểm tra xem có màu trùng lặp không
    return this.productDetailsArray.controls.some((control, index) => 
        index !== currentIndex && control.get('colorId')?.value === colorId
    );
  }

  private updateDuplicateColorErrors() {
    // Tạo map để đếm số lần xuất hiện của mỗi màu
    const colorCounts = new Map<string, number>();
    
    // Đếm số lần xuất hiện của mỗi màu
    this.productDetailsArray.controls.forEach(control => {
        const colorId = control.get('colorId')?.value;
        if (colorId) {
            colorCounts.set(colorId, (colorCounts.get(colorId) || 0) + 1);
        }
    });

    // Cập nhật lỗi cho tất cả các control
    this.productDetailsArray.controls.forEach(control => {
        const colorId = control.get('colorId')?.value;
        if (colorId && colorCounts.get(colorId)! > 1) {
            control.get('colorId')?.setErrors({ 'duplicateColor': true });
        } else {
            const currentErrors = control.get('colorId')?.errors;
            if (currentErrors) {
                delete currentErrors['duplicateColor'];
                if (Object.keys(currentErrors).length === 0) {
                    control.get('colorId')?.setErrors(null);
                } else {
                    control.get('colorId')?.setErrors(currentErrors);
                }
            }
        }
    });
  }

  numberOnly(event: KeyboardEvent): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  // Thêm phương thức để format giá
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  }
}
