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
    phone: ''
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

    // Validate required fields
    if (!this.registerData.firstName || !this.registerData.lastName || !this.registerData.email || !this.registerData.password || !this.registerData.phone) {
      this.errorMessage = 'Бүх талбарыг бөглөнө үү';
      this.isLoading = false;
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) {
      this.errorMessage = 'Имэйлийн хаяг буруу байна';
      this.isLoading = false;
      return;
    }
    //Validate phone number format
    const phoneRegex = /^(?:\+976)?\d{8}$/;
    if (!phoneRegex.test(this.registerData.phone)) {
      this.errorMessage = 'Утасны дугаар буруу байна';
      this.isLoading = false;
      return;
    }

    // Validate passwords match
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Нууц үгнүүд таарахгүй байна';
      this.isLoading = false;
      return;
    }

    // Validate password strength
    if (this.registerData.password.length < 6) {
      this.errorMessage = 'Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой';
      this.isLoading = false;
      return;
    }

      this.authService.register(this.registerData)
    .subscribe({
      next: (user) => {
        console.log('Registration successful:', user);
        this.successMessage = 'Бүртгэл амжилттай үүслээ!';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.errorMessage = error.message || 'Бүртгэл үүсгэхэд алдаа гарлаа';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
} 