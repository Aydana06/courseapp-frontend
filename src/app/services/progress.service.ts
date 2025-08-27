import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { CourseProgress, LessonProgress } from '../models/models';
import { ApiService, ApiResponse } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {

  constructor(private apiService: ApiService) {}

  getCourseProgress(courseId: string, userId: string): Observable<CourseProgress | null> {
    return this.apiService.get<ApiResponse<CourseProgress>>(`/progress/user/${userId}/course/${courseId}`).pipe(
      map(res => res.success && res.data ? res.data : null)
    );  
  }

  getUserProgress(userId: string): Observable<CourseProgress[]> {
    return this.apiService.get<ApiResponse<CourseProgress[]>>(`/progress/user`).pipe(
      map(res => res.success && res.data ? res.data : [])
    );
  }

  updateProgress(courseId: string, userId: string, lessonId: string): Observable<CourseProgress> {
    return this.apiService.post<ApiResponse<CourseProgress>>(`/progress/update`, { courseId, lessonId }).pipe(
      map(res => res.data!)
    );
  }

  completeLesson(courseId: string, lessonId: string, userId: string, timeSpent: number, quizScore?: number): Observable<LessonProgress> {
    return this.apiService.post<ApiResponse<LessonProgress>>(`/progress/lesson/complete`, { courseId, lessonId, timeSpent, quizScore }).pipe(
      map(res => res.data!)
    );
  }

  getLessonProgress(lessonId: string, courseId: string, userId: string): Observable<LessonProgress | null> {
    return this.apiService.get<ApiResponse<LessonProgress>>(`/progress/lesson/${lessonId}?courseId=${courseId}`).pipe(
      map(res => res.success && res.data ? res.data : null)
    );
  }

  getOverallProgress(userId: string): Observable<{ totalCourses: number; completedCourses: number; averageProgress: number }> {
    return this.getUserProgress(userId).pipe(
      map(progressList => {
        const totalCourses = progressList.length;
        const completedCourses = progressList.filter(p => p.progress === 100).length;
        const averageProgress = totalCourses ? Math.round(progressList.reduce((sum, p) => sum + p.progress, 0) / totalCourses) : 0;
        return { totalCourses, completedCourses, averageProgress };
      })
    );
  }

  getRecentActivity(userId: string): Observable<CourseProgress[]> {
    return this.getUserProgress(userId).pipe(
      map(progressList => progressList
        .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
        .slice(0, 5)
      )
    );
  }
}
