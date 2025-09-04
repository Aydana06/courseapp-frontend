import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';
import { Comment } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private baseUrl = '/comments';

  constructor(private apiService: ApiService) {}

  // Бүх коммент авах (сонголтоор courseId, limit)
  getComments(courseId?: string, limit?: number): Observable<Comment[]> {
    const params: any = {};
    if (courseId) params.courseId = courseId;
    if (limit) params.limit = limit;
    return this.apiService.get<ApiResponse<Comment[]>>(this.baseUrl, params).pipe(
      map(res => res.success && res.data ? res.data : []),
      catchError(() => of([]))
    );
  }

  // Нэг коммент авах
  getComment(id: string): Observable<Comment | undefined> {
    return this.apiService.get<ApiResponse<Comment>>(`${this.baseUrl}/${id}`).pipe(
      map(res => res.success && res.data ? res.data : undefined),
      catchError(() => of(undefined))
    );
  }

  // Коммент нэмэх (courseId заавал эсвэл сонголтоор)
  addComment(comment: Partial<Comment> & { courseId?: string }): Observable<Comment | undefined> {
    return this.apiService.post<ApiResponse<Comment>>(this.baseUrl, comment).pipe(
      map(res => res.success && res.data ? res.data : undefined),
      catchError(() => of(undefined))
    );
  }

  // Коммент устгах
  deleteComment(id: string): Observable<boolean> {
    return this.apiService.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`).pipe(
      map(res => res.success),
      catchError(() => of(false))
    );
  }
}
