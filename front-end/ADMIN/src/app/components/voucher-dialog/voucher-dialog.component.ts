import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { Voucher } from '../../../type';
import { MatError, MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import {MatDatepicker, MatDatepickerModule, MatDatepickerToggle} from '@angular/material/datepicker';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-voucher-dialog',
  standalone: true,
  imports: [MatDialogContent,MatFormField,MatLabel
    ,MatError,MatSelect,MatOption,MatSlideToggle,MatDialogActions,
    ReactiveFormsModule,MatInput,MatButton,MatHint,MatDatepickerToggle,MatDatepicker,MatDatepickerModule,CommonModule,MatSuffix],
  templateUrl: './voucher-dialog.component.html',
  styleUrl: './voucher-dialog.component.scss'
})
export class VoucherDialogComponent {
  form: FormGroup;
  dialogTitle: string;
  currentDate:any = new Date();
  selectedStartDate:Date|undefined = undefined;
  snackBar: MatSnackBar = inject(MatSnackBar);
  voucherTypes = [
    { value: 'PERCENTAGE', label: 'Phần trăm' },
    { value: 'FIXED_AMOUNT', label: 'Số tiền cố định' }
  ];
    curentType:String = this.voucherTypes[1].value;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<VoucherDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {voucher?: Voucher}
  ) {
    this.dialogTitle = data.voucher ? 'Cập nhật voucher' : 'Thêm voucher mới';
    this.selectedStartDate = data.voucher?.startDate;
    if(data.voucher){
      this.currentDate =  data.voucher?.startDate;
      this.curentType = data.voucher?.type;
    }
    this.form = this.fb.group({
      id: [data.voucher?.id],
      code: [
        data.voucher?.code, 
        [
          Validators.required, 
          Validators.pattern('^[A-Za-z0-9_-]{4,20}$')
        ]
      ],
      type: [data.voucher?.type || 'FIXED_AMOUNT', Validators.required],
      value: [
        data.voucher?.value, 
        [
          Validators.required,
          Validators.min(1),
          Validators.pattern('^[0-9]*$')
        ]
      ],
      maxDiscountAmount: [
        data.voucher?.maxDiscountAmount,
        [
          Validators.required,
          Validators.min(1000),
          Validators.pattern('^[0-9]*$')
        ]
      ],
      minOrderAmount: [
        data.voucher?.minOrderAmount,
        [
          Validators.required,
          Validators.min(0),
          Validators.pattern('^[0-9]*$')
        ]
      ],
      startDate: [data.voucher?.startDate, Validators.required],
      endDate: [data.voucher?.endDate, Validators.required],
      usageLimit: [
        data.voucher?.usageLimit, 
        [
          Validators.required, 
          Validators.min(1),
          Validators.pattern('^[0-9]*$')
        ]
      ],
      description: [
        data.voucher?.description,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500)
        ]
      ],
      active: [data.voucher?.active ?? true]
    });
   
    
    // Validate value based on type
    this.form.get('type')?.valueChanges.subscribe(type => {
      const valueControl = this.form.get('value');
      if (type == 'PERCENTAGE') {
        valueControl?.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(100),
          Validators.pattern('^[0-9]*$')
        ]);
      } else {
        valueControl?.setValidators([
          Validators.required,
          Validators.min(1000),
          Validators.max(10000000),
          Validators.pattern('^[0-9]*$')
        ]);
      }
      valueControl?.updateValueAndValidity();
    });
  }

  private validateForm(): boolean {
    const value = this.form.get('value')?.value;
    const minOrderAmount = this.form.get('minOrderAmount')?.value;
    const type = this.form.get('type')?.value;
    const maxDiscountAmount = this.form.get('maxDiscountAmount')?.value;

    // Kiểm tra ngày
    const startDate = new Date(this.form.get('startDate')?.value);
    const endDate = new Date(this.form.get('endDate')?.value);
    if (endDate < startDate) {
      this.showError('Ngày kết thúc phải sau ngày bắt đầu');
      return false;
    }

    // Kiểm tra giá trị giảm giá
    if (type == 'FIXED_AMOUNT') {
      if (value > minOrderAmount) {
        this.showError('Giá trị giảm không được lớn hơn giá trị đơn hàng tối thiểu');
        return false;
      }
      if (value > 10000000) {
        this.showError('Giá trị giảm không được vượt quá 10.000.000đ');
        return false;
      }
    } else if (type == 'PERCENTAGE') {
      if (value > 100) {
        this.showError('Phần trăm giảm giá không được vượt quá 100%');
        return false;
      }
      if (maxDiscountAmount > minOrderAmount) {
        this.showError('Giá trị giảm tối đa không được vượt quá giá trị đơn hàng tối thiểu');
        return false;
      }
    }

    return true;
  }

  onSubmit() {
    if (this.validateForm()) {
      this.dialogRef.close(this.form.value);
    }
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSelectionChange(event: any) {
    this.curentType = event.value;
  }

  onSelectionStartDate(event: any) {
    this.selectedStartDate = event.value;
  }
}