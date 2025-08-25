export interface User {
  phone: string;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  name: string;
  bio?: string;
   preferences?: {
    language: string;
    notifications: boolean;
    newsletter: boolean;
  };
  avatar?: string;
  createdAt?: string;
  lastLoginAt?: string;
  enrolledCourses: number[];
  progress: CourseProgress[];
  certificates: Certificate[];
role: 'student';
}

export interface Comment {
  id?: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  userId?: string; 
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
} export interface Certificate {
  id: string;
  userId?: number;
  courseId?: number;
  courseName?: string;
  userName?: string;
  issueDate?: Date;
  completionDate?: Date;
  grade?: string;
  certificateUrl?: string;
  status?: 'pending' | 'issued' | 'expired';
}

export interface CertificateTemplate {
  id: string;
  name: string;
  template: string;
  backgroundImage?: string;
  signatureImage?: string;
} 
export interface Course {
  id: number;
  title: string;
  price: number;
  image: string;
  description: string;
  duration: string;
  instructor: string;
  details?: CourseDetails[];
}
export interface CourseDetails {
  level?: string;
  category?: string;
  rating?: number;
  students?: number;
  lessons?: Lesson[];
  requirements?: string[];
  outcomes?: string[];
  tags?: string[];
  language?: string;
  lastUpdated?: string;
}

export interface Lesson {
  title: string;
  duration: string;
  type: string;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  level?: string;
  priceRange?: { min: number; max: number };
  rating?: number;
  language?: string;
  instructor?: string;
} export interface CourseProgress {
  courseId: number;
  userId: number;
  progress: number;
  completedLessons: number[];
  totalLessons: number;
  lastAccessed: Date;
  startDate: Date;
  estimatedCompletion?: Date;
}

export interface LessonProgress {
  lessonId: number;
  courseId: number;
  userId: number;
  completed: boolean;
  completedAt?: Date;
  timeSpent: number; 
  quizScore?: number;
}


