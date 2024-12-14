import { Routes } from '@angular/router';

import { DetailProductComponent } from './components/detail-product/detail-product.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { PaymentComponent } from './components/payment/payment.component';
import { BrandComponent } from './components/brand/brand.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ThankYouComponent } from './components/thank-you/thank-you.component';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { MyOrderComponent } from './components/my-order/my-order.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';
import { WishListComponent } from './components/wish-list/wish-list.component';
import { OrderEmailComponent } from './components/order-email/order-email.component';
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'products/:id', component: DetailProductComponent },
  { path: 'brand', component: BrandComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'product-list', component: ProductListComponent },
  { path: 'thank-you', component: ThankYouComponent },
  { path: 'my-account', component: MyAccountComponent },
  { path: 'my-orders', component: MyOrderComponent},
  {path:'wishlist',component:WishListComponent},
  { path:'order-detail/:id', component: OrderDetailComponent},
  {path:'order-lookup' , component:OrderEmailComponent},
  { path: '**', component: NotFoundComponent}
];
