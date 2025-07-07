import { Component } from '@angular/core';
import { RouterOutlet, NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; // ✅ Needed for AuthService

import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatToolbar } from '@angular/material/toolbar';

import { AuthService } from './services/auth.service'; // ✅ Adjust if needed

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,        // ✅ THIS is critical
    RouterOutlet,
    MatIcon,
    MatMenu,
    MatMenuTrigger,
    MatToolbar
  ],
  providers: [AuthService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Speciality-Metals';
  showBackButton = false;

  constructor(
    private location: Location,
    private router: Router,
    private authService: AuthService
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const excludedRoutes = ['/', '/login', '/owner-home'];
        this.showBackButton = !excludedRoutes.includes(event.urlAfterRedirects);
      });
  }

  goBack(): void {
    this.location.back();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
