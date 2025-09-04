import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';
import { CourseProgress } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private cache: CourseProgress[] | null = null;
  private lastFetchTime = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 мин
  private readonly STORAGE_KEY_PREFIX = 'progress_cache_v1_';

  constructor(private api: ApiService) {}

  private storageKeyFor(userId?: string | null): string {
    return `${this.STORAGE_KEY_PREFIX}${userId || 'anon'}`;
  }

  private saveToStorage(userId: string, data: CourseProgress[]) {
    try {
      localStorage.setItem(this.storageKeyFor(userId), JSON.stringify({ data, ts: Date.now() }));
    } catch {}
  }

  private loadFromStorage(userId: string): CourseProgress[] | null {
    try {
      const raw = localStorage.getItem(this.storageKeyFor(userId));
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { data: CourseProgress[]; ts: number };
      if (Date.now() - parsed.ts < this.CACHE_DURATION) return parsed.data;
      return null;
    } catch {
      return null;
    }
  }

  getUserProgress(userId?: string | null, forceRefresh = false): Observable<CourseProgress[]> {
    const now = Date.now();
    if (!forceRefresh && this.cache && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      return of(this.cache);
    }

    if (!forceRefresh && userId) {
      const stored = this.loadFromStorage(userId);
      if (stored) {
        this.cache = stored;
        this.lastFetchTime = now;
        return of(stored);
      }
    }

    return this.api.get<ApiResponse<CourseProgress[]>>('/progress/user').pipe(
      map(res => (res.success && res.data ? (res.data as any) : [])),
      tap(list => {
        this.cache = list;
        this.lastFetchTime = now;
        if (userId) this.saveToStorage(userId, list);
      }),
      catchError(() => of(this.cache || []))
    );
  }

  getProgressForCourse(userId: string, courseId: string): Observable<CourseProgress | null> {
    // try cache first
    if (this.cache) {
      const found = this.cache.find(p => String((p as any).courseId) === String(courseId));
      if (found) return of(found);
    }
    return this.api.get<ApiResponse<CourseProgress>>(`/progress/user/${userId}/course/${courseId}`).pipe(
      map(res => (res.success && res.data ? (res.data as any) : null)),
      tap(pg => {
        if (pg) {
          // upsert into cache
          const others = (this.cache || []).filter(p => String((p as any).courseId) !== String(courseId));
          this.cache = [...others, pg];
          this.lastFetchTime = Date.now();
          this.saveToStorage(userId, this.cache);
        }
      }),
      catchError(() => of(null))
    );
  }

  markLessonComplete(courseId: string, lessonId: number): Observable<CourseProgress | null> {
    return this.api.post<ApiResponse<CourseProgress>>('/progress/update', { courseId, lessonId }).pipe(
      map(res => (res.success && res.data ? (res.data as any) : null)),
      tap(pg => {
        if (pg) {
          const others = (this.cache || []).filter(p => String((p as any).courseId) !== String(courseId));
          this.cache = [...others, pg];
          this.lastFetchTime = Date.now();
          // userId unknown here; rely on existing cached key if any
          // best-effort: store under last used key if available in localStorage via /progress/user call
        }
      }),
      catchError(() => of(null))
    );
  }
}


