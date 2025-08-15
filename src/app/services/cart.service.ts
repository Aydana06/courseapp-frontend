import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Course {
  id: number;
  title: string;
  price: number;
  image: string;
  description: string;
  duration: string;
  instructor: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: Course[] = [];

  private cartSubject = new BehaviorSubject<Course[]>([]);
  cart$ = this.cartSubject.asObservable();

  addToCart(course: Course) {
    if (!this.items.find(item => item.id === course.id)) {
      this.items.push(course);
      this.cartSubject.next(this.items);
    }
  }

  removeFromCart(courseId: number) {
    this.items = this.items.filter(item => item.id !== courseId);
    this.cartSubject.next(this.items);
  }

  clearCart() {
    this.items = [];
    this.cartSubject.next(this.items);
  }

  getItems() {
    return [...this.items];
  }
}
