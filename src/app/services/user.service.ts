// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { ApiService, ApiResponse } from './api.service';
// import { User } from '../models/models';

// @Injectable({
//   providedIn: 'root'
// })
// export class UserService {
//   constructor(private apiService: ApiService) {}

//   getUsers(): Observable<User[]> {
//     return this.apiService.get<ApiResponse<User[]>>('/users');
//   }

//   getUserById(id: number): Observable<User> {
//     return this.apiService.get<ApiResponse<User>>(`/users/${id}`);
//   }

//   updateUser(id: number, userData: Partial<User>): Observable<User> {
//     return this.apiService.put<ApiResponse<User>>(`/users/${id}`, userData);
//   }
// }
