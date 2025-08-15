import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  isEditing = false;
  profileData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    preferences: {
      language: 'Монгол',
      notifications: true,
      newsletter: false
    }
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
        this.loadProfileData();
      }
    });
  }

  loadProfileData() {
    if (this.user) {
      this.profileData = {
        firstName: this.user.firstName || '',
        lastName: this.user.lastName || '',
        email: this.user.email || '',
        phone: this.user.phone || '',
        bio: '',
        preferences: {
          language: 'Монгол',
          notifications: true,
          newsletter: false
        }
      };
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  saveProfile() {
    if (this.user) {
      const updatedUser: Partial<User> = {
        firstName: this.profileData.firstName,
        lastName: this.profileData.lastName,
        phone: this.profileData.phone,
        email: this.profileData.email,
        name: `${this.profileData.firstName} ${this.profileData.lastName}`
      };

      this.authService.updateProfile(updatedUser).subscribe({
        next: (user) => {
          this.user = user;
          alert('Профайл амжилттай шинэчлэгдлээ!');
          this.isEditing = false;
        },
        error: (error) => {
          console.error('Profile update error:', error);
          alert('Профайл шинэчлэхэд алдаа гарлаа');
        }
      });
    }
  }
  cancelEdit() {
    this.loadProfileData();
    this.isEditing = false;
  }
} 