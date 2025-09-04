import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {  Course } from '../../models/models';
import { CartService } from '../../services/cart.service';
import {CourseService  } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { LoadingComponent } from '../../components/loading/loading.component';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { getImageUrl } from '../../utils/image.utils';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingComponent],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  categories: string[] = [];
  levels: string[] = [];
  searchQuery = '';
  selectedCategory = 'all';
  selectedLevel = 'all';
  isLoading = false;
  errorMessage = '';
  isFiltering = false;
  enrolledCourses: string[] = [];
  private searchSubject = new Subject<string>();

  constructor(
    private courseService: CourseService,
    private cartService: CartService,
    public authService: AuthService,
      private router: Router
  ) {}

  addToCart(courseId: string) {
    this.cartService.addToCart(courseId);
    // Alert-ийг cart service-ийн success callback дээр шилжүүлэх
  }
  ngOnInit() {
    this.loadCourses();
    this.loadEnrolledCourses();
    
    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchQuery = searchTerm;
      this.filterCourses();
    });
  }

  loadCourses(forceRefresh: boolean = false) {
    // Хэрэв cache-тэй байгаа бол loading state харуулахгүй
    if (!forceRefresh && this.courses.length > 0) {
      console.log('Courses already loaded, skipping loading state');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    console.log('Loading courses...', 'isLoading:', this.isLoading);
    
    this.courseService.getAllCourses(forceRefresh).subscribe({
      next: (courses) => {
        console.log('Courses loaded:', courses);
        console.log('Number of courses:', courses.length);
        if (courses.length > 0) {
          console.log('First course:', courses[0]);
          console.log('First course details:', courses[0].details);
          if (courses[0].details && courses[0].details.length > 0) {
            console.log('First course first detail:', courses[0].details[0]);
          }
        }
        this.courses = courses;
        this.filteredCourses = courses;
        this.loadFilterOptions(courses);
        this.isLoading = false;
        console.log('Loading completed, isLoading:', this.isLoading);
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.errorMessage = 'Сургалтуудыг уншихад алдаа гарлаа. Дахин оролдоно уу.';
        this.isLoading = false;
        console.log('Loading error, isLoading:', this.isLoading);
      }
    });
  }

  goToCourse(_id: string) {
    this.router.navigate(['/courses', _id]);
  }

  getCourseImageUrl(imagePath: string): string {
    return getImageUrl(imagePath);
  }

loadFilterOptions(courses: Course[]) {
  this.categories = [
    ...new Set(
      courses
        .map(c => c.details?.[0]?.category)
        .filter((cat): cat is string => !!cat)
    )
  ];
  this.levels = [
    ...new Set(
      courses
        .map(c => c.details?.[0]?.level)
        .filter((lvl): lvl is string => !!lvl)
    )
  ];
}

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  onCategoryChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedCategory = target.value;
    this.filterCourses();
  }

  onLevelChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedLevel = target.value;
    this.filterCourses();
  }
filterCourses() {
  this.isFiltering = true;
  console.log('Filtering courses...');
  console.log('Total courses:', this.courses.length);
  console.log('Search query:', this.searchQuery);
  console.log('Selected category:', this.selectedCategory);
  console.log('Selected level:', this.selectedLevel);
  
  // Simulate a small delay for better UX
  setTimeout(() => {
    this.filteredCourses = this.courses.filter(course => {
      const matchesSearch =
        course.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesCategory =
        this.selectedCategory === 'all' ||
        course.details?.some(d => d.category === this.selectedCategory);

      const matchesLevel =
        this.selectedLevel === 'all' ||
        course.details?.some(d => d.level === this.selectedLevel);

      return matchesSearch && matchesCategory && matchesLevel;
    });
    
    this.isFiltering = false;
  }, 100);
}

  // Сургалтуудыг хүчээр шинэчлэх
  refreshCourses() {
    this.loadCourses(true);
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

  // Бүртгүүлсэн сургалтуудыг ачаалах
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

  // Сургалт бүртгүүлсэн эсэхийг шалгах
  isEnrolled(courseId: string): boolean {
    return this.enrolledCourses.includes(courseId);
  }
} 