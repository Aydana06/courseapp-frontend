import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService} from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import {  Course } from '../../models/models';
import { Router } from '@angular/router';
import { getImageUrl } from '../../utils/image.utils';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  items: Course[] = [];
  loadingId: string | null = null;

  constructor(
    private cartService: CartService, 
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Хэрэглэгч нэвтрээгүй бол login хуудас руу шилжүүлэх
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.loadUserCartAndEnroll();
    this.cartService.cart$.subscribe(items => {
      this.items = items;
    });
  }

  remove(id: string) {
    this.loadingId = id;
    this.cartService.removeFromCart(id).subscribe({
      next: () => {
        this.loadingId = null;
      },
      error: () => {
        this.loadingId = null;
      }
    });
  }

  buyCourse() {
    this.router.navigate(['/checkout']);
  }

  enrollCourse(courseId: string) {
    this.loadingId = courseId;
    const enrollObservable = this.cartService.enroll(courseId);
    if (enrollObservable) {
      enrollObservable.subscribe({
        next: () => {
          this.loadingId = null;
          alert('Сургалтад амжилттай бүртгүүллээ! Таны dashboard-д харагдана.');
          // Refresh cart data
          this.cartService.loadUserCartAndEnroll();
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        },
        error: (error: any) => {
          console.error('Enrollment error:', error);
          this.loadingId = null;
          alert('Бүртгүүлэхэд алдаа гарлаа. Дахин оролдоно уу.');
        }
      });
    } else {
      this.loadingId = null;
    }
  }

  getCourseImageUrl(imagePath: string): string {
    return getImageUrl(imagePath);
  }

  getTotalPrice(): number {
    return this.items.reduce((total, item) => total + (item.price || 0), 0);
  }

  routeCourse(){
    this.router.navigate(['/courses']);
  }
}
