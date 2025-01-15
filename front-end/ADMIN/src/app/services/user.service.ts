import { Injectable } from '@angular/core';
import { ApiService } from './api-service.service';
import { Observable } from 'rxjs';
import { UserRequest, UserResponse } from '../../type';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  endpoint = 'users';
  constructor(private apiService: ApiService) { }

  getAllUsers(): Observable<UserResponse[]> {
    return this.apiService.get<UserResponse[]>(this.endpoint);
  }
  getCurrentUser(): Observable<UserResponse> {
    return this.apiService.get<UserResponse>(`${this.endpoint}/me`);
  }
  createUser(userData: UserRequest): Observable<UserResponse> {
    // Validate required fields
    if (!userData.fullName?.trim()) {
      throw new Error('Họ tên không được để trống');
    }
    if (!userData.phoneNumber?.match(/^[0-9]{10}$/)) {
      throw new Error('Số điện thoại không hợp lệ');
    }
    if (userData.email && !userData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Email không hợp lệ');
    }

    // For staff/admin users
    if (userData.role.includes('STAFF') || userData.role.includes('ADMIN')) {
      if (!userData.password?.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ và số');
      }
    }

    if (userData.role.includes('STAFF') || userData.role.includes('ADMIN')) {
      return this.searchStaff(userData.username, userData.phoneNumber, userData.email).pipe(
        switchMap(staffs => {
          const isDuplicate = staffs.some(staff => 
            staff.phoneNumber === userData.phoneNumber || 
            (userData.email && staff.email === userData.email) ||
            staff.username === userData.username
          );
          if (isDuplicate) {
            throw new Error('Số điện thoại, email hoặc tên người dùng đã tồn tại');
          }
          return this.createStaff(userData);
        })
      );
    }

    return this.searchCustomer(userData.username, userData.phoneNumber, userData.email).pipe(
      switchMap(customers => {
        const isDuplicate = customers.some(customer => 
          customer.phoneNumber === userData.phoneNumber || 
          (userData.email && customer.email === userData.email) ||
          customer.username === userData.username
        );
        if (isDuplicate) {
          throw new Error('Số điện thoại, email hoặc tên người dùng đã tồn tại');
        }
        return this.createWalkInUser(userData);
      })
    );
  }
  createWalkInUser(user: UserRequest): Observable<UserResponse> {
    return this.apiService.post<UserResponse>(`${this.endpoint}/walk-in`, user);
  }
  searchCustomer(username: string = '', phone: string = '', email: string = ''): Observable<UserResponse[]> {
    return this.apiService.get<UserResponse[]>(`${this.endpoint}/search`, { 
      params: { username, phone, email } 
    });
  }
  updateUser(id: number, userData: UserRequest): Observable<UserResponse> {
    // Similar validations as createUser
    if (!userData.fullName?.trim()) {
      throw new Error('Họ tên không được để trống');
    }
    if (!userData.phoneNumber?.match(/^[0-9]{10}$/)) {
      throw new Error('Số điện thoại không hợp lệ');
    }
    if (userData.email && !userData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Email không hợp lệ');
    }

    if (userData.role.includes('STAFF') || userData.role.includes('ADMIN')) {
     
          return this.updateStaff(id, userData);
    
    }

    return this.searchCustomer(userData.username, userData.phoneNumber, userData.email).pipe(
      switchMap(customers => {
        const duplicateCustomer = customers.find(customer => 
          customer.id != id && (
            customer.phoneNumber == userData.phoneNumber || 
            (userData.email && customer.email == userData.email) ||
            customer.username === userData.username
          )
        );
    
        
        return this.apiService.put<UserResponse>(`${this.endpoint}/${id}`, userData);
      })
    );
  }
  deleteUser(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }
  getUserById(id: number): Observable<UserResponse> {
    return this.apiService.get<UserResponse>(`${this.endpoint}/${id}`);
  }
  getUserByRole(role: string): Observable<UserResponse[]> {
    return this.apiService.get<UserResponse[]>(`${this.endpoint}/role/${role}`);
  }

  // crud staff
  createStaff(staff: UserRequest): Observable<UserResponse> {
    return this.searchStaff(staff.username, staff.phoneNumber, staff.email).pipe(
      switchMap(users => {
        const isDuplicate = users.some(user => 
          user.phoneNumber === staff.phoneNumber || 
          (staff.email && user.email === staff.email) ||
          user.username === staff.username
        );
        if (isDuplicate) {
          throw new Error('Số điện thoại, email hoặc tên người dùng đã tồn tại');
        }
        return this.apiService.post<UserResponse>(`${this.endpoint}/staff`, staff);
      })
    );
  }
  updateStaff(id: number, staff: UserRequest): Observable<UserResponse> {
    
        
        return this.apiService.put<UserResponse>(`${this.endpoint}/staff/${id}`, staff);
      }
    
  
  deleteStaff(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/staff/${id}`);
  }

  searchStaff(username: string = '', phone: string = '', email: string = ''): Observable<UserResponse[]> {
    return this.apiService.get<UserResponse[]>(`${this.endpoint}/staff/search`, { 
      params: { username, phone, email } 
    });
  }

  getAllCustomer(): Observable<UserResponse[]> {
    return this.apiService.get<UserResponse[]>(`${this.endpoint}/customer`);
  }
}
