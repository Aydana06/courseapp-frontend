import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, Course } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private cartService: CartService, public authService: AuthService) {
  }

  featuredCourses: Course[] = [
    {
      id: 1,
      title: 'Angular 20-р хувилбар',
      description: 'Angular-ийн хамгийн сүүлийн үеийн онцлогуудыг сурна уу',
      price: 150000,
      duration: '20 цаг',
      image: 'assets/images/angular.png',
      instructor: 'Бат-Эрдэнэ'
    },
    {
      id: 2,
      title: 'React.js Мастер класс',
      description: 'React.js-ийн бүх чухал онцлогуудыг практик дадлагатай',
      price: 120000,
      duration: '15 цаг',
      image: 'assets/images/react.png',
      instructor: 'Сүхээ'
    },
    {
      id: 3,
      title: 'Node.js Backend Development',
      description: 'Node.js ашиглан backend систем хөгжүүлэх',
      price: 180000,
      duration: '25 цаг',
      image: 'assets/images/nodejs.png',
      instructor: 'Төгсбаатар'
    }
  ];

  testimonials = [
    {
      name: 'Болд',
      role: 'Frontend Developer',
      content: 'Энэ сургалт миний карьерт маш их тустай байсан. Одоо илүү сайн ажил хийж байна.',
      rating: 5
    },
    {
      name: 'Алтанцэцэг',
      role: 'Student',
      content: 'Багш нар маш сайн заадаг, материал нь ойлгомжтой байсан.',
      rating: 5
    },
    {
      name: 'Энхбат',
      role: 'Software Engineer',
      content: 'Практик дадлага хийх боломжтой байсан нь маш сайн.',
      rating: 4
    }
  ];

  addToCart(course: Course) {
    this.cartService.addToCart(course);
    alert(`"${course.title}" сагсанд нэмэгдлээ.`);
  }
}
