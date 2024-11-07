import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  showOrderForm: boolean = false;
  orderId: string = '';
  isSticky: boolean = false;

  showForm() {
    this.showOrderForm = true;
  }

  hideForm() {
    this.showOrderForm = false;
  }

  @HostListener('window:scroll', ['$event'])
  handleScroll() {
    const middleHeader = document.querySelector(
      '.middle-header'
    ) as HTMLElement;
    const stickyPlaceholder = document.querySelector(
      '.sticky-placeholder'
    ) as HTMLElement;

    if (window.scrollY > middleHeader.offsetTop) {
      this.isSticky = true;
      middleHeader.classList.add('sticky');
      stickyPlaceholder.style.height = `${middleHeader.offsetHeight}px`;
      stickyPlaceholder.style.display = 'block';
    } else {
      this.isSticky = false;
      middleHeader.classList.remove('sticky');
      stickyPlaceholder.style.height = '0';
      stickyPlaceholder.style.display = 'none';
    }
  }
}
