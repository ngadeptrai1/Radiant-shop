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
import { AddProductComponent } from './components/add-product/add-product.component';
import { POSComponent } from './components/pos/pos.component';
import { UserComponent } from './components/user/user.component';
import { OrderComponent } from './components/order/order.component';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';
import { ProductReviewComponent } from './components/product-review/product-review.component';
import { UpdateProductComponent } from './components/update-product/update-product.component';
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
  { path:'add-product',component:AddProductComponent},
  { path:'pos',component:POSComponent},
  { path:'user',component:UserComponent},
  { path:'orders',component:OrderComponent},
  { path:'orders/:id',component:OrderDetailComponent},
  { path:'product-review',component:ProductReviewComponent},
  { path:'update-product/:id',component:UpdateProductComponent},
  { path: '**',component: NotFoundComponent }
];
