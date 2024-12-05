import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../services/user.service';
import { UserRequest, UserResponse } from '../../../type';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatTableModule, 
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit, AfterViewInit {
  @ViewChild(MatTable) table!: MatTable<UserResponse>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  users: UserResponse[] = [];
  selectedRole: string = 'CUSTOMER';
  roles = ['CUSTOMER', 'STAFF', 'ADMIN'];
  displayedColumns: string[] = ['id', 'fullName', 'email', 'phoneNumber', 'role', 'actions'];
  isLoading = false;
  activeTab: 'customer' | 'staff' = 'customer';
  staffRoles = ['STAFF', 'ADMIN'];
  dataSource: MatTableDataSource<UserResponse>;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<UserResponse>([]);
  }

  ngOnInit() {
    this.loadUsers();
  }

  ngAfterViewInit() {
    this.initializeDataSource(this.users);
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  private initializeDataSource(data: UserResponse[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    if (this.paginator) {
      this.paginator._intl.itemsPerPageLabel = "Số dòng trên trang";
      this.paginator._intl.nextPageLabel = "Trang sau";
      this.paginator._intl.previousPageLabel = "Trang trước";
      this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) {
          return `0 / ${length}`;
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
        return `${startIndex + 1} - ${endIndex} / ${length}`;
      };
    }
  }

  sortData(sort: any) {
    this.dataSource.sort = this.sort;
  }

  loadUsers() {
    this.isLoading = true;
    const loadFunction = this.activeTab == 'customer' 
      ? this.userService.searchCustomer()
      : this.userService.searchStaff();

    loadFunction.subscribe({
      next: (users) => {
        const filteredUsers = this.activeTab === 'customer'
          ? users.filter(user => user.roles.includes('CUSTOMER'))
          : users.filter(user => user.roles.some(role => this.staffRoles.includes(role)));

        this.dataSource = new MatTableDataSource<UserResponse>(filteredUsers);
        
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
          this.paginator.pageSize = 10;
          this.paginator.pageIndex = 0;
          
          this.paginator._intl.itemsPerPageLabel = "Số dòng trên trang";
          this.paginator._intl.nextPageLabel = "Trang sau";
          this.paginator._intl.previousPageLabel = "Trang trước";
          this.paginator._intl.firstPageLabel = "Trang đầu";
          this.paginator._intl.lastPageLabel = "Trang cuối";
          this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0 || pageSize === 0) {
              return `0 / ${length}`;
            }
            length = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
            return `${startIndex + 1} - ${endIndex} / ${length}`;
          };
        }
        
        if (this.sort) {
          this.dataSource.sort = this.sort;
        }

        this.dataSource.filterPredicate = (data: UserResponse, filter: string) => {
          const searchStr = filter.toLowerCase();
          return (
            (data.phoneNumber?.toLowerCase().includes(searchStr) || '') ||
            (data.email?.toLowerCase().includes(searchStr) || '') ||
            (data.fullName?.toLowerCase().includes(searchStr) || '') ||
            this.translateRole(data.roles[0]).toLowerCase().includes(searchStr)
          );
        };

        this.table?.renderRows();
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách người dùng:', error);
        this.snackBar.open('Lỗi khi tải danh sách người dùng', 'Đóng', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

 

  ngDoCheck() {
    if (this.dataSource && !this.dataSource.paginator && this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  onRoleChange() {
    this.loadUsers();
  }

  deleteUser(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      this.isLoading = true;
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers();
          this.snackBar.open('Xóa người dùng thành công', 'Đóng', { duration: 3000 });
        },
        error: (error) => {
          console.error('Lỗi khi xóa người dùng:', error);
          this.snackBar.open('Lỗi khi xóa người dùng', 'Đóng', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        },
        complete: () => this.isLoading = false
      });
    }
  }

  editUser(user: UserResponse) {
    this.openUserDialog(user);
  }

  addNewUser() {
    this.openUserDialog();
  }

  onTabChange(event: any) {
    this.activeTab = event.index === 0 ? 'customer' : 'staff';
    this.loadUsers();
  }

  applyFilter(event: Event) {
    if (!this.dataSource) {
      return;
    }
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openUserDialog(user?: UserResponse) {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '400px',
      data: {
        user: user,
        type: this.activeTab === 'customer' ? 'Customer' : 'Staff',
        roles: this.activeTab === 'customer' ? ['CUSTOMER'] : this.staffRoles
      },
      disableClose: true
    });

    dialogRef.componentInstance.submitForm.subscribe((userData: UserRequest) => {
      if (user) {
        this.updateUser(user.id, userData, dialogRef);
      } else {
        this.createUser(userData, dialogRef);
      }
    });
  }

  createUser(userData: UserRequest, dialogRef: MatDialogRef<UserDialogComponent>) {
    dialogRef.componentInstance.isLoading = true;
    this.userService.createUser(userData).subscribe({
      next: () => {
        this.loadUsers();
        this.snackBar.open(
          `Thêm ${this.activeTab === 'customer' ? 'khách hàng' : 'nhân viên'} thành công`, 
          'Đóng', 
          { duration: 3000 }
        );
        dialogRef.close();
      },
      error: (error) => {
        console.error('Lỗi khi thêm người dùng:', error);
        let message = `Lỗi khi thêm ${this.activeTab === 'customer' ? 'khách hàng' : 'nhân viên'}`;
        if (error.message.includes('email')) {
          message = 'Email đã được sử dụng';
        } else if (error.message.includes('điện thoại')) {
          message = 'Số điện thoại đã được sử dụng';
        }
        this.snackBar.open(message, 'Đóng', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        dialogRef.componentInstance.isLoading = false;
      }
    });
  }

  updateUser(id: number, userData: UserRequest, dialogRef: MatDialogRef<UserDialogComponent>) {
    dialogRef.componentInstance.isLoading = true;
    this.userService.updateUser(id, userData).subscribe({
      next: () => {
        this.loadUsers();
        this.snackBar.open(
          `Cập nhật ${this.activeTab === 'customer' ? 'khách hàng' : 'nhân viên'} thành công`, 
          'Đóng', 
          { duration: 3000 }
        );
        dialogRef.close();
      },
      error: (error) => {
        console.error('Lỗi khi cập nhật người dùng:', error);
        let message = 'Lỗi khi cập nhật';
        if (error.message.includes('email')) {
          message = 'Email đã được sử dụng';
        } else if (error.message.includes('điện thoại')) {
          message = 'Số điện thoại đã được sử dụng';
        }
        this.snackBar.open(message, 'Đóng', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        dialogRef.componentInstance.isLoading = false;
      }
    });
  }

  translateRole(role: string): string {
    const roleMap: { [key: string]: string } = {
      'CUSTOMER': 'Khách hàng',
      'STAFF': 'Nhân viên',
      'ADMIN': 'Quản trị viên'
    };
    return roleMap[role] || role;
  }
}
