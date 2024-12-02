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
    if (userData.role.includes('STAFF') || userData.role.includes('ADMIN')) {
      return this.searchStaff('', userData.phoneNumber, userData.email).pipe(
        switchMap(staffs => {
          const isDuplicate = staffs.some(staff => 
            staff.phoneNumber === userData.phoneNumber || 
            (userData.email && staff.email === userData.email)
          );
          if (isDuplicate) {
            throw new Error('Số điện thoại hoặc email đã tồn tại');
          }
          return this.createStaff(userData);
        })
      );
    }

    return this.searchCustomer('', userData.phoneNumber, userData.email).pipe(
      switchMap(customers => {
        const isDuplicate = customers.some(customer => 
          customer.phoneNumber === userData.phoneNumber || 
          (userData.email && customer.email === userData.email)
        );
        if (isDuplicate) {
          throw new Error('Số điện thoại hoặc email đã tồn tại');
        }
        return this.createWalkInUser(userData);
      })
    );
  }
  createWalkInUser(user: UserRequest): Observable<UserResponse> {
    return this.apiService.post<UserResponse>(`${this.endpoint}/walk-in`, user);
  }
  searchCustomer(name: string = '', phone: string = '', email: string = ''): Observable<UserResponse[]> {
    return this.apiService.get<UserResponse[]>(`${this.endpoint}/search`, { 
      params: { name, phone, email } 
    });
  }
  updateUser(id: number, userData: UserRequest): Observable<UserResponse> {
    if (userData.role.includes('STAFF') || userData.role.includes('ADMIN')) {
      return this.searchStaff('', userData.phoneNumber, userData.email).pipe(
        switchMap(staffs => {
          const duplicateStaff = staffs.find(staff => 
            staff.id !== id && (
              staff.phoneNumber === userData.phoneNumber || 
              (userData.email && staff.email === userData.email)
            )
          );
          
          if (duplicateStaff) {
            if (duplicateStaff.email === userData.email) {
              throw new Error('Email đã được sử dụng');
            }
            throw new Error('Số điện thoại đã được sử dụng');
          }
          
          return this.updateStaff(id, userData);
        })
      );
    }

    return this.searchCustomer('', userData.phoneNumber, userData.email).pipe(
      switchMap(customers => {
        const duplicateCustomer = customers.find(customer => 
          customer.id !== id && (
            customer.phoneNumber === userData.phoneNumber || 
            (userData.email && customer.email === userData.email)
          )
        );
        
        if (duplicateCustomer) {
          if (duplicateCustomer.email === userData.email) {
            throw new Error('Email đã được sử dụng');
          }
          throw new Error('Số điện thoại đã được sử dụng');
        }
        
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
    return this.searchCustomer('', staff.phoneNumber, staff.email).pipe(
      switchMap(users => {
        const isDuplicate = users.some(user => 
          user.phoneNumber === staff.phoneNumber || 
          (staff.email && user.email === staff.email)
        );
        if (isDuplicate) {
          throw new Error('Số điện thoại hoặc email đã tồn tại');
        }
        return this.apiService.post<UserResponse>(`${this.endpoint}/staff`, staff);
      })
    );
  }
  updateStaff(id: number, staff: UserRequest): Observable<UserResponse> {
    return this.searchCustomer('', staff.phoneNumber, staff.email).pipe(
      switchMap(users => {
        const duplicateUser = users.find(user => 
          user.id !== id && (
            user.phoneNumber === staff.phoneNumber || 
            (staff.email && user.email === staff.email)
          )
        );
        
        if (duplicateUser) {
          if (duplicateUser.email === staff.email) {
            throw new Error('Email đã được sử dụng');
          }
          throw new Error('Số điện thoại đã được sử dụng');
        }
        
        return this.apiService.put<UserResponse>(`${this.endpoint}/staff/${id}`, staff);
      })
    );
  }
  deleteStaff(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/staff/${id}`);
  }

  searchStaff(username: string = '', phone: string = '', email: string = ''): Observable<UserResponse[]> {
    return this.apiService.get<UserResponse[]>(`${this.endpoint}/staff/search`, { 
      params: { username, phone, email } 
    });
  }
}
