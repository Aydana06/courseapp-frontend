import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, Course } from '../../services/cart.service';
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

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit() {
    this.cartService.cart$.subscribe(items => {
      this.items = items;
    });
  }

  remove(id: number) {
    this.cartService.removeFromCart(id);
  }

  buyCourse(){
      this.router.navigate(['/checkout']);
  }

  routeCourse(){
    this.router.navigate(['/courses']);
  }
}
