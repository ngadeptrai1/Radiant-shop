import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ChartsComponent } from './components/charts/charts.component';
import { ProductComponent } from './components/products/product.component';
import { CategoryComponent } from './components/category/category.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { BrandComponent } from './components/brand/brand.component';
import { VoucherComponent } from './components/voucher/voucher.component';
import { ColorComponent } from './components/color/color.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'charts', component: ChartsComponent },
  { path: 'products', component: ProductComponent },
  { path:'category',component:CategoryComponent},
  { path:'brands',component:BrandComponent},
  { path:'vouchers',component:VoucherComponent},
  { path:'colors',component:ColorComponent},

  { path: '**',component: NotFoundComponent }

 
];
