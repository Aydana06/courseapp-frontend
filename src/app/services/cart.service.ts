import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Course } from '../models/models';
import { ApiService, ApiResponse } from './api.service';
import { AuthService } from './auth.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Course[]>([]);
  cart$ = this.cartSubject.asObservable();

  private enrolledSubject = new BehaviorSubject<Course[]>([]);
  enrolled$ = this.enrolledSubject.asObservable();

  constructor(
    private api: ApiService,
    private authService: AuthService
  ) {}

  // Refresh хийсэн үед сагсыг дахин дуудах
  // loadCart() {
  //   this.api.get<ApiResponse<Course[]>>("/users/cart")
  //     .subscribe(res => {
  //       if (res.success && res.data) {
  //         this.cartSubject.next(res.data);
  //       }
  //     }); 
  // }
  // Сагс болон enrollment серверээс ачаалах
  loadUserCartAndEnroll() {
    // Хэрэглэгч нэвтрээгүй бол cart ачаалахгүй
    if (!this.authService.isAuthenticated()) {
      console.log('User not authenticated, skipping cart load');
      // Clear any existing cart data
      this.cartSubject.next([]);
      this.enrolledSubject.next([]);
      return;
    }

    this.api.get<ApiResponse<{ cart: Course[]; enrolledCourses: Course[] }>>('/cart')
      .pipe(
        tap(res => {
          if (res.success && res.data) {
            this.cartSubject.next(res.data.cart);
            this.enrolledSubject.next(res.data.enrolledCourses);
          }
        })
      ).subscribe({
        error: (error) => {
          console.error('Error loading cart:', error);
          // 401 алдаа гарвал cart-ийг хоослох
          if (error.status === 401) {
            this.cartSubject.next([]);
            this.enrolledSubject.next([]);
          }
        }
      });
  }
  // Сагсанд нэмэх
  addToCart(courseId: string) {
    // Хэрэглэгч нэвтрээгүй бол нэвтрэх хуудас руу шилжүүлэх
    if (!this.authService.isAuthenticated()) {
      alert('Сагсанд нэмэхийн тулд нэвтрэх шаардлагатай');
      return;
    }

    this.api.post<ApiResponse<Course[]>>(`/cart/cart/${courseId}`, {})
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.cartSubject.next(res.data);
            alert('Сагсанд амжилттай нэмэгдлээ!');
          }
        },
        error: (error) => {
          console.error('Сагсанд нэмэхэд алдаа гарлаа:', error);
          if (error.status === 401) {
            alert('Нэвтрэх шаардлагатай');
          } else {
            alert('Сагсанд нэмэхэд алдаа гарлаа. Дахин оролдоно уу.');
          }
        }
      });
  }

removeFromCart(courseId: string) {
  return this.api.delete<ApiResponse<Course[]>>(`/cart/cart/${courseId}`)
    .pipe(
      tap(res => {
        if (res.success && res.data) {
          this.cartSubject.next(res.data);
        }
      })
    );
}


  // Enrollment хийх
  enroll(courseId: string) {
    // Хэрэглэгч нэвтрээгүй бол нэвтрэх шаардлагатай
    if (!this.authService.isAuthenticated()) {
      alert('Сургалтад бүртгүүлэхийн тулд нэвтрэх шаардлагатай');
      return;
    }

    return this.api.post<ApiResponse<Course[]>>(`/cart/enroll/${courseId}`, {})
      .pipe(
        tap(res => {
          if (res.success && res.data) {
            this.enrolledSubject.next(res.data);
            // сагс автоматаар шинэчлэгдэнэ
            this.loadUserCartAndEnroll();
            console.log('Course enrolled successfully:', courseId);
          }
        })
      );
  }
}
