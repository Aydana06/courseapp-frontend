import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Хэрэглэгч нэвтрээгүй бол login хуудас руу шилжүүлэх
    if (!authService.isAuthenticated()) {
      router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    // Хэрэглэгчийн эрхийг шалгах
    const userRole = authService.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Эрхгүй бол dashboard руу шилжүүлэх
      router.navigate(['/dashboard']);
      return false;
    }

    return true;
  };
};

// Admin эрхтэй хэрэглэгчдэд зориулсан guard
export const adminGuard: CanActivateFn = roleGuard(['admin']);

// Instructor эсвэл admin эрхтэй хэрэглэгчдэд зориулсан guard
export const instructorGuard: CanActivateFn = roleGuard(['instructor', 'admin']);
