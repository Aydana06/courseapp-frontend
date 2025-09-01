import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';
import { LoginRequest, RegisterRequest, User } from '../models/models';
import { jwtDecode } from 'jwt-decode';


export interface JwtPayload {
  sub: string;        // userId
  role: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  exp?: number;       // хугацаа дуусах
}
@Injectable({ 
  providedIn: 'root'
})

export class AuthService {
  private readonly accessTokenKey = 'auth_token';
  private readonly userKey = 'user';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();


  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private apiService: ApiService
  ) {
    this.loadUserFromStorage();
  }

    // Token хадгалах
  setToken(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.accessTokenKey, token);
    }
  }

  // Token авах
  getToken(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem(this.accessTokenKey) : null;
  }

  // JWT decode хийж user авах
  getCurrentUser(): JwtPayload | null {
  const token = this.getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      this.logout();
      return null;
    }
    return decoded;
    } catch (err) {
      console.error('Invalid token:', err);
      return null;
    }
  }

  // Зөвхөн хэрэглэгчийн ID авах
  getUserId(): string | null {
    const user = this.getCurrentUser();
    return user?.sub || null;
  }
  get token(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  get decoded(): JwtPayload | null {
    if (!this.token) return null;
    try {
      return jwtDecode<JwtPayload>(this.token);
    } catch {
      return null;
    }
  }
    get userId(): string | null {
    return this.decoded?.sub ?? null;
  }

  get role(): string | null {
    return this.decoded?.role ?? null;
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
          
          // LocalStorage дээр хадгална
          this.setToken(accessToken);
          this.setUser(mappedUser);

          return mappedUser;
        }
        throw new Error(response.message || 'Нэвтрэх үед алдаа гарлаа');
      }),
      catchError(err => throwError(() => err))
    );
  }

  register(userData: RegisterRequest): Observable<User> {
    return this.apiService.post<ApiResponse<{ user: User; accessToken: string }>>(
      '/auth/register',
      userData
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          const { user, accessToken } = response.data;
          const mappedUser = { ...user, id: (user as any)._id };

          // LocalStorage дээр хадгална
          this.setToken(accessToken);
          this.setUser(mappedUser);

          return mappedUser;
        }
        throw new Error(response.message || 'Бүртгэл үүсгэх үед алдаа гарлаа');
      }),
      catchError(err => throwError(() => err))
    );
  }

  refreshToken(): Observable<string> {
    return this.apiService.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', {}).pipe(
      map(response => {
        if (response.success && response.data) {
          // Refresh дараа шинэ токен хадгална
          this.setToken(response.data.accessToken);
          return response.data.accessToken;
        }
        throw new Error('Token refresh failed');
      }),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
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

  private setUser(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }


  updateProfile(userData: Partial<User>): Observable<User> {
    return this.apiService.put<ApiResponse<User>>('/auth/profile', userData).pipe(
      map(response => {
        if (response.success && response.data) {
          const mappedUser = { ...response.data, id: (response.data as any)._id };

          //  LocalStorage дээр хадгална
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
