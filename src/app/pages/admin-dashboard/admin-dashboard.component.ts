import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CourseService } from '../../services/course.service';
import { Course } from '../../models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  user: any = null;
  courses: Course[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private router: Router
  ) {}

  ngOnInit() {
    // Хэрэглэгч instructor эсвэл admin эрхтэй эсэхийг шалгах
    const userRole = this.authService.role;
    if (!userRole || (userRole !== 'instructor' && userRole !== 'admin')) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadUserData();

    // Cache доторх өөрчлөлтийг шууд тусгана
    this.courseService.courses$.subscribe(courses => {
      this.courses = courses;
      if (courses && courses.length > 0) {
        this.isLoading = false;
      }
    });

    // Always force refresh on enter so recent edits appear immediately
    this.loadCourses(true);
  }

  loadUserData() {
    this.user = this.authService.getCurrentUser();
  }

  loadCourses(forceRefresh: boolean = false) {
    // Force refresh optionally; by default will refresh on init

    this.isLoading = true;
    this.errorMessage = '';

    this.courseService.getAllCourses(forceRefresh).subscribe({
      next: (courses) => {
        this.courses = courses;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.errorMessage = 'Сургалтуудыг уншихад алдаа гарлаа';
        this.isLoading = false;
      }
    });
  }

  // Хүчээр шинэчлэх
  refreshCourses() {
    this.loadCourses(true);
  }

  createCourse() {
    this.router.navigate(['/create-course']);
  }

  editCourse(courseId: string) {
    this.router.navigate(['/edit-course', courseId]);
  }

  deleteCourse(courseId: string) {
    if (confirm('Энэ сургалтыг устгахдаа итгэлтэй байна уу?')) {
      this.courseService.deleteCourse(courseId).subscribe({
        next: (success) => {
          if (success) {
            alert('Сургалт амжилттай устгагдлаа');
            this.refreshCourses();
          } else {
            alert('Сургалт устгахад алдаа гарлаа');
          }
        },
        error: (error) => {
          console.error('Error deleting course:', error);
          alert('Сургалт устгахад алдаа гарлаа');
        }
      });
    }
  }

  getCourseImageUrl(imagePath: string): string {
    return imagePath || 'assets/images/course-placeholder.jpg';
  }

  isAdmin(): boolean {
    return this.authService.role === 'admin';
  }

  isInstructor(): boolean {
    return this.authService.role === 'instructor';
  }

  // Статистик тооцоолох
  getTotalStudents(): number {
    return this.courses.reduce((total, course) => {
      return total + (course.details?.[0]?.students || 0);
    }, 0);
  }

  getAverageRating(): number {
    if (this.courses.length === 0) return 0;
    const totalRating = this.courses.reduce((total, course) => {
      return total + (course.details?.[0]?.rating || 0);
    }, 0);
    return Math.round((totalRating / this.courses.length) * 10) / 10;
  }

  // Бүх сургалт харах
  viewAllCourses() {
    this.router.navigate(['/courses']);
  }
}
