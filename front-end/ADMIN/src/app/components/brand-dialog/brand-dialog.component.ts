import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { Brand, BrandReq } from '../../../type';

@Component({
  selector: 'app-brand-dialog',
  standalone: true,
  imports: [MatDialogContent,MatFormField,MatLabel
    ,MatError,MatSelect,MatOption,MatSlideToggle,MatDialogActions,
    ReactiveFormsModule,MatInput,MatButton],
  templateUrl: './brand-dialog.component.html',
  styleUrl: './brand-dialog.component.scss'
})
export class BrandDialogComponent {
  form: FormGroup;
  dialogTitle: string;
  brands: Brand[] = [];
  selectedImageSrc: string | ArrayBuffer | null | undefined = null;
  file:any;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BrandDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { brand?: Brand, brands: Brand[] }
  ) {
    this.brands = this.data.brands;
    this.dialogTitle = this.data.brand ? 'Cập nhật thương hiệu' : 'Thêm thương hiệu mới';
    this.selectedImageSrc = this.data.brand?.thumbnail || 'https://mdbootstrap.com/img/Photos/Others/placeholder.jpg';
    
    this.form = this.fb.group({
      id: [data.brand?.id],
      name: [data.brand?.name, [Validators.required]],
      thumbnail: [null, this.data.brand ? [] : [Validators.required]], // Reset to null
      active: [data.brand?.active ?? true]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const formData = new FormData();

      Object.keys(formValue).forEach(key => {
        if (key == 'thumbnail' && this.form.get('thumbnail')?.value instanceof File) {
          formData.append(key, this.form.get('thumbnail')?.value);
        } else {
          console.log('not');
          formData.append('thumbnail',this.file);
          formData.append(key, formValue[key]);
        }
      });

      this.dialogRef.close(formData);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  
  onFileSelected(event: any): void {
    this.file = event.target.files[0];
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.selectedImageSrc = e.target?.result;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }
}
