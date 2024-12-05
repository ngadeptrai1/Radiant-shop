import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../../type';
import { LogoutModalComponent } from '../logout-modal/logout-modal.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LogoutModalComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout() {
    const modal = document.getElementById('logoutModal');
    if (modal) {
      (window as any).$('#logoutModal').modal('show');
    }
  }
}
