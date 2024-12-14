import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Color } from '../../../type';
import { MatSort } from '@angular/material/sort';
import { RouterLink } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ColorService } from '../../services/color.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ColorDialogComponent } from '../color-dialog/color-dialog.component';
import { ConfirmDialogComponent } from '../../../constant/confirm-dialog.component';

@Component({
  selector: 'app-color',
  standalone: true,
  imports: [MatTableModule, MatSort,
    MatPaginator,RouterLink,
    MatProgressSpinnerModule,MatIcon,
    MatChipsModule  ,
    MatButtonModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule,
    MatButton
  ],
  templateUrl: './color.component.html',
  styleUrl: './color.component.scss'
})
export class ColorComponent implements OnInit {
  displayedColumns: string[] = ['id', 'colorPreview', 'name', 'hexCode', 'active', 'actions'];
  dataSource: MatTableDataSource<Color>;
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private colorService: ColorService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Color>();
  }

  ngOnInit() {
    this.loadColors();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadColors() {
    this.isLoading = true;
    this.colorService.getAllColors().subscribe({
      next: (colors) => {
        this.dataSource.data = colors;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading colors:', error);
        this.showSnackBar('Lỗi khi tải danh sách màu sắc');
        this.isLoading = false;
      }
    });
  }

  openDialog(color?: Color) {
    const dialogRef = this.dialog.open(ColorDialogComponent, {
      width: '500px',
      data: { color }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          this.updateColor(result);
        } else {
          this.createColor(result);
        }
      }
    });
  }

  createColor(color: Color) {
    this.isLoading = true;
    this.colorService.createColor(color).subscribe({
      next: (newColor) => {
        this.dataSource.data = [...this.dataSource.data, newColor];
        this.showSnackBar('Thêm màu sắc thành công');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating color:', error);
        this.showSnackBar('Lỗi khi thêm màu sắc');
        this.isLoading = false;
      }
    });
  }

  updateColor(color: Color) {
    this.isLoading = true;
    this.colorService.updateColor(color).subscribe({
      next: (updatedColor) => {
        const index = this.dataSource.data.findIndex(c => c.id === color.id);
        if (index !== -1) {
          this.dataSource.data[index] = updatedColor;
          this.dataSource.data = [...this.dataSource.data];
        }
        this.showSnackBar('Cập nhật màu sắc thành công');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating color:', error);
        this.showSnackBar('Lỗi khi cập nhật màu sắc');
        this.isLoading = false;
      }
    });
  }

  deleteColor(color: Color) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { 
        title: 'Xác nhận xóa', 
        message: `Bạn có chắc chắn muốn xóa màu "${color.name}"?` 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.colorService.deleteColor(color.id!).subscribe({
          next: (updatedColor) => {
            const index = this.dataSource.data.findIndex(c => c.id === color.id);
            if (index !== -1) {
              this.dataSource.data[index] = updatedColor;
              this.dataSource.data = [...this.dataSource.data];
            }
            this.showSnackBar('Xóa màu sắc thành công');
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error deleting color:', error);
            this.showSnackBar('Lỗi khi xóa màu sắc');
            this.isLoading = false;
          }
        });
      }
    });
  }

  private showSnackBar(message: string) {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}