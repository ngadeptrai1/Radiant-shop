import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SlideBarComponent } from './components/slide-bar/slide-bar.component';
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    SlideBarComponent,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'admin-dashboard';
  isAuthenticated = false;
  isLoginPage = false;
  isInitialized = false;

  constructor(private authService: AuthService, private router: Router) {
    // Chỉ theo dõi route changes sau khi đã khởi tạo xong
    this.router.events.pipe(
      filter(() => this.isInitialized)
    ).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isLoginPage = this.checkIsLoginPage(event.url);
        
        // Chỉ redirect khi không phải trang login và chưa authenticated
        if (!this.isLoginPage && !this.isAuthenticated) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  async ngOnInit() {
    try {
      // Đợi cho initializeAuthentication hoàn tất
      await firstValueFrom(this.authService.initializeAuthentication());
      this.isInitialized = true;

      // Theo dõi thay đổi của currentUser
      this.authService.currentUser$.subscribe(user => {
        this.isAuthenticated = !!user;
        
        if (this.isInitialized) {
          const currentUrl = this.router.url;
          this.isLoginPage = this.checkIsLoginPage(currentUrl);
          
          if (!this.isAuthenticated && !this.isLoginPage) {
            this.router.navigate(['/login']);
          } else if (this.isAuthenticated && this.isLoginPage) {
            this.router.navigate(['/']); // hoặc trang mặc định sau khi đăng nhập
          }
        }
      });
    } catch (error) {
      console.error('Failed to initialize authentication:', error);
      this.isInitialized = true;
      this.router.navigate(['/login']);
    }
  }

  private checkIsLoginPage(url: string): boolean {
    return url === '/login' || 
           url === '/register' || 
           url === '/forgot-password';
  }
}
