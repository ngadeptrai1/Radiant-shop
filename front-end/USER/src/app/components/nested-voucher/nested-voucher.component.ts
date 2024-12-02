import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Voucher } from '../../../type';

@Component({
  selector: 'app-nested-voucher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nested-voucher.component.html',
  styleUrl: './nested-voucher.component.css'
})
export class NestedVoucherComponent {
  @Input() voucher!: Voucher;

  formatValue(voucher: Voucher): string {
    if (voucher.type === 'FIXED_AMOUNT') {
      return `${voucher.value.toLocaleString()}đ`;
    } else {
      return `${voucher.value}%`;
    }
  }

  copyCode(): void {
    navigator.clipboard.writeText(this.voucher.code)
      .then(() => {
        alert('Đã sao chép mã voucher!');
      })
      .catch(err => {
        console.error('Không thể sao chép mã:', err);
      });
  }
}
