import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../../type';


@Component({
  selector: 'app-nested-category',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <li class="nav-item dropdown category-menu">
      <a class="dropdown-toggle nav-pills text-decoration-none text-dark">
        <i class="bi bi-grid-3x3-gap-fill"></i> DANH MỤC SẢN PHẨM
      </a>
      <ul class="menu-item text-decoration-none text-dark">
        <li class="menu-item-wrapper text-decoration-none text-dark " *ngFor="let category of categories" 
            [class.menu-item-has-children]="category.subCategories?.length">
          <a href="/product-list?category={{category.id}}" class="nav-link text-decoration-none text-dark">
            <span class="menu-text text-dark ">{{category.name}}</span>
          </a>
        </li>
      </ul>
    </li>
  `,
  styles: [`
    .category-menu {
      position: relative;
    }

    .category-menu > a {
      background: rgba(0, 0, 0, 0.1);
      padding: 0 25px;
      height: 45px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .category-menu > a i {
      font-size: 20px;
    }

    .menu-item {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      background: white;
      min-width: 250px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      padding: 0;
      margin: 0;
    }

    .category-menu:hover .menu-item {
      display: block;
    }

    .menu-item li {
      position: relative;
    }

    .menu-item li a {
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #333;
      border-bottom: 1px solid #eee;
      text-decoration: none;
    }

    .menu-item li:hover > a {
      color: #ed145b;
      background-color: #fff0f3;
    }
  `]
})

export class NestedCategoryComponent {
  @Input() categories: Category[] = [];
}