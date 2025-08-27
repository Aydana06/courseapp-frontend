export interface User {
  phone: string;
  id: string;
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
  enrolledCourses: string[];
  progress: CourseProgress[];
  certificates: Certificate[];
  role: 'student' | 'admin'; 
}

export interface Comment {
  id?: string;
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
  role: "student" | "admin" | "instructor";
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
} 

export interface Certificate {
  id: string;
  userId?: string;
  courseId?: string;
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
  level: any;
  category: any;
  _id: string;
  title: string;
  price: number;
  image: string;
  description: string;
  duration: string;
  instructor: string;
  details?: CourseDetails[];
}
export interface CourseDetails {
  id: string;
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
} 
export interface CourseProgress {
  courseId: string;
  userId: string;
  progress: number;
  completedLessons: string[];
  totalLessons: number;
  lastAccessed: Date;
  startDate: Date;
  estimatedCompletion?: Date;
}

export interface LessonProgress {
  lessonId: string;
  courseId: string;
  userId: string;
  completed: boolean;
  completedAt?: Date;
  timeSpent: number; 
  quizScore?: number;
}


