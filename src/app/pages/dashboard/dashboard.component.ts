import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CourseService } from '../../services/course.service';
import { ProgressService } from '../../services/progress.service';
import {User, Course, CourseProgress} from '../../models/models';
import {Router} from "@angular/router";
import { forkJoin } from 'rxjs';

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

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private progressService: ProgressService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
        this.loadDashboardData();
        this.loadEnrolledCourses();
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

    // Load recommended courses
    this.courseService.getFeaturedCourses().subscribe(courses => {
      this.recommendedCourses = courses;
    });
  }

loadEnrolledCourses() {
  const requests = this.userProgress.map(p => this.courseService.getCourseById(p.courseId));
  forkJoin(requests).subscribe(courses => {
    this.enrolledCourses = courses.map((course, i) => ({
      ...course,
      progress: this.userProgress[i].progress,
      lastAccessed: this.userProgress[i].lastAccessed,
      startDate: this.userProgress[i].startDate
    }));
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

formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}


  continueCourse(courseId: number) {
    // Navigate to course detail
   this.router.navigate(['/course', courseId]);
  }


  onImageError(event: Event) {
  (event.target as HTMLImageElement).src = 'assets/images/course-placeholder.png';
}
}
