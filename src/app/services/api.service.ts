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
  private readonly baseUrl = environment.apiUrl;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Алдаа гарлаа. Дахин оролдоно уу.';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Клиентийн алдаа: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Буруу хүсэлт';
          break;
        case 401:
          errorMessage = 'Нэвтрэх шаардлагатай';
          if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
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

  private setLoading(loading: boolean) {
    this.loadingSubject.next(loading);
  }

  // Generic HTTP methods
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
      retry(1),
      tap(() => this.setLoading(false)),
      catchError((error) => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }

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

  // File upload method
  uploadFile<T>(endpoint: string, file: File, additionalData?: any): Observable<T> {
    this.setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    let headers = new HttpHeaders();
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return this.http.post<T>(`${this.baseUrl}${endpoint}`, formData, {
      headers: headers
    }).pipe(
      tap(() => this.setLoading(false)),
      catchError((error) => {
        this.setLoading(false);
        return this.handleError(error);
      })
    );
  }

  // Download file method
  downloadFile(endpoint: string, filename: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${endpoint}`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }).pipe(
      tap(blob => {
        if (isPlatformBrowser(this.platformId)) {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          window.URL.revokeObjectURL(url);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Health check
  healthCheck(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`).pipe(
      catchError(this.handleError)
    );
  }
} 