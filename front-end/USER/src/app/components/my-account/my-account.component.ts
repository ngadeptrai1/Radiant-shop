import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserAddressService } from '../../services/user-address.service';
import { User, UserAddress } from '../../../type';
import { GhnApiService } from '../../services/ghn-api.service';

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.css'
})
export class MyAccountComponent implements OnInit {
  user: User | null = null;
  addresses: UserAddress[] = [];
  activeTab: 'profile' | 'address' | 'password' = 'profile';
  
  profileForm: FormGroup;
  addressForm: FormGroup;
  passwordForm: FormGroup;
  showAddressForm = false;
  provinces: any[] = [];
  districts: any[] = [];
  wards: any[] = [];
  selectedProvince: any = null;
  selectedDistrict: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userAddressService: UserAddressService,
    private ghnApiService: GhnApiService
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.addressForm = this.fb.group({
      fullName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      provinceId: ['', Validators.required],
      provinceName: ['', Validators.required],
      districtId: ['', Validators.required],
      districtName: ['', Validators.required],
      wardCode: ['', Validators.required],
      wardName: ['', Validators.required]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
    this.loadAddresses();
  }

  ngOnInit() {
    this.loadUserData();
    this.loadAddresses();
    this.loadProvinces();
  }

  loadUserData() {
    this.authService.getUser().subscribe({
      next: (user) => {
        this.user = user;
        this.profileForm.patchValue({
          fullName: user.fullName,
          email: user.email,
          username: user.username
        });
      },
      error: (error) => console.error('Error loading user data:', error)
    });
  }

  loadAddresses() {
    if (this.user) {
      this.userAddressService.getAll().subscribe({
        next: (addresses) => {
          this.addresses = addresses;
        },
        error: (error) => console.error('Error loading addresses:', error)
      });
    }
  }

  switchTab(tab: 'profile' | 'address' | 'password') {
    this.activeTab = tab;
  }

  onProfileSubmit() {
    if (this.profileForm.valid) {
      // Implement profile update logic
      console.log(this.profileForm.value);
    }
  }

  toggleAddressForm() {
    this.showAddressForm = !this.showAddressForm;
    if (!this.showAddressForm) {
      this.addressForm.reset();
    }
  }

  onAddressSubmit() {
    console.log('1');
    
      const addressData = {
        ...this.addressForm.value,
        email: this.addressForm.get('email')?.value
      };
      
      this.userAddressService.create(addressData).subscribe({
        next: (address) => {
          this.addresses.push(address);
          this.addressForm.reset();
          this.showAddressForm = false;
          this.loadAddresses();
        },
        error: (error) => console.error('Error adding address:', error)
      });
    
  }

  deleteAddress(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      this.userAddressService.delete(id).subscribe({
        next: () => {
          this.addresses = this.addresses.filter(addr => addr.id !== id);
        },
        error: (error) => console.error('Error deleting address:', error)
      });
    }
  }

  onPasswordSubmit() {
    if (this.passwordForm.valid) {
      // Implement password change logic
      console.log(this.passwordForm.value);
    }
  }

  loadProvinces() {
    this.ghnApiService.getProvinces().subscribe({
      next: (response) => {
        this.provinces = response.data;
      },
      error: (error) => console.error('Error loading provinces:', error)
    });
  }

  onProvinceChange(event: any) {
    const provinceId = event.target.value;
    const province = this.provinces.find(p => p.ProvinceID === Number(provinceId));
    
    if (province) {
      this.addressForm.patchValue({
        provinceId: province.ProvinceID,
        provinceName: province.ProvinceName
      });

      this.ghnApiService.getDistricts(province.ProvinceID).subscribe({
        next: (response) => {
          this.districts = response.data;
          this.wards = [];
          this.addressForm.patchValue({
            districtId: '',
            districtName: '',
            wardCode: '',
            wardName: ''
          });
        },
        error: (error) => console.error('Error loading districts:', error)
      });
    }
  }

  onDistrictChange(event: any) {
    const districtId = event.target.value;
    const district = this.districts.find(d => d.DistrictID === Number(districtId));
    
    if (district) {
      this.addressForm.patchValue({
        districtId: district.DistrictID,
        districtName: district.DistrictName
      });

      this.ghnApiService.getWards(district.DistrictID).subscribe({
        next: (response) => {
          this.wards = response.data;
          this.addressForm.patchValue({
            wardCode: '',
            wardName: ''
          });
        },
        error: (error) => console.error('Error loading wards:', error)
      });
    }
  }

  onWardChange(event: any) {
    const wardCode = event.target.value;
    const ward = this.wards.find(w => w.WardCode === wardCode);
    
    if (ward) {
      this.addressForm.patchValue({
        wardCode: ward.WardCode,
        wardName: ward.WardName
      });
    }
  }
}
