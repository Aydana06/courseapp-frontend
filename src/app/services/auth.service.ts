import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';
import { LoginRequest, RegisterRequest, User } from '../models/models'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly accessTokenKey = 'auth_token';
  private readonly userKey = 'user';
  private API = 'http://localhost:5000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private apiService: ApiService
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem(this.userKey);
      if (userData) {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      }
    }
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<User> {
    const loginData: LoginRequest = { email, password };
  
    return this.apiService.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/login', loginData).pipe(
      map(response => {
        if (response.success && response.data) {
          const { user, accessToken } = response.data;  
          const mappedUser = { ...user, id: (user as any)._id }; 
          
          // 📌 LocalStorage дээр хадгална
          this.setAuthToken(accessToken);
          this.setUser(mappedUser);

          return mappedUser;
        }
        throw new Error(response.message || 'Нэвтрэх үед алдаа гарлаа');
      }),
      catchError(err => throwError(() => err))
    );
  }

  register(userData: RegisterRequest): Observable<User> {
    return this.apiService.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/register',
      userData
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          const { user, token } = response.data;
          const mappedUser = { ...user, id: (user as any)._id };

          // 📌 LocalStorage дээр хадгална
          this.setAuthToken(token);
          this.setUser(mappedUser);

          return mappedUser;
        }
        throw new Error(response.message || 'Бүртгэл үүсгэх үед алдаа гарлаа');
      }),
      catchError(err => throwError(() => err))
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.userKey);
      localStorage.removeItem(this.accessTokenKey);
      localStorage.removeItem('refresh_token');
    }
    this.currentUserSubject.next(null);
  }

  private setAuthToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.accessTokenKey, token);
    }
  }

  private setUser(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }

  getAuthToken(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem(this.accessTokenKey) : null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  refreshToken(): Observable<string> {
    return this.apiService.post<ApiResponse<{ token: string }>>('/auth/refresh', {}).pipe(
      map(response => {
        if (response.success && response.data) {
          // 📌 Refresh дараа шинэ токен хадгална
          this.setAuthToken(response.data.token);
          return response.data.token;
        }
        throw new Error('Token refresh failed');
      }),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    return this.apiService.put<ApiResponse<User>>('/auth/profile', userData).pipe(
      map(response => {
        if (response.success && response.data) {
          const mappedUser = { ...response.data, id: (response.data as any)._id };

          // 📌 LocalStorage дээр хадгална
          this.setUser(mappedUser);

          return mappedUser;
        }
        throw new Error(response.message || 'Профайл шинэчлэх үед алдаа гарлаа');
      }),
      catchError(err => throwError(() => err))
    );
  }

  verifyEmail(token: string): Observable<boolean> {
    return this.apiService.post<ApiResponse<boolean>>('/auth/verify-email', { token }).pipe(
      map(response => response.success && !!response.data),
      catchError(err => throwError(() => err))
    );
  }

  resetPassword(email: string): Observable<boolean> {
    return this.apiService.post<ApiResponse<boolean>>('/auth/reset-password', { email }).pipe(
      map(response => response.success && !!response.data),
      catchError(err => throwError(() => err))
    );
  }
}
