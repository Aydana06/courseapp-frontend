import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService} from '../../services/cart.service';
import {  Course } from '../../models/models';

import { Router } from '@angular/router';

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

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit() {
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

  routeCourse(){
    this.router.navigate(['/courses']);
  }
}
