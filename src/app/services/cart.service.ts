import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Course } from '../models/models';
import { ApiService, ApiResponse } from './api.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Course[]>([]);
  cart$ = this.cartSubject.asObservable();

  private enrolledSubject = new BehaviorSubject<Course[]>([]);
  enrolled$ = this.enrolledSubject.asObservable();

  constructor(private api: ApiService) {}

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
    this.api.get<ApiResponse<{ cart: Course[]; enrolledCourses: Course[] }>>('/users')
      .pipe(
        tap(res => {
          if (res.success && res.data) {
            this.cartSubject.next(res.data.cart);
            this.enrolledSubject.next(res.data.enrolledCourses);
          }
        })
      ).subscribe();
  }
  // Сагсанд нэмэх
  addToCart(courseId: string) {
    this.api.post<ApiResponse<Course[]>>(`/users/cart/${courseId}`, {})
      .subscribe(res => {
        if (res.success && res.data) {
          this.cartSubject.next(res.data);
        }
      });
  }

removeFromCart(courseId: string) {
  return this.api.delete<ApiResponse<Course[]>>(`/users/cart/${courseId}`)
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
    this.api.post<ApiResponse<Course[]>>(`/users/enroll/${courseId}`, {})
      .pipe(
        tap(res => {
          if (res.success && res.data) {
            this.enrolledSubject.next(res.data);
            // сагс автоматаар шинэчлэгдэнэ
            this.loadUserCartAndEnroll();
          }
        })
      ).subscribe();
  }
}
