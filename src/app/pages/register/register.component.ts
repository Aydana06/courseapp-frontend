import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'student'
  };
  
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { firstName, lastName, email, password, confirmPassword, phone, role} = this.registerData;
      // Validate required fields
      if (!firstName || !lastName || !email || !password || !phone || !role) {
        this.errorMessage = 'Бүх талбарыг бөглөнө үү';
        this.isLoading = false;
        return;
      }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.errorMessage = 'Имэйлийн хаяг буруу байна';
      this.isLoading = false;
      return;
    }
    //Validate phone number format
    const phoneRegex = /^(\+976)?[0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      this.errorMessage = 'Утасны дугаар буруу байна';
      this.isLoading = false;
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      this.errorMessage = 'Нууц үгнүүд таарахгүй байна';
      this.isLoading = false;
      return;
    }
      // Validate password strength
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!strongPasswordRegex.test(password)) {
      this.errorMessage = 'Нууц үг дор хаяж 1 том үсэг, 1 тоо агуулсан байх ёстой';
      this.isLoading = false;
      return;
    }

  this.authService.register({ firstName,
    lastName,
    email,
    password,
    phone,
    role}).subscribe({
      next: (user) => {
        console.log('Registration successful:', user);
        this.successMessage = 'Бүртгэл амжилттай үүслээ!';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.errorMessage = error?.error?.message || 'Бүртгэл үүсгэхэд алдаа гарлаа';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

} 