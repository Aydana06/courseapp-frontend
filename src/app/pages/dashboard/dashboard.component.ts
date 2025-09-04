import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CourseService } from '../../services/course.service';
import { User, Course, CourseProgress } from '../../models/models';
import { Router } from "@angular/router";
import { forkJoin } from 'rxjs';
import { UserService } from '../../services/user.service';
import { ProgressService } from '../../services/progress.service';
import { getImageUrl } from '../../utils/image.utils';

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
  isLoading = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private courseService: CourseService,
    private router: Router,
    private progressService: ProgressService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('No user ID found');
      return;
    }

    this.isLoading = true;
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        if (!user) {
          console.error('User not found');
          this.isLoading = false;
          return;
        }
        this.user = user;
        console.log('User loaded:', user);

        // хэрэглэгчийн progress array-г ашиглах
        this.userProgress = user.progress || [];
        console.log('User progress loaded:', this.userProgress);

        // хэрэглэгчийн progress-г хурдан cache-ээс/локалаас ачаалах
        this.progressService.getUserProgress(userId).subscribe(progressList => {
          this.userProgress = progressList || [];
          // сургалтуудыг ачаалах
          this.loadEnrolledCourses();
          this.calculateStats();
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.isLoading = false;
      }
    });
  }

  refreshDashboard() {
    this.loadDashboardData();
  }

  loadEnrolledCourses() {
    if (!this.user?.enrolledCourses?.length) return;
    // Normalize enrolledCourses to string IDs in case backend returns objects
    const enrolledIds: string[] = this.user.enrolledCourses
      .map((c: any) => typeof c === 'string' ? c : (c?._id || c?.id))
      .filter((id: any): id is string => !!id);

    const requests = enrolledIds.map(courseId =>
      this.courseService.getCourseById(courseId)
    );

    this.courseService.getRecommendations(enrolledIds).subscribe(courses => {
      this.recommendedCourses = courses;
    });

    forkJoin(requests).subscribe(courses => {
      const validCourses = courses.filter((c): c is Course => !!c);
      this.enrolledCourses = validCourses.map((course) => {
        const prog = this.userProgress.find(p => String((p as any).courseId) === String(course._id));
        console.log(`Course ${course.title}:`, {
          courseId: course._id,
          progress: prog?.progress ?? 0,
          allProgress: this.userProgress
        });
        return {
          ...course,
          progress: prog ? prog.progress : 0,
          lastAccessed: prog ? prog.lastAccessed : null,
          startDate: prog ? prog.startDate : null,
          completedLessons: prog ? (prog.completedLessons?.length || 0) : 0,
          totalLessons: prog ? (prog.totalLessons || 0) : 0
        };
      });
    });
  }

  calculateStats() {
    if (!this.userProgress.length) {
      this.overallStats = { totalCourses: 0, completedCourses: 0, averageProgress: 0 };
      return;
    }

    const total = this.userProgress.length;
    const completed = this.userProgress.filter(p => p.progress === 100).length;
    const avg = Math.round(
      this.userProgress.reduce((sum, p) => sum + p.progress, 0) / total
    );

    this.overallStats = {
      totalCourses: total,
      completedCourses: completed,
      averageProgress: avg
    };
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return 'green';
    if (progress >= 50) return 'orange';
    return 'red';
  }

  formatDate(date: string | Date | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  formatLastLogin(date: string | Date | null): string {
    if (!date) return 'Анх удаа';
    
    const now = new Date();
    const lastLogin = new Date(date);
    const diffInHours = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Саяхан';
    } else if (diffInHours < 24) {
      return `${diffInHours}ц`;
    } else if (diffInHours < 168) { // 7 хоног
      const days = Math.floor(diffInHours / 24);
      return `${days}өдөр`;
    } else {
      return lastLogin.toLocaleDateString('mn-MN', {
        month: '2-digit',
        day: '2-digit'
      });
    }
  }

  continueCourse(courseId: string) {
    this.router.navigate(['/courses', courseId]);
  }

  getCourseImageUrl(imagePath: string): string {
    return getImageUrl(imagePath);
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/images/course-placeholder.png';
  }

  getCourseStatus(progress: number): string {
    if (progress === 100) {
      return 'Дууссан';
    } else if (progress > 0) {
      return 'Үргэлжлүүлэх';
    } else {
      return 'Эхлэх';
    }
  }
}
