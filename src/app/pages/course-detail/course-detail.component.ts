import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { Course } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { CommentComponent } from '../../components/comments/comments.component';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CommentComponent],
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css']
})
export class CourseDetailComponent implements OnInit {
  course: Course | null = null;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private courseService: CourseService,
    public authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/courses']);
      return;
    }

    this.courseService.getCourseById(id).subscribe({
      next: (course) => {
        if (course) {
          this.course = course;
        } else {
          this.router.navigate(['/courses']);
        }
      },
      error: () => {
        this.router.navigate(['/courses']);
      }
    });
  }

  addToCart(course: Course) {
    this.cartService.addToCart(course);
    alert(`${course.title} сагсанд нэмэгдлээ!`);
  }
}
