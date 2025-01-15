import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatChip, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { Voucher } from '../../../type';
import { VoucherService } from '../../services/voucher-service.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../constant/confirm-dialog.component';
import { VoucherDialogComponent } from '../voucher-dialog/voucher-dialog.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-voucher',
  standalone: true,
  imports: [MatTableModule, MatSort,
    MatPaginator,RouterLink,
    MatProgressSpinnerModule,MatIcon,
    MatChipsModule  ,
    MatButtonModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule,
    MatButton,MatChip,CommonModule
  ],
  templateUrl: './voucher.component.html',
  styleUrl: './voucher.component.scss'
})
export class VoucherComponent implements OnInit {
  displayedColumns: string[] = [
    'code', 
    'type', 
    'value', 
    'maxDiscountAmount',
    'minOrderAmount', 
    'dateRange',
    'usageLimit',
    'usageCount',
    'status',
    'actions'
  ];
  dataSource: MatTableDataSource<Voucher>;
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private voucherService: VoucherService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Voucher>();
  }

  ngOnInit() {
    this.loadVouchers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadVouchers() {
    this.isLoading = true;
    this.voucherService.getAllvouchers().subscribe({
      next: (vouchers) => {
        this.dataSource.data = vouchers;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading vouchers:', error);
        this.showSnackBar('Lỗi khi tải danh sách voucher');
        this.isLoading = false;
      }
    });
  }

  openDialog(voucher?: Voucher) {
    const dialogRef = this.dialog.open(VoucherDialogComponent, {
      width: '700px',
      data: { voucher }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          console.log('1'+result);
          this.updateVoucher(result);
        } else {
        console.log("raw data" + result.startDate);
        
          this.createVoucher(result);
        }
      }
    });
  }

  createVoucher(voucher: Voucher) {
    this.isLoading = true;
    this.voucherService.createVoucher(voucher).subscribe({
      next: (newVoucher) => {
        this.dataSource.data = [...this.dataSource.data, newVoucher];
        this.showSnackBar('Thêm voucher thành công');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating voucher:', error);
        this.showSnackBar('Bạn không có quyền tạo voucher');
        this.isLoading = false;
      }
    });
  }

  updateVoucher(voucher: Voucher) {
    this.isLoading = true;
    this.voucherService.updateVoucher(voucher).subscribe({
      next: (updatedVoucher) => {
        const index = this.dataSource.data.findIndex(v => v.id === voucher.id);
        if (index !== -1) {
          this.dataSource.data[index] = updatedVoucher;
          this.dataSource.data = [...this.dataSource.data];
        }
        this.showSnackBar('Cập nhật voucher thành công');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating voucher:', error);
        this.showSnackBar('Bạn không có quyền cập nhật voucher');
        this.isLoading = false;
      }
    });
  }

  deleteVoucher(voucher: Voucher) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { 
        title: 'Xác nhận xóa', 
        message: `Bạn có chắc chắn muốn xóa voucher "${voucher.code}"?` 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.voucherService.deleteVoucher(voucher.id!).subscribe({
          next: (updatedVoucher) => {
            const index = this.dataSource.data.findIndex(v => v.id === voucher.id);
            if (index !== -1) {
              this.dataSource.data[index] = updatedVoucher;
              this.dataSource.data = [...this.dataSource.data];
            }
            this.showSnackBar('Xóa voucher thành công');
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error deleting voucher:', error);
            this.showSnackBar('Bạn không có quyền xóa voucher');
            this.isLoading = false;
          }
        });
      }
    });
  }

  getVoucherStatus(voucher: Voucher): string {
    const now = new Date();
    if (new Date(voucher.endDate) < now) {
      return 'Hết hạn';
    }
    if (new Date(voucher.startDate) > now) {
      return 'Chưa bắt đầu';
    }
    if (voucher.usedAmount! >= voucher.usageLimit) {
      return 'Hết lượt dùng';
    }
    return voucher.active ? 'Đang hoạt động' : 'Không hoạt động';
  }

  private showSnackBar(message: string) {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}
