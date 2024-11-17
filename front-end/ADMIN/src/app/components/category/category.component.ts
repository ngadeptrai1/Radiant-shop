import { Component, OnInit } from '@angular/core';
import { Category, CategoryReq } from '../../../type';
import { CategoryService } from '../../services/category-service.service';
import {AfterViewInit, ViewChild, inject} from '@angular/core';
import {MatSort, Sort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CategoryDialogComponent } from '../category-dialog/category-dialog.component';
import { ConfirmDialogComponent } from '../../../constant/confirm-dialog.component';

@Component({
  selector: 'app-category',
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
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent implements OnInit,AfterViewInit {
  categories: Category[] = [];
  newCategory !: Category ;
  editMode: boolean = false;

  displayedColumns: string[] = ['id', 'name', 'parentCategory', 'activate','actions'];
  dataSource!: MatTableDataSource<Category>;
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private categoryService: CategoryService,
     private dialog: MatDialog,  
      private snackBar: MatSnackBar
  ) {
    
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  ngAfterViewInit() {
    
    this.dataSource.sort = this.sort;
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getAllCategories() .subscribe({
      next: (categories) => {
        this.dataSource = new MatTableDataSource(this.flattenCategories(categories));
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isLoading = false;
      }
    });

  }
  flattenCategories(categories: Category[]): Category[] {
    let flattenedCategories: Category[] = [];
    
    const flatten = (category: Category) => {
      flattenedCategories.push(category);
    };

    categories.forEach(category => flatten(category));
    return flattenedCategories;
  }


  getParentCategoryName(category: Category): string {
    return category.parentCategory ? category.parentCategory.name : '-';
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDialog(category?: Category) {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      width: '500px',
      data: { category, categories: this.dataSource.data.filter(c => c.id !== category?.id) }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          this.updateCategory(result);
        } else {
          this.createCategory(result);
        }
      }
    });
  }

  createCategory(category: Category) {
    const cate = {id:category.id,
      name:category.name,
      parent_id :category.parentCategory?.id,
      activate:category.activate
    };
    console.log(cate);
    
    this.isLoading = true;
    this.categoryService.createCategory(cate).subscribe({
      next: (newCategory) => {
        this.dataSource.data = [...this.dataSource.data, newCategory];
        this.showSnackBar('Thêm danh mục thành công');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating category:', error);
        this.showSnackBar('Lỗi khi thêm danh mục');
        this.isLoading = false;
      }
    });
  }

  updateCategory(category: Category) {
    const cate = {id:category.id,
      name:category.name,
      parent_id :category.parentCategory?.id,
      activate:category.activate
    };
    this.isLoading = true;
    this.categoryService.updateCategory(cate).subscribe({
      next: (updatedCategory) => {
        const index = this.dataSource.data.findIndex(c => c.id === category.id);
        if (index !== -1) {
          this.dataSource.data[index] = updatedCategory;
          this.dataSource.data = [...this.dataSource.data];
        }
        this.showSnackBar('Cập nhật danh mục thành công');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating category:', error);
        this.showSnackBar('Lỗi khi cập nhật danh mục');
        this.isLoading = false;
      }
    });
  }

  deleteCategory(category: Category) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Xác nhận xóa', message: `Bạn có chắc chắn muốn xóa danh mục "${category.name}"?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.categoryService.deleteCategory(category.id).subscribe({
          next: (updatedCategory) => {
            const index = this.dataSource.data.findIndex(c => c.id === category.id);
            if (index !== -1) {
              this.dataSource.data[index] = updatedCategory;
              this.dataSource.data = [...this.dataSource.data];
            }
            this.showSnackBar('Danh mục đã thay đổi thành công');
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error deleting category:', error);
            this.showSnackBar('Lỗi khi xóa danh mục');
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