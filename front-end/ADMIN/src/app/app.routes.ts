import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ChartsComponent } from './components/charts/charts.component';
import { ProductComponent } from './components/products/product.component';

export const routes: Routes = [
  { path: 'admin', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'charts', component: ChartsComponent },
  { path: 'products', component: ProductComponent },
];
