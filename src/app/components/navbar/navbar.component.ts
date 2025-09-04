import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {User} from '../../models/models';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  isMenuOpen = false;
  cartCount = 0;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Сагс зөвхөн student эрхтэй хэрэглэгчдэд ачаална
    if (!this.isAdminOrInstructor) {
      this.cartService.loadUserCartAndEnroll();
      this.cartService.cart$.subscribe(cart => {
        this.cartCount = cart && cart.length;
      });
    }
    
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  get isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  get isAdminOrInstructor(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    const role = this.authService.role;
    return role === 'admin' || role === 'instructor';
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
    this.isMenuOpen = false;
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
} 