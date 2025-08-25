import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';
import { Comment } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private baseUrl = '/comments';

  constructor(private apiService: ApiService) {}

  // бүх коммент авах
  getComments(): Observable<Comment[]> {
    return this.apiService.get<ApiResponse<Comment[]>>(this.baseUrl).pipe(
      map(res => res.data || [])
    );
  }

  // нэг коммент авах
  getComment(id: number): Observable<Comment | undefined> {
    return this.apiService.get<ApiResponse<Comment>>(`${this.baseUrl}/${id}`).pipe(
      map(res => res.data)
    );
  }

  // коммент нэмэх
  addComment(comment: Comment): Observable<Comment | undefined> {
    return this.apiService.post<ApiResponse<Comment>>(this.baseUrl, comment).pipe(
      map(res => res.data)
    );
  }

  // коммент засах
  updateComment(id: number, comment: Partial<Comment>): Observable<Comment | undefined> {
    return this.apiService.put<ApiResponse<Comment>>(`${this.baseUrl}/${id}`, comment).pipe(
      map(res => res.data)
    );
  }

  // коммент устгах
  deleteComment(id: number): Observable<Comment | undefined> {
    return this.apiService.delete<ApiResponse<Comment>>(`${this.baseUrl}/${id}`).pipe(
      map(res => res.data)
    );
  }
}