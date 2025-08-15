import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';
import { environment } from '../../environments/environment';

export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  duration: string;
  level: string;
  category: string;
  image: string;
  instructor: string;
  rating: number;
  students: number;
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

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor(private apiService: ApiService) {}

  private courses: Course[] = [
    {
      id: 1,
      title: 'Angular 20-р хувилбар',
      description: 'Angular-ийн хамгийн сүүлийн үеийн онцлогуудыг сурна уу. Components, Services, Routing, Forms, HTTP Client зэргийг дэлгэрэнгүй.',
      price: 150000,
      duration: '20 цаг',
      level: 'Дунд',
      category: 'Frontend',
      image: 'assets/images/angular.png',
      instructor: 'Бат-Эрдэнэ',
      rating: 4.8,
      students: 245,
      language: 'Монгол',
      lastUpdated: '2025-01-15',
      tags: ['Angular', 'TypeScript', 'Frontend', 'Web Development'],
      lessons: [
        { title: 'Angular-ийн үндэс', duration: '45 мин', type: 'video' },
        { title: 'Components болон Templates', duration: '60 мин', type: 'video' },
        { title: 'Services болон Dependency Injection', duration: '75 мин', type: 'video' },
        { title: 'Routing болон Navigation', duration: '90 мин', type: 'video' },
        { title: 'Forms болон Validation', duration: '120 мин', type: 'video' }
      ],
      requirements: [
        'JavaScript-ийн үндсэн мэдлэг',
        'HTML/CSS мэдлэг',
        'TypeScript-ийн үндсэн ойлголт'
      ],
      outcomes: [
        'Angular framework-ийн бүх чухал онцлогуудыг сурах',
        'Real-world application хөгжүүлэх',
        'Best practices болон patterns сурах'
      ]
    },
    {
      id: 2,
      title: 'React.js Мастер класс',
      description: 'React.js-ийн бүх чухал онцлогуудыг практик дадлагатай. Hooks, Context, Redux, Router зэргийг сурна.',
      price: 120000,
      duration: '15 цаг',
      level: 'Дунд',
      category: 'Frontend',
      image: 'assets/images/react.png',
      instructor: 'Сүхээ',
      rating: 4.7,
      students: 189,
      language: 'Монгол',
      lastUpdated: '2024-01-10',
      tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
      lessons: [
        { title: 'React-ийн үндэс', duration: '45 мин', type: 'video' },
        { title: 'Components болон Props', duration: '60 мин', type: 'video' },
        { title: 'State болон Lifecycle', duration: '75 мин', type: 'video' },
        { title: 'Hooks болон Functional Components', duration: '90 мин', type: 'video' },
        { title: 'Context API болон Redux', duration: '120 мин', type: 'video' }
      ],
      requirements: [
        'JavaScript-ийн үндсэн мэдлэг',
        'HTML/CSS мэдлэг',
        'ES6+ онцлогууд'
      ],
      outcomes: [
        'React-ийн бүх чухал онцлогуудыг сурах',
        'Modern React patterns сурах',
        'State management шийдлүүд'
      ]
    },
    {
      id: 3,
      title: 'Node.js Backend Development',
      description: 'Node.js ашиглан backend систем хөгжүүлэх. Express.js, MongoDB, Authentication, API development.',
      price: 180000,
      duration: '25 цаг',
      level: 'Дунд',
      category: 'Backend',
      image: 'assets/images/nodejs.png',
      instructor: 'Төгсбаатар',
      rating: 4.9,
      students: 156,
      language: 'Монгол',
      lastUpdated: '2024-01-20',
      tags: ['Node.js', 'Express', 'MongoDB', 'Backend', 'API'],
      lessons: [
        { title: 'Node.js-ийн үндэс', duration: '60 мин', type: 'video' },
        { title: 'Express.js Framework', duration: '90 мин', type: 'video' },
        { title: 'MongoDB болон Database', duration: '120 мин', type: 'video' },
        { title: 'Authentication болон Security', duration: '150 мин', type: 'video' },
        { title: 'API Development', duration: '180 мин', type: 'video' }
      ],
      requirements: [
        'JavaScript-ийн үндсэн мэдлэг',
        'Basic programming concepts',
        'Database concepts'
      ],
      outcomes: [
        'Backend development-ийн бүх чухал онцлогуудыг сурах',
        'RESTful API хөгжүүлэх',
        'Database design болон management'
      ]
    },
    {
      id: 4,
      title: 'Python Programming',
      description: 'Python програмчлалын үндэснээс эхлээд advanced topics хүртэл. Data Science, Web Development.',
      price: 100000,
      duration: '18 цаг',
      level: 'Эхлэгч',
      category: 'Programming',
      image: 'assets/images/python.png',
      instructor: 'Алтанцэцэг',
      rating: 4.6,
      students: 312,
      language: 'Монгол',
      lastUpdated: '2024-01-05',
      tags: ['Python', 'Programming', 'Data Science', 'Web Development'],
      lessons: [
        { title: 'Python-ийн үндэс', duration: '45 мин', type: 'video' },
        { title: 'Data Types болон Variables', duration: '60 мин', type: 'video' },
        { title: 'Control Structures', duration: '75 мин', type: 'video' },
        { title: 'Functions болон Modules', duration: '90 мин', type: 'video' },
        { title: 'Object-Oriented Programming', duration: '120 мин', type: 'video' }
      ],
      requirements: [
        'Basic computer knowledge',
        'Logical thinking',
        'No prior programming experience needed'
      ],
      outcomes: [
        'Python programming language-ийн бүх чухал онцлогуудыг сурах',
        'Problem solving skills',
        'Programming fundamentals'
      ]
    },
    {
      id: 5,
      title: 'JavaScript ES6+',
      description: 'JavaScript-ийн хамгийн сүүлийн үеийн онцлогуудыг сурна. ES6, ES7, ES8, ES9, ES10.',
      price: 80000,
      duration: '12 цаг',
      level: 'Эхлэгч',
      category: 'Programming',
      image: 'assets/images/javascript.png',
      instructor: 'Болд',
      rating: 4.5,
      students: 423,
      language: 'Монгол',
      lastUpdated: '2024-01-12',
      tags: ['JavaScript', 'ES6', 'Programming', 'Web Development'],
      lessons: [
        { title: 'JavaScript-ийн үндэс', duration: '45 мин', type: 'video' },
        { title: 'ES6 Features', duration: '60 мин', type: 'video' },
        { title: 'Async Programming', duration: '75 мин', type: 'video' },
        { title: 'Modern JavaScript', duration: '90 мин', type: 'video' },
        { title: 'Best Practices', duration: '120 мин', type: 'video' }
      ],
      requirements: [
        'Basic programming concepts',
        'HTML/CSS knowledge',
        'Logical thinking'
      ],
      outcomes: [
        'Modern JavaScript-ийн бүх чухал онцлогуудыг сурах',
        'Async programming patterns',
        'Best practices болон coding standards'
      ]
    },
    {
      id: 6,
      title: 'Vue.js Framework',
      description: 'Vue.js framework-ийн бүх онцлогуудыг сурна. Components, Vuex, Vue Router, Composition API.',
      price: 110000,
      duration: '16 цаг',
      level: 'Дунд',
      category: 'Frontend',
      image: 'assets/images/vuejs.png',
      instructor: 'Энхбат',
      rating: 4.4,
      students: 98,
      language: 'Монгол',
      lastUpdated: '2024-01-18',
      tags: ['Vue.js', 'JavaScript', 'Frontend', 'Web Development'],
      lessons: [
        { title: 'Vue.js-ийн үндэс', duration: '45 мин', type: 'video' },
        { title: 'Components болон Props', duration: '60 мин', type: 'video' },
        { title: 'Vuex State Management', duration: '75 мин', type: 'video' },
        { title: 'Vue Router', duration: '90 мин', type: 'video' },
        { title: 'Composition API', duration: '120 мин', type: 'video' }
      ],
      requirements: [
        'JavaScript-ийн үндсэн мэдлэг',
        'HTML/CSS мэдлэг',
        'Basic programming concepts'
      ],
      outcomes: [
        'Vue.js framework-ийн бүх чухал онцлогуудыг сурах',
        'State management patterns',
        'Modern Vue.js development'
      ]
    }
  ];

  getAllCourses(): Observable<Course[]> {
    if (environment.features.enableMockData) {
      return of(this.courses);
    }

    return this.apiService.get<ApiResponse<Course[]>>('/courses').pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      }),
      catchError(() => of(this.courses)) // Fallback to mock data on error
    );
  }

  getCourseById(id: number): Observable<Course | undefined> {
    if (environment.features.enableMockData) {
      const course = this.courses.find(c => c.id === id);
      return of(course);
    }

    return this.apiService.get<ApiResponse<Course>>(`/courses/${id}`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        return undefined;
      }),
      catchError(() => {
        const course = this.courses.find(c => c.id === id);
        return of(course);
      })
    );
  }

  getCoursesByCategory(category: string): Observable<Course[]> {
    const filteredCourses = this.courses.filter(c => c.category === category);
    return of(filteredCourses);
  }

  getCoursesByLevel(level: string): Observable<Course[]> {
    const filteredCourses = this.courses.filter(c => c.level === level);
    return of(filteredCourses);
  }

  searchCourses(filters: SearchFilters): Observable<Course[]> {
    if (environment.features.enableMockData) {
      return this.mockSearchCourses(filters);
    }

    return this.apiService.get<ApiResponse<Course[]>>('/courses/search', filters).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      }),
      catchError(() => this.mockSearchCourses(filters))
    );
  }

  private mockSearchCourses(filters: SearchFilters): Observable<Course[]> {
    let filteredCourses = [...this.courses];

    // Query search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filteredCourses = filteredCourses.filter(course => 
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        course.instructor.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      filteredCourses = filteredCourses.filter(course => course.category === filters.category);
    }

    // Level filter
    if (filters.level && filters.level !== 'all') {
      filteredCourses = filteredCourses.filter(course => course.level === filters.level);
    }

    // Price range filter
    if (filters.priceRange) {
      filteredCourses = filteredCourses.filter(course => 
        course.price >= filters.priceRange!.min && course.price <= filters.priceRange!.max
      );
    }

    // Rating filter
    if (filters.rating) {
      filteredCourses = filteredCourses.filter(course => course.rating >= filters.rating!);
    }

    // Language filter
    if (filters.language && filters.language !== 'all') {
      filteredCourses = filteredCourses.filter(course => course.language === filters.language);
    }

    // Instructor filter
    if (filters.instructor) {
      filteredCourses = filteredCourses.filter(course => 
        course.instructor.toLowerCase().includes(filters.instructor!.toLowerCase())
      );
    }

    return of(filteredCourses);
  }

  getFeaturedCourses(): Observable<Course[]> {
    const featuredCourses = this.courses.slice(0, 3);
    return of(featuredCourses);
  }

  getCategories(): Observable<string[]> {
    const categories = [...new Set(this.courses.map(course => course.category))];
    return of(categories);
  }

  getLevels(): Observable<string[]> {
    const levels = [...new Set(this.courses.map(course => course.level))];
    return of(levels);
  }

  getLanguages(): Observable<string[]> {
    const languages = [...new Set(this.courses.map(course => course.language || 'Монгол'))];
    return of(languages);
  }

  getInstructors(): Observable<string[]> {
    const instructors = [...new Set(this.courses.map(course => course.instructor))];
    return of(instructors);
  }

  getPriceRange(): Observable<{ min: number; max: number }> {
    const prices = this.courses.map(course => course.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return of({ min, max });
  }
}
