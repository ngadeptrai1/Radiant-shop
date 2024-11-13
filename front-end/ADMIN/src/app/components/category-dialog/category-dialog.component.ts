import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category } from '../../../type';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogContent ,MatDialogActions,MatDialogClose} from "@angular/material/dialog";
import {MatError, MatFormField, MatLabel} from "@angular/material/form-field"
import { MatOption, MatSelect } from '@angular/material/select';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [MatDialogContent,MatFormField,MatLabel
    ,MatError,MatSelect,MatOption,MatSlideToggle,MatDialogActions,
    ReactiveFormsModule,MatInput,MatButton],
  templateUrl: './category-dialog.component.html',
  styleUrl: './category-dialog.component.scss'
})
export class CategoryDialogComponent {
  form!: FormGroup ;
  dialogTitle!: string;
  categories: Category[] = [];
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {category?: Category, categories: Category[]}
  ) {
    this.categories = this.data.categories;
    this.dialogTitle = this.data.category ? 'Cập nhật danh mục' : 'Thêm danh mục mới';
    
    this.form = this.fb.group({
      id: [data.category?.id],
      name: [data.category?.name, [Validators.required]],
      parentCategory: [data.category?.parentCategory?.id],
      activate: [data.category?.activate ?? true]
    });
  }

  
  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      if (formValue.parentCategory) {
        formValue.parentCategory = this.categories.find(c => c.id === formValue.parentCategory);
      }
      this.dialogRef.close(formValue);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
