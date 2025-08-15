import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CourseService, Course } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css']
})
export class CourseDetailComponent implements OnInit {
  course: Course | null = null;
  courseId: number = 0;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private courseService: CourseService,
    private cartService: CartService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.courseId = +params['id'];
      this.loadCourse();
    });
  }

  loadCourse() {
    this.courseService.getCourseById(this.courseId).subscribe(course => {
      if (course) {
        this.course = course;
      } else {
        this.router.navigate(['/courses']);
      }
    });
  }

  addToCart(course: Course) {
    this.cartService.addToCart(course);
    alert(`${course.title} сагсанд нэмэгдлээ!`);
  }
} 