import { Injectable } from '@angular/core';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';
import { Course, SearchFilters } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private coursesCache: Course[] | null = null;
  private coursesSubject = new BehaviorSubject<Course[]>([]);
  public courses$ = this.coursesSubject.asObservable();
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly STORAGE_KEY = 'courses_cache_v1';

  constructor(private apiService: ApiService) {}

  // Бүх курс авах
  getAllCourses(forceRefresh: boolean = false): Observable<Course[]> {
    const now = Date.now();
    
    // Cache-тэй байгаа бол cache-ээс буцаах
    if (!forceRefresh && this.coursesCache && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      console.log('Returning courses from cache');
      return of(this.coursesCache);
    }

    // LocalStorage-д хадгалсан cache-г шалгах
    if (!forceRefresh && !this.coursesCache) {
      const stored = this.loadCacheFromStorage();
      if (stored) {
        this.coursesCache = stored.courses;
        this.lastFetchTime = stored.timestamp;
        this.coursesSubject.next(stored.courses);
        console.log('Returning courses from localStorage cache');
        return of(stored.courses);
      }
    }

    // API-аас шинэ мэдээлэл авах
    console.log('Fetching courses from API');
    return this.apiService.get<ApiResponse<Course[]>>('/courses').pipe(
      map(res => res.success && res.data ? res.data : []),
      tap(courses => {
        this.coursesCache = courses;
        this.lastFetchTime = now;
        this.coursesSubject.next(courses);
        this.saveCacheToStorage(courses, now);
        console.log('Courses cached and updated');
      }),
      catchError(() => {
        // API алдаа гарвал cache-ээс буцаах
        if (this.coursesCache) {
          console.log('API error, returning cached courses');
          return of(this.coursesCache);
        }
        const stored = this.loadCacheFromStorage();
        if (stored) {
          console.log('API error, returning localStorage cached courses');
          return of(stored.courses);
        }
        return of([]);
      })
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
    // Эхлээд memory cache болон localStorage-д байгаа эсэхийг шалгах
    const cached = this.getCourseFromCacheById(id);
    if (cached) {
      return of(cached);
    }

    // Хэрэв жагсаалтын cache байхгүй бол жагсаалтыг татах (энэ нь дараагийн дуудлагуудыг хурдасгана)
    // Тэгээд олдвол шууд буцаах, эс бөгөөс API-аас ганцаар нь татах
    const list$ = this.getAllCourses();
    return list$.pipe(
      map(listCourse => {
        const found = Array.isArray(listCourse)
          ? listCourse.find(c => c._id === id) || null
          : null;
        return found;
      }),
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

  // Шинэ курс үүсгэх (admin/instructor эрхтэй)
  createCourse(courseData: Partial<Course>): Observable<Course> {
    return this.apiService.post<ApiResponse<Course>>('/courses', courseData).pipe(
      map(res => {
        if (res.success && res.data) {
          this.clearCache(); // Cache цэвэрлэх
          return res.data;
        }
        throw new Error(res.message || 'Сургалт үүсгэхэд алдаа гарлаа');
      }),
      catchError(() => throwError(() => new Error('Сургалт үүсгэхэд алдаа гарлаа')))
    );
  }

  // Курс шинэчлэх (admin/instructor эрхтэй)
  updateCourse(courseId: string, courseData: Partial<Course>): Observable<Course> {
    return this.apiService.put<ApiResponse<Course>>(`/courses/${courseId}`, courseData).pipe(
      map(res => {
        if (res.success && res.data) {
          this.clearCache(); // Cache цэвэрлэх
          return res.data;
        }
        throw new Error(res.message || 'Сургалт шинэчлэхэд алдаа гарлаа');
      }),
      catchError(() => throwError(() => new Error('Сургалт шинэчлэхэд алдаа гарлаа')))
    );
  }

  // Курс устгах (admin эрхтэй)
  deleteCourse(courseId: string): Observable<boolean> {
    return this.apiService.delete<ApiResponse<boolean>>(`/courses/${courseId}`).pipe(
      map(res => {
        if (res.success) {
          this.clearCache(); // Cache цэвэрлэх
        }
        return res.success;
      }),
      catchError(() => of(false))
    );
  }

  // Cache цэвэрлэх
  private clearCache(): void {
    this.coursesCache = null;
    this.lastFetchTime = 0;
    console.log('Courses cache cleared');
  }

  // Cache-ийг хүчээр шинэчлэх
  refreshCourses(): Observable<Course[]> {
    return this.getAllCourses(true);
  }

  // ---------------- LocalStorage helpers ----------------
  private saveCacheToStorage(courses: Course[], timestamp: number): void {
    try {
      const payload = JSON.stringify({ courses, timestamp });
      localStorage.setItem(this.STORAGE_KEY, payload);
    } catch (_) {
      // storage дүүрсэн эсвэл SSR үед алдаа гарахаас сэргийлнэ
    }
  }

  private loadCacheFromStorage(): { courses: Course[]; timestamp: number } | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { courses: Course[]; timestamp: number };
      const now = Date.now();
      if (parsed && parsed.courses && (now - parsed.timestamp) < this.CACHE_DURATION) {
        return parsed;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  private getCourseFromCacheById(id: string): Course | null {
    // memory cache
    if (this.coursesCache) {
      const found = this.coursesCache.find(c => c._id === id);
      if (found) return found;
    }
    // storage cache
    const stored = this.loadCacheFromStorage();
    if (stored) {
      const found = stored.courses.find(c => c._id === id) || null;
      if (found) return found;
    }
    return null;
  }

}
