import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface CourseProgress {
  courseId: number;
  userId: number;
  progress: number;
  completedLessons: number[];
  totalLessons: number;
  lastAccessed: Date;
  startDate: Date;
  estimatedCompletion?: Date;
}

export interface LessonProgress {
  lessonId: number;
  courseId: number;
  userId: number;
  completed: boolean;
  completedAt?: Date;
  timeSpent: number; 
  quizScore?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private progressData: CourseProgress[] = [
    {
      courseId: 1,
      userId: 1,
      progress: 65,
      completedLessons: [1, 2, 3],
      totalLessons: 5,
      lastAccessed: new Date('2025-01-15'),
      startDate: new Date('2025-01-01'),
      estimatedCompletion: new Date('2025-02-01')
    },
    {
      courseId: 2,
      userId: 1,
      progress: 30,
      completedLessons: [1],
      totalLessons: 5,
      lastAccessed: new Date('2025-01-10'),
      startDate: new Date('2025-01-05')
    }
  ];

  private lessonProgress: LessonProgress[] = [
    {
      lessonId: 1,
      courseId: 1,
      userId: 1,
      completed: true,
      completedAt: new Date('2025-01-02'),
      timeSpent: 45,
      quizScore: 85
    },
    {
      lessonId: 2,
      courseId: 1,
      userId: 1,
      completed: true,
      completedAt: new Date('2025-01-05'),
      timeSpent: 60,
      quizScore: 90
    },
    {
      lessonId: 3,
      courseId: 1,
      userId: 1,
      completed: true,
      completedAt: new Date('2025-01-10'),
      timeSpent: 75,
      quizScore: 88
    }
  ];

  constructor() {}

  getCourseProgress(courseId: number, userId: number): Observable<CourseProgress | null> {
    const progress = this.progressData.find(p => p.courseId === courseId && p.userId === userId);
    return of(progress || null);
  }

  getUserProgress(userId: number): Observable<CourseProgress[]> {
    const userProgress = this.progressData.filter(p => p.userId === userId);
    return of(userProgress);
  }

  updateProgress(courseId: number, userId: number, lessonId: number): Observable<CourseProgress> {
    let progress = this.progressData.find(p => p.courseId === courseId && p.userId === userId);
    
    if (!progress) {
      progress = {
        courseId,
        userId,
        progress: 0,
        completedLessons: [],
        totalLessons: 5,
        lastAccessed: new Date(),
        startDate: new Date()
      };
      this.progressData.push(progress);
    }

    // Add lesson to completed lessons if not already completed
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      progress.progress = Math.round((progress.completedLessons.length / progress.totalLessons) * 100);
      progress.lastAccessed = new Date();
    }

    return of(progress);
  }

  getLessonProgress(lessonId: number, courseId: number, userId: number): Observable<LessonProgress | null> {
    const lessonProgress = this.lessonProgress.find(
      lp => lp.lessonId === lessonId && lp.courseId === courseId && lp.userId === userId
    );
    return of(lessonProgress || null);
  }

  completeLesson(lessonId: number, courseId: number, userId: number, timeSpent: number, quizScore?: number): Observable<LessonProgress> {
    let lessonProgress = this.lessonProgress.find(
      lp => lp.lessonId === lessonId && lp.courseId === courseId && lp.userId === userId
    );

    if (!lessonProgress) {
      lessonProgress = {
        lessonId,
        courseId,
        userId,
        completed: true,
        completedAt: new Date(),
        timeSpent,
        quizScore
      };
      this.lessonProgress.push(lessonProgress);
    } else {
      lessonProgress.completed = true;
      lessonProgress.completedAt = new Date();
      lessonProgress.timeSpent = timeSpent;
      if (quizScore) {
        lessonProgress.quizScore = quizScore;
      }
    }

    // Update course progress
    this.updateProgress(courseId, userId, lessonId).subscribe();

    return of(lessonProgress);
  }

  getOverallProgress(userId: number): Observable<{ totalCourses: number; completedCourses: number; averageProgress: number }> {
    const userProgress = this.progressData.filter(p => p.userId === userId);
    const totalCourses = userProgress.length;
    const completedCourses = userProgress.filter(p => p.progress === 100).length;
    const averageProgress = userProgress.length > 0 
      ? Math.round(userProgress.reduce((sum, p) => sum + p.progress, 0) / userProgress.length)
      : 0;

    return of({ totalCourses, completedCourses, averageProgress });
  }

  getRecentActivity(userId: number): Observable<CourseProgress[]> {
    const userProgress = this.progressData
      .filter(p => p.userId === userId)
      .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
      .slice(0, 5);
    
    return of(userProgress);
  }
} 