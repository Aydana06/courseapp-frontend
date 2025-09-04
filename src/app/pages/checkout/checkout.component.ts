import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { Course } from '../../models/models';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  items: Course[] = [];
  total = 0;

  constructor(private cartService: CartService) {}

  ngOnInit() {
    // эхлээд серверээс сагсыг ачаална
    this.cartService.loadUserCartAndEnroll();

    // cart$-д subscribe хийгээд мэдээллийг авна
    this.cartService.cart$.subscribe(items => {
      this.items = items || [];
      this.total = this.items.reduce((sum, item) => sum + (item.price ?? 0), 0);
    });
  }

  removeFromCart(courseId: string) {
    this.cartService.removeFromCart(courseId);
  }

  enroll(courseId: string) {
    this.cartService.enroll(courseId);
  }
}
