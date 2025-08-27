import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Course } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Course[]>([]);
  cart$ = this.cartSubject.asObservable();

  private enrolledSubject = new BehaviorSubject<Course[]>([]);
  enrolled$ = this.enrolledSubject.asObservable();

  constructor() {}

  // Серверээс сагс ачаалах (одоохондоо localStorage ашиглая)
  loadCart() {
    const saved = localStorage.getItem('cart');
    if (saved) {
      this.cartSubject.next(JSON.parse(saved));
    }
  }

  private saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cartSubject.value));
  }

  addToCart(course: Course) {
    const updated = [...this.cartSubject.value, course];
    this.cartSubject.next(updated);
    this.saveCart();
  }

  removeFromCart(courseId: string) {
    const updated = this.cartSubject.value.filter(c => c._id !== courseId);
    this.cartSubject.next(updated);
    this.saveCart();
  }

  // 🟢 Checkout дээр хэрэглэх enroll
  enroll(courseId: string) {
    const course = this.cartSubject.value.find(c => c._id === courseId);
    if (course) {
      const updatedEnrolled = [...this.enrolledSubject.value, {
        ...course,
        progress: 0,
        lastAccessed: new Date().toISOString()
      }];
      this.enrolledSubject.next(updatedEnrolled);

      // Сагсаас хасна
      this.removeFromCart(courseId);

      // Хүсвэл localStorage-д enrolled хадгалж болно
      localStorage.setItem('enrolled', JSON.stringify(this.enrolledSubject.value));
    }
  }

  checkout() {
  // Бүртгүүлсэн курсууд руу нэмж өгнө
  const enrolled = this.enrolledSubject.value;
  const newEnrolled = [
    ...enrolled,
    ...this.cartSubject.value.map(c => ({
      ...c,
      progress: 0,
      lastAccessed: new Date().toISOString()
    }))
  ];

  this.enrolledSubject.next(newEnrolled);
  localStorage.setItem('enrolled', JSON.stringify(newEnrolled));

  // Сагсыг цэвэрлэнэ
  this.cartSubject.next([]);
  localStorage.removeItem('cart');
}

}
