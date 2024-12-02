import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-slide-bar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './slide-bar.component.html',
  styleUrl: './slide-bar.component.scss',
})
export class SlideBarComponent {
  isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
