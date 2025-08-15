import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get the auth token
  const authToken = authService.getAuthToken();

  // Clone the request and add the authorization header if token exists
  let authReq = req;
  if (authToken && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authToken}`)
    });
  }

  // Add common headers
  authReq = authReq.clone({
    headers: authReq.headers
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
  });

  // Handle the request and catch errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired or invalid, logout user
        authService.logout();
        router.navigate(['/login']);
      } else if (error.status === 403) {
        // Forbidden - insufficient permissions
        console.error('Access denied:', error);
      } else if (error.status === 500) {
        // Server error
        console.error('Server error:', error);
      }

      return throwError(() => error);
    })
  );
}; 