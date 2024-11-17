import { Component } from '@angular/core';
import { Brand,  Category, Color, ProductDetail } from '../../../type';
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
      salePrice: ['', [Validators.required, Validators.min(10000)]],
      discount: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      quantity: [0, [Validators.required, Validators.min(1)]],
      colorId: ['', [Validators.required]]
    });
    
    if (this.productDetailsArray.length >= 10) {
      alert('Không thể thêm quá 10 chi tiết sản phẩm');
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
  onSubmit() {
    // Validate product details array
    const productDetails = this.formBuilder.get('productDetails') as FormArray;
    if (productDetails.length === 0) {
      this.snackBar.open('Phải có ít nhất một chi tiết sản phẩm!', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'right', 
        verticalPosition: 'top',
      });
      return;
    }

    // Check for duplicate colors
    const colors = productDetails.controls.map(control => control.get('colorId')?.value);
    const uniqueColors = new Set(colors);
    if (colors.length !== uniqueColors.size) {
      this.snackBar.open('Không thể có hai chi tiết sản phẩm cùng màu!', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
    return;
    }

    // Validate each product detail
    for (let i = 0; i < productDetails.length; i++) {
      const detail = productDetails.at(i);
      if (detail.invalid) {
        this.snackBar.open('Vui lòng điền đầy đủ thông tin chi tiết sản phẩm!', 'Đóng', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
        return;
      }
    }

    // Validate thumbnail
    if (!this.file) {
      this.snackBar.open('Vui lòng chọn ảnh đại diện!', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
      return;
    }

    // Validate product images
    if (!this.files || this.files.length < 2) {
      this.snackBar.open('Vui lòng chọn ít nhất 2 ảnh sản phẩm!', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top', 
      });
      return;
    }
    if (!this.files || this.files.length > 5) {
      this.snackBar.open('Ảnh sản phẩm không vượt quá 4 ảnh!', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top', 
      });
      return;
    }

    const formValue = this.formBuilder.value;
    const formData = new FormData();
    Object.keys(formValue).forEach(key => {
        formData.append(key, formValue[key]);
    });
    // Set file values
    formData.set('thumbnail',this.file);
    for(let i = 0; i < this.files?.length; i++) {
      formData.set(`productImages[${i}]`, this.files[i]);
    }
    formData.delete('productImages');
    console.log(this.formBuilder.value);
    this.isLoading = true;
    console.log(this.formBuilder.value.productDetails);
    // this.createProduct(formData,this.formBuilder.value.productDetails);
  }

  showSnackBar(message: string) {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
    createProduct(product: FormData, productDetails: ProductDetail[]) {
    this.productService.createProduct(product,productDetails).subscribe({
      next: (newProduct) => {
        console.log(newProduct);
        this.showSnackBar('Thêm sản phẩm thành công');
        this.isLoading = false;
        // Reset form after successful creation
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
}
