import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Course, Comment } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { CourseService } from '../../services/course.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { CommentService } from '../../services/comment.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  courses$!: Observable<Course[]>;
  featuredCourses$!: Observable<Course[]>;
  enrolledCourses: string[] = [];
  latestComments: Comment[] = [];
  // Dynamic statistics
  totalStudents = 0;
  totalCourses = 0;
  totalInstructors = 0;
  satisfactionRate = 0; // percent

  showForm = false;
  newComment: Comment = { _id: '',name: '', role: '', content: '', rating: 5, userId: '' };

  rating = [1, 2, 3, 4, 5];

  constructor(
    private cartService: CartService,
    private router: Router,
    public authService: AuthService,
    private courseService: CourseService,
    private commentService: CommentService,
  ) {}

  ngOnInit() {
    this.loadCourses();
    this.loadEnrolledCourses();
    this.loadLatestComments();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  loadLatestComments() {
    this.commentService.getComments(undefined, 3).subscribe(list => this.latestComments = list);
  }

  goToCourse(id: string) {
    this.router.navigate(['/courses', id]);
  }

  loadCourses() {
    this.courses$ = this.courseService.getFeaturedCourses();
    this.featuredCourses$ = this.courses$; 
    // Load all courses to compute stats
    this.courseService.getAllCourses().subscribe(all => {
      this.totalCourses = all.length;
      this.totalStudents = all.reduce((sum, c) => sum + (c.details?.[0]?.students || 0), 0);
      const instructors = new Set(all.map(c => c.instructor).filter(Boolean));
      this.totalInstructors = instructors.size;
      const avgRating = all.length ? (all.reduce((sum, c) => sum + (c.details?.[0]?.rating || 0), 0) / all.length) : 0;
      this.satisfactionRate = Math.round(Math.min(100, Math.max(0, avgRating * 20))); // rating (0-5) -> percent
    });
  }

  loadEnrolledCourses() {
    if (!this.authService.isAuthenticated()) {
      this.enrolledCourses = [];
      return;
    }

    this.cartService.loadUserCartAndEnroll();
    this.cartService.enrolled$.subscribe(courses => {
      this.enrolledCourses = courses.map(course => course._id);
    });
  }

  addToCart(courseId: string) {
    this.cartService.addToCart(courseId);
    alert(`Cагсанд амжилттай нэмэгдлээ!`);
  }

  isEnrolled(courseId: string): boolean {
    return this.enrolledCourses.includes(courseId);
  }

  // Бүртгүүлээгүй сургалтуудыг шүүх
  getUnenrolledCourses(courses: Course[]): Course[] {
    return courses.filter(course => !this.isEnrolled(course._id));
  }
}
