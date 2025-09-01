import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';
import { Course, SearchFilters } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor(private apiService: ApiService) {}

  // Бүх курс авах
  getAllCourses(): Observable<Course[]> {
    return this.apiService.get<ApiResponse<Course[]>>('/courses').pipe(
      map(res => res.success && res.data ? res.data : []),
      catchError(() => of([]))
    );
  }

  // MaxId хүртэлх курс авах
  getCoursesUpToId(maxId: string): Observable<Course[]> {
    return this.apiService.get<ApiResponse<Course[]>>(`/courses?maxId=${maxId}`).pipe(
      map(res => res.success && res.data ? res.data : []),
      catchError(() => of([]))
    );
  }

  // ID-аар курс авах
  getCourseById(id: string): Observable<Course | null> {
    return this.apiService.get<ApiResponse<Course>>(`/courses/${id}`).pipe(
      map(res => (res.success && res.data ? res.data : null)),  // зөвхөн data-г буцаана
      catchError(() => of(null))
    );
  }

  // Featured Courses
  getFeaturedCourses(): Observable<Course[]> {
    return this.apiService.get<ApiResponse<Course[]>>('/courses/featured').pipe(
      map(res => res.success && res.data ? res.data : []),
      catchError(() => of([]))
    );
  }

  getRecommendations(enrolledCourses: string[]): Observable<Course[]> {
  return this.getAllCourses().pipe(
    map(courses =>
      courses.filter(course => !enrolledCourses.includes(course._id))
    ),
    catchError(() => of([]))
  );
}

}
