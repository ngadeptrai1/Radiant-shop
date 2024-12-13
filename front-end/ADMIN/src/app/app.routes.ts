import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
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
import { InvoicesComponent } from './components/invoices/invoices.component';
export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'charts', component: ChartsComponent, canActivate: [AuthGuard] },
  { path: 'products', component: ProductComponent, canActivate: [AuthGuard] },
  { path: 'category', component: CategoryComponent, canActivate: [AuthGuard] },
  { path: 'brands', component: BrandComponent, canActivate: [AuthGuard] },
  { path: 'vouchers', component: VoucherComponent, canActivate: [AuthGuard] },
  { path: 'colors', component: ColorComponent, canActivate: [AuthGuard] },
  { path: 'add-product', component: AddProductComponent, canActivate: [AuthGuard] },
  { path: 'pos', component: POSComponent, canActivate: [AuthGuard] },
  { path: 'user', component: UserComponent, canActivate: [AuthGuard] },
  { path: 'orders', component: OrderComponent, canActivate: [AuthGuard] },
  { path: 'orders/:id', component: OrderDetailComponent, canActivate: [AuthGuard] },
  { path: 'product-review', component: ProductReviewComponent, canActivate: [AuthGuard] },
  { path: 'update-product/:id', component: UpdateProductComponent, canActivate: [AuthGuard] },
  { path: 'invoices', component: InvoicesComponent, canActivate: [AuthGuard] },
  { path: '**', component: NotFoundComponent }
];
