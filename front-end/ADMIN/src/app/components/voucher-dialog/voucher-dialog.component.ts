import { Component, Inject } from '@angular/core';
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
    this.form = this.fb.group({
      id: [data.voucher?.id],
      code: [data.voucher?.code, [Validators.required, Validators.pattern('^[A-Za-z0-9_-]{4,20}$')]],

      type:[
        data.voucher?.type || 'FIXED_AMOUNT',
        this.curentType == 'PERCENTAGE' ? Validators.required : null
      ],

      value: [data.voucher?.value, [Validators.required, Validators.min(1)]],

      maxDiscountAmount: [
       data.voucher?.maxDiscountAmount ,
        this.curentType == 'PERCENTAGE' ? [Validators.required, Validators.min(1)] : null],
      minOrderAmount: [data.voucher?.minOrderAmount, [Validators.required, Validators.min(0)]],
      startDate: [data.voucher?.startDate, Validators.required],
      endDate: [data.voucher?.endDate, Validators.required],
      usageLimit: [data.voucher?.usageLimit, [Validators.required, Validators.min(1)]],
      description: [data.voucher?.description],
      active: [data.voucher?.active ?? true]
    });

    // Add value validators based on type
    this.form.get('type')?.valueChanges.subscribe(type => {
      const valueControl = this.form.get('value');
      if (type == 'PERCENTAGE') {
        valueControl?.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(100)
        ]);
      } else {
        valueControl?.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(100000000)
        ]);
      }
      valueControl?.updateValueAndValidity();
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
  onSelectionChange(event: any) {
    this.curentType= event.value;
  }
  onSelectionStartDate(event:any){
    this.selectedStartDate = event.value;
      console.log(this.selectedStartDate);
  }
}