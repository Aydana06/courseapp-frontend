import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';
import { User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private apiService: ApiService) {}

  // Бүх хэрэглэгч
  getUsers(): Observable<User[]> {
    return this.apiService.get<ApiResponse<User[]>>('/users').pipe(
      map(res => res.success && res.data ? res.data : []),
      catchError(() => of([]))
    );
  }

  // Нэг хэрэглэгч (ID-аар)
  getUserById(id: string): Observable<User | null> {
    return this.apiService.get<ApiResponse<User>>(`/users/${id}`).pipe(
      map(res => res.success && res.data ? res.data : null),
      catchError(() => of(null))
    );
  }

  // Хэрэглэгч засварлах
  updateUser(id: string, userData: Partial<User>): Observable<User | null> {
    return this.apiService.put<ApiResponse<User>>(`/users/${id}`, userData).pipe(
      map(res => res.success && res.data ? res.data : null),
      catchError(() => of(null))
    );
  }
}
