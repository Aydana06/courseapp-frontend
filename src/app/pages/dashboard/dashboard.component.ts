import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CourseService } from '../../services/course.service';
import { ProgressService } from '../../services/progress.service';
import { CertificateService } from '../../services/certificate.service';
import {User, Course, CourseProgress, Certificate} from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  enrolledCourses: any[] = [];
  recommendedCourses: Course[] = [];
  userProgress: CourseProgress[] = [];
  overallStats = { totalCourses: 0, completedCourses: 0, averageProgress: 0 };
  recentActivity: CourseProgress[] = [];
  certificates: Certificate[] = [];

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private progressService: ProgressService,
    private certificateService: CertificateService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
        this.loadDashboardData();
      }
    });
  }

  loadDashboardData() {
    if (!this.user) return;

    // Load user progress
    this.progressService.getUserProgress(this.user.id).subscribe(progress => {
      this.userProgress = progress;
      this.loadEnrolledCourses();
    });

    // Load overall statistics
    this.progressService.getOverallProgress(this.user.id).subscribe(stats => {
      this.overallStats = stats;
    });

    // Load recent activity
    this.progressService.getRecentActivity(this.user.id).subscribe(activity => {
      this.recentActivity = activity;
    });

    // Load certificates
    this.certificateService.getUserCertificates(this.user.id).subscribe(certificates => {
      this.certificates = certificates;
    });

    // Load recommended courses
    this.courseService.getFeaturedCourses().subscribe(courses => {
      this.recommendedCourses = courses;
    });
  }

  loadEnrolledCourses() {
    this.enrolledCourses = [];
    
    this.userProgress.forEach(progress => {
      this.courseService.getCourseById(progress.courseId).subscribe(course => {
        if (course) {
          this.enrolledCourses.push({
            ...course,
            progress: progress.progress,
            lastAccessed: progress.lastAccessed,
            startDate: progress.startDate
          });
        }
      });
    });
  }

  get averageProgress(): number {
    if (this.enrolledCourses.length === 0) return 0;
    return Math.round(this.enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / this.enrolledCourses.length);
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return '#28a745';
    if (progress >= 50) return '#ffc107';
    return '#dc3545';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('mn-MN');
  }

  continueCourse(courseId: number) {
    // Navigate to course detail
    window.location.href = `/course/${courseId}`;
  }


  onImageError(event: Event) {
  (event.target as HTMLImageElement).src = 'assets/images/course-placeholder.png';
}
}
