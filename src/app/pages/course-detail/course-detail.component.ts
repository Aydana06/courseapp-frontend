import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { Course } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { CommentComponent } from '../../components/comments/comments.component';
import { CartService } from '../../services/cart.service';
import { getImageUrl } from '../../utils/image.utils';
import { ProgressService } from '../../services/progress.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CommentComponent],
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css']
})
export class CourseDetailComponent implements OnInit {
  course: Course | null = null;
  isLoading = false;
  errorMessage = '';
  completedLessonIds = new Set<number>();
  currentProgressPercent = 0;
  isEnrolled = false;
  private currentUserId: string | null = null;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private courseService: CourseService,
    public authService: AuthService,
    private cartService: CartService,
    private progressService: ProgressService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('_id');
      console.log('Course ID from route:', id);
      if (id) {
        this.isLoading = true;
        this.errorMessage = '';
        console.log('Fetching course with ID:', id);
        this.courseService.getCourseById(id).subscribe({
          next: (course) => {
            console.log('Course response:', course);
            if (course) {
              this.course = course;
              console.log('Course set successfully:', this.course);
              this.checkEnrollmentAndProgress();
            } else {
              console.log('No course found with ID:', id);
              this.errorMessage = 'Сургалт олдсонгүй';
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error fetching course:', error);
            this.errorMessage = 'Сургалтыг уншихад алдаа гарлаа';
            this.isLoading = false;
          }
        });
      } else {
        console.log('No course ID found in route');
        this.errorMessage = 'Сургалтын ID олдсонгүй';
      }
    });
  }

  private checkEnrollmentAndProgress() {
    if (!this.course || !this.authService.isLoggedIn()) return;
    const userId = this.authService.getUserId();
    this.currentUserId = userId;
    if (!userId) return;
    const uid = userId as string;
    // Check enrollment
    this.userService.getUserById(userId).subscribe(user => {
      const enrolledIds: string[] = (user?.enrolledCourses || []).map((c: any) => typeof c === 'string' ? c : (c?._id || c?.id));
      const courseId = this.course ? this.course._id : null;
      this.isEnrolled = !!courseId && enrolledIds.includes(courseId);
      // Load progress only for enrolled users
      if (this.isEnrolled && courseId) {
        this.progressService.getProgressForCourse(uid, courseId).subscribe(pg => {
          if (pg) {
            (pg.completedLessons || []).forEach((lid: any) => this.completedLessonIds.add(Number(lid)));
            this.currentProgressPercent = pg.progress || 0;
          }
        });
      }
    });
  }

  addToCart(courseId: string) {
    this.cartService.addToCart(courseId);
    alert(`Cагсанд амжилттай нэмэгдлээ!`);
  }

  toggleLessonComplete(lessonIndex: number) {
    if (!this.course || !this.isEnrolled) return;
    const lessonId = lessonIndex + 1; // backend lessons have numeric ids 1..n or index-based
    if (this.completedLessonIds.has(lessonId)) {
      // Optional: support uncheck later; for now, ignore uncheck to keep backend simple
      return;
    }
    this.progressService.markLessonComplete(this.course._id, lessonId).subscribe(updated => {
      if (updated) {
        this.completedLessonIds.add(lessonId);
        this.currentProgressPercent = updated.progress || 0;
      }
    });
  }

  goBack() {
    this.router.navigate(['/courses']);
  }

  getCourseImageUrl(imagePath: string): string {
    return getImageUrl(imagePath);
  }

  // Admin/Instructor эрх шалгах
  isAdminOrInstructor(): boolean {
    const role = this.authService.role;
    return role === 'admin' || role === 'instructor';
  }

  isAdmin(): boolean {
    return this.authService.role === 'admin';
  }

  // Сургалт засах
  editCourse(courseId: string) {
    this.router.navigate(['/edit-course', courseId]);
  }

  // Сургалт устгах
  deleteCourse(courseId: string) {
    if (confirm('Энэ сургалтыг устгахдаа итгэлтэй байна уу?')) {
      this.courseService.deleteCourse(courseId).subscribe({
        next: (success) => {
          if (success) {
            alert('Сургалт амжилттай устгагдлаа');
            this.router.navigate(['/courses']);
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
}
