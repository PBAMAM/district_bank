import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'District Bank';
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      
      // Allow access to login pages without authentication
      const publicRoutes = ['/admin', '/client', '/login'];
      const currentUrl = this.router.url;
      
      // Check if current route is a public route
      const isPublicRoute = publicRoutes.some(route => currentUrl.startsWith(route));
      
      // Only redirect to client if not on a public route and not authenticated
      if (!this.isAuthenticated && !isPublicRoute) {
        this.router.navigate(['/client']);
      }
    });
  }
}
