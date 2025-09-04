import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl; // API үндсэн URL
  private loadingSubject = new BehaviorSubject<boolean>(false); // Loading төлөв хадгалах
  public loading$ = this.loadingSubject.asObservable(); // Component-үүдэд ажиглагдах loading stream

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object // SSR эсвэл browser дээр ажиллаж байгааг шалгах
  ) {}

  // LocalStorage-с JWT token авах
  getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Header үүсгэх (Authorization Bearer token + Content-Type)
  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // зөвхөн browser дээр localStorage ажиллана
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

// Алдаа боловсруулах
private handleError(error: HttpErrorResponse) {
  let errorMessage = 'Алдаа гарлаа. Дахин оролдоно уу.';

  if (error.status === 0) {
    // Client-side эсвэл network алдаа
    errorMessage = 'Сүлжээ эсвэл клиент талын алдаа гарлаа.';
  } else {
    // Сервер талын алдаа
    switch (error.status) {
      case 400:
        errorMessage = error.error?.message || 'Буруу хүсэлт';
        break;
      case 401:
        errorMessage = 'Нэвтрэх шаардлагатай';
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          localStorage.removeItem('refresh_token');
        }
        break;
      case 403:
        errorMessage = 'Хандах эрхгүй';
        break;
      case 404:
        errorMessage = 'Өгөгдөл олдсонгүй';
        break;
      case 500:
        errorMessage = 'Серверийн алдаа';
        break;
      default:
        errorMessage = error.error?.message || `Алдаа: ${error.status}`;
    }
  }

  console.error('API Error:', error);
  return throwError(() => new Error(errorMessage));
}

  // Loading төлөв шинэчлэх
  private setLoading(loading: boolean) {
    this.loadingSubject.next(loading);
  }

  // ------------ HTTP METHODS ------------
  
  // GET хүсэлт
  get<T>(endpoint: string, params?: any): Observable<T> {
    this.setLoading(true);
    
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http.get<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getAuthHeaders(),
      params: httpParams
    }).pipe(
      retry(1), // нэг удаа автоматаар дахин оролдоно
      tap(() => this.setLoading(false)),
      catchError((error) => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }

  // POST хүсэлт
  post<T>(endpoint: string, data: any): Observable<T> {
    this.setLoading(true);
    
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => this.setLoading(false)),
      catchError((error) => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }

  // PUT хүсэлт (бүхэлд нь шинэчлэх)
  put<T>(endpoint: string, data: any): Observable<T> {
    this.setLoading(true);
    
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => this.setLoading(false)),
      catchError((error) => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }

  // PATCH хүсэлт (зарим хэсгийг шинэчлэх)
  patch<T>(endpoint: string, data: any): Observable<T> {
    this.setLoading(true);
    
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => this.setLoading(false)),
      catchError((error) => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }

  // DELETE хүсэлт
  delete<T>(endpoint: string): Observable<T> {
    this.setLoading(true);
    
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => this.setLoading(false)),
      catchError((error) => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }
  
  // Health check endpoint шалгах
  healthCheck(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`).pipe(
      catchError(this.handleError)
    );
  }
}
