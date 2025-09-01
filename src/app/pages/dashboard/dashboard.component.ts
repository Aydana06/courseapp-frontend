import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CourseService } from '../../services/course.service';
import { User, Course, CourseProgress } from '../../models/models';
import { Router } from "@angular/router";
import { forkJoin } from 'rxjs';
import { UserService } from '../../services/user.service';

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

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private courseService: CourseService,
    private router: Router
  ) {}

  ngOnInit() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.userService.getUserById(userId).subscribe(user => {
      if (!user) return;
      this.user = user;

      // хэрэглэгчийн progress array-г ашиглах
      this.userProgress = user.progress || [];

      // сургалтуудыг ачаалах
      this.loadEnrolledCourses();
      this.calculateStats();
    });
  }

  loadEnrolledCourses() {
    if (!this.user?.enrolledCourses?.length) return;
    const requests = this.user.enrolledCourses.map(courseId =>
      this.courseService.getCourseById(courseId)
    );

    this.courseService.getRecommendations(this.user.enrolledCourses).subscribe(courses => {
      this.recommendedCourses = courses;
    });

    forkJoin(requests).subscribe(courses => {
      this.enrolledCourses = courses.map((course, i) => {
        const prog = this.userProgress.find(p => p.courseId === course?._id);
        return {
          ...course,
          progress: prog ? prog.progress : 0,
          lastAccessed: prog ? prog.lastAccessed : null,
          startDate: prog ? prog.startDate : null
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

  continueCourse(courseId: string) {
    this.router.navigate(['/course', courseId]);
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/images/course-placeholder.png';
  }
}
