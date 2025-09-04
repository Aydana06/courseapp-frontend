import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { instructorGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'cart',  loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent) },
  { path: 'courses', loadComponent: () => import('./pages/courses/courses.component').then(m => m.CoursesComponent) },
  { path: 'courses/:_id', loadComponent: () => import('./pages/course-detail/course-detail.component').then(m => m.CourseDetailComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),  canActivate: [authGuard, () => import('./guards/role.guard').then(m => m.roleGuard(['student']))] },
  { path: 'profile', loadComponent: () => import('./pages/user-profile/user-profile.component').then(m => m.UserProfileComponent) },
  { path: 'checkout', loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent) },
  
  // Admin/Instructor routes
  { path: 'admin', loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent), canActivate: [instructorGuard] },
  { path: 'create-course', loadComponent: () => import('./pages/create-course/create-course.component').then(m => m.CreateCourseComponent), canActivate: [instructorGuard] },
  { path: 'edit-course/:id', loadComponent: () => import('./pages/edit-course/edit-course.component').then(m => m.EditCourseComponent), canActivate: [instructorGuard] },
  
  { path: '**', redirectTo: '/home' },
  
];
