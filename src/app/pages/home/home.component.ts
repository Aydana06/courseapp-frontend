import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Course, Comment } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { CourseService } from '../../services/course.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { CommentComponent } from '../../components/comments/comments.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, CommentComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  courses$!: Observable<Course[]>;
  // comments$!: Observable<Comment[]>;
  featuredCourses$!: Observable<Course[]>;

  showForm = false;
  newComment: Comment = { name: '', role: '', content: '', rating: 5 };

  rating = [1, 2, 3, 4, 5];

  constructor(
    private cartService: CartService,
    private router: Router,
    public authService: AuthService,
    private courseService: CourseService,
  ) {}

  ngOnInit() {
    this.loadCourses();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  goToCourse(id: string) {
    this.router.navigate(['/courses', id]);
  }

  loadCourses() {
    this.courses$ = this.courseService.getFeaturedCourses();
    this.featuredCourses$ = this.courses$; 
  }

  addToCart(course: Course) {
    this.cartService.addToCart(course);
    alert(`"${course.title}" сагсанд нэмэгдлээ.`);
  }
}
