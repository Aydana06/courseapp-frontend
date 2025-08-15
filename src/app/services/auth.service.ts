import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';
import { environment } from '../../environments/environment';

export interface User {
  phone: string;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
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
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      }
    }
  }

  login(email: string, password: string): Observable<User> {
    // Use mock data in development or when API is not available
    if (environment.features.enableMockData) {
      return this.mockLogin(email, password);
    }

    const loginData: LoginRequest = { email, password };
    
    return this.apiService.post<ApiResponse<AuthResponse>>('/auth/login', loginData).pipe(
      map(response => {
        if (response.success && response.data) {
          const { user, token } = response.data;
          this.setAuthToken(token);
          this.setUser(user);
          return user;
        } else {
          throw new Error(response.message || 'Нэвтрэх үед алдаа гарлаа');
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  private mockLogin(email: string, password: string): Observable<User> {
    return new Observable(observer => {
      setTimeout(() => {
        if (email === 'bolataidana73@gmail.com' && password === 'qwerty') {
          const user: User = {
            id: 1,
            firstName: 'Bolat',
            lastName: 'Aydana',
            email: email,
            // phone: userData.phone, 
            phone: '90908990',
            name: 'Bolat Aydana',
            role: 'student',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          };
          this.setUser(user);
          observer.next(user);
          observer.complete();
        } else {
          observer.error(new Error('Нэвтрэх нэр эсвэл нууц үг буруу байна'));
        }
      }, 1000);
    });
  }

  register(userData: RegisterRequest): Observable<User> {
    // Use mock data in development or when API is not available
    if (environment.features.enableMockData) {
      return this.mockRegister(userData);
    }

    return this.apiService.post<ApiResponse<AuthResponse>>('/auth/register', userData).pipe(
      map(response => {
        if (response.success && response.data) {
          const { user, token } = response.data;
          this.setAuthToken(token);
          this.setUser(user);
          return user;
        } else {
          throw new Error(response.message || 'Бүртгэл үүсгэх үед алдаа гарлаа');
        }
      }),
      catchError(error => {
        console.error('Register error:', error);
        return throwError(() => error);
      })
    );
  }

  private mockRegister(userData: RegisterRequest): Observable<User> {
    return new Observable(observer => {
      setTimeout(() => {
        const user: User = {
          id: Date.now(),
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          email: userData.email,
          name: `${userData.firstName} ${userData.lastName}`,
          role: 'student',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        this.setUser(user);
        observer.next(user);
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
    this.currentUserSubject.next(null);
  }

  private setAuthToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_token', token);
    }
  }

  private setUser(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }

  getAuthToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  // Refresh token method
  refreshToken(): Observable<string> {
    if (environment.features.enableMockData) {
      return of('mock_refreshed_token');
    }

    return this.apiService.post<ApiResponse<{ token: string }>>('/auth/refresh', {}).pipe(
      map(response => {
        if (response.success && response.data) {
          this.setAuthToken(response.data.token);
          return response.data.token;
        } else {
          throw new Error('Token refresh failed');
        }
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  // Update user profile
  updateProfile(userData: Partial<User>): Observable<User> {
    if (environment.features.enableMockData) {
      return this.mockUpdateProfile(userData);
    }

    return this.apiService.put<ApiResponse<User>>('/auth/profile', userData).pipe(
      map(response => {
        if (response.success && response.data) {
          this.setUser(response.data);
          return response.data;
        } else {
          throw new Error(response.message || 'Профайл шинэчлэх үед алдаа гарлаа');
        }
      })
    );
  }


  private mockUpdateProfile(userData: Partial<User>): Observable<User> {
    return new Observable(observer => {
      setTimeout(() => {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          this.setUser(updatedUser);
          observer.next(updatedUser);
          observer.complete();
        } else {
          observer.error(new Error('Хэрэглэгч нэвтээгүй байна'));
        }
      }, 500);
    });
  }

  // Verify email
  verifyEmail(token: string): Observable<boolean> {
    if (environment.features.enableMockData) {
      return of(true);
    }

    return this.apiService.post<ApiResponse<boolean>>('/auth/verify-email', { token }).pipe(
      map(response => response.success && !!response.data)
    );
  }

  // Reset password
  resetPassword(email: string): Observable<boolean> {
    if (environment.features.enableMockData) {
      return of(true);
    }

    return this.apiService.post<ApiResponse<boolean>>('/auth/reset-password', { email }).pipe(
      map(response => response.success && !!response.data)
    );
  }
} 