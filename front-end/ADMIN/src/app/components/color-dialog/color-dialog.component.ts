import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { Color } from '../../../type';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatSlideToggle } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-color-dialog',
  standalone: true,
  imports: [MatDialogContent,MatFormField,MatLabel
    ,MatError,MatDialogActions,MatSlideToggle,
    ReactiveFormsModule,MatInput,MatButton],
  templateUrl: './color-dialog.component.html',
  styleUrl: './color-dialog.component.scss'
})
export class ColorDialogComponent {
  form: FormGroup;
  dialogTitle: string;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ColorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {color?: Color}
  ) {
    this.dialogTitle = this.data.color ? 'Cập nhật màu sắc' : 'Thêm màu sắc mới';
    
    this.form = this.fb.group({
      id: [data.color?.id],
      hexCode: [data.color?.hexCode, [Validators.required, Validators.pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)]],
      name: [data.color?.name, [Validators.required]],
      active: [data.color?.active ?? true]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
