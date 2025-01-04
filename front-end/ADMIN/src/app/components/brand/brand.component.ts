import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { Brand } from '../../../type';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BrandService } from '../../services/brand-service.service';
import { MatChipsModule } from '@angular/material/chips';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrandDialogComponent } from '../brand-dialog/brand-dialog.component';
import { ConfirmDialogComponent } from '../../../constant/confirm-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-brand',
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
  ],  templateUrl: './brand.component.html',
  styleUrl: './brand.component.scss'
})
export class BrandComponent implements OnInit, AfterViewInit   {
  brands!: Brand[] ;

  selectedBrand: Brand | null = null;
  newBrand !: Brand ;
  editMode: boolean = false;

  displayedColumns: string[] = ['id', 'thumbnail', 'name', 'active', 'actions'];
  dataSource!: MatTableDataSource<Brand>;
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private brandService: BrandService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar ) {

  }

  ngOnInit() {
    this.loadBrands();

  }
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  loadBrands() {
    this.isLoading = true;
     this.brandService.getAllbrands().subscribe({
      next: (brands) => {
        this.dataSource = new MatTableDataSource(brands);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        // Custom sort for thumbnail column
        this.dataSource.filterPredicate = (data: Brand, filter: string): boolean => {
          return data.name.toLowerCase().includes(filter) ||
                 data.id.toString().includes(filter) ||
                 (data.active ? 'active' : 'inactive').includes(filter);
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading brands:', error);
        this.isLoading = false;
      }
    });
  }
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/placeholder.png'; // Placeholder image path
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDialog(brand?: Brand) {
    const dialogRef = this.dialog.open(BrandDialogComponent, {
      width: '500px',
      data: { brand, brands: this.dataSource.data.filter(b => b.id !== brand?.id) }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {
        const str: string =result.get('id');
        const num: number = Number(str);
        if (num>0) {


            this.updateBrand(result,num);
          } else {
            console.log('create');
              this.createBrand(result);
          }
      }
    });
  }

  createBrand(brand: FormData) {
    this.isLoading = true;
    brand.delete('id');
    this.brandService.createBrand(brand).subscribe({
      next: (newBrand) => {
        this.dataSource.data = [...this.dataSource.data, newBrand];
        this.showSnackBar('Thêm thương hiệu thành công');
        location.reload();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating brand:', error);
        this.showSnackBar('Lỗi khi thêm thương hiệu');
        this.isLoading = false;
      }
    });
  }

  updateBrand(brand: FormData,id:Number) {
  if( typeof brand.get('thumbnail') =='string'){
    brand.delete("thumbnail");
  }
    this.isLoading = true;
    this.brandService.updateBrand(brand,id).subscribe({
      next: (updatedBrand) => {
        const index = this.dataSource.data.findIndex(b => b.id === id);
        if (index !== -1) {
          this.dataSource.data[index] = updatedBrand;
          this.dataSource.data = [...this.dataSource.data];
        }
        this.showSnackBar('Cập nhật thương hiệu thành công');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating brand:', error);
        this.showSnackBar('Lỗi khi cập nhật thương hiệu');
        this.isLoading = false;
      }
    });
  }

  deleteBrand(brand: Brand) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Xác nhận ngưng hoạt động', message: `Bạn có chắc chắn muốn ngưng hoạt động thương hiệu "${brand.name}"?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.brandService.deleteBrand(brand.id).subscribe({
          next: () => {
            this.dataSource.data = this.dataSource.data.filter(b => b.id !== brand.id);
            this.showSnackBar('Ngưng hoạt động thương hiệu thành công');
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error deleting brand:', error);
            this.showSnackBar('Lỗi khi xóa thương hiệu');
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
}
