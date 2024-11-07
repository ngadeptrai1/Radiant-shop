import { Component } from '@angular/core';
import { LogoutModalComponent } from '../logout-modal/logout-modal.component';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { SlideBarComponent } from '../slide-bar/slide-bar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [
    LogoutModalComponent,
    FooterComponent,
    HeaderComponent,
    SlideBarComponent,
    CommonModule,
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
})
export class ProductComponent {
  products = [
    {
      id: 1,
      name: 'Sản phẩm A',
      category: 'Danh mục 1',
      price: 100000,
      quantity: 10,
    },
    {
      id: 2,
      name: 'Sản phẩm B',
      category: 'Danh mục 2',
      price: 200000,
      quantity: 5,
    },
  ];
}
