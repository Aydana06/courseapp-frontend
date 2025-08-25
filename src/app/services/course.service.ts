import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';
import { environment } from '../../environments/environment';
import { Course, SearchFilters } from '../models/models';

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
      image: 'assets/images/angular.png',
      instructor: 'Бат-Эрдэнэ',
      details: [{
        level: 'Дунд',
        category: 'Frontend',
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
        ]}],
    },
    {
      id: 2,
      title: 'React.js Мастер класс',
      description: 'React.js-ийн бүх чухал онцлогуудыг практик дадлагатай. Hooks, Context, Redux, Router зэргийг сурна.',
      price: 120000,
      duration: '15 цаг',
      image: 'assets/images/react.png',
      instructor: 'Сүхээ',
      details: [{
        level: 'Дунд',
        category: 'Frontend',
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
      ]}]
    },
    {
      id: 3,
      title: 'Node.js Backend Development',
      description: 'Node.js ашиглан backend систем хөгжүүлэх. Express.js, MongoDB, Authentication, API development.',
      price: 180000,
      duration: '25 цаг',
      image: 'assets/images/nodejs.png',
      instructor: 'Төгсбаатар',
      details: [{
        level: 'Дунд',
      category: 'Backend',
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
      }]
    },
    {
      id: 4,
      title: 'Python Programming',
      description: 'Python програмчлалын үндэснээс эхлээд advanced topics хүртэл. Data Science, Web Development.',
      price: 100000,
      duration: '18 цаг',
      image: 'assets/images/python.png',
      instructor: 'Алтанцэцэг',
      details: [{
        level: 'Эхлэгч',
      category: 'Programming',
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
      }]
    },
    {
      id: 5,
      title: 'JavaScript ES6+',
      description: 'JavaScript-ийн хамгийн сүүлийн үеийн онцлогуудыг сурна. ES6, ES7, ES8, ES9, ES10.',
      price: 80000,
      duration: '12 цаг',
      image: 'assets/images/javascript.png',
      instructor: 'Болд',
     details: [{
       level: 'Эхлэгч',
      category: 'Programming',
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
     }]
    },
    {
      id: 6,
      title: 'Vue.js Framework',
      description: 'Vue.js framework-ийн бүх онцлогуудыг сурна. Components, Vuex, Vue Router, Composition API.',
      price: 110000,
      duration: '16 цаг',
      image: 'assets/images/vuejs.png',
      instructor: 'Энхбат',
      details: [{
      level: 'Дунд',
      category: 'Frontend',
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
      }]
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

  getCoursesUpToId(maxId: number): Observable<Course[]> {
  if (environment.features.enableMockData) {
    const courses = this.courses.filter(c => c.id <= maxId);
    return of(courses);
  }

  return this.apiService.get<ApiResponse<Course[]>>(`/courses?maxId=${maxId}`).pipe(
    map(response => {
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    }),
    catchError(() => {
      const courses = this.courses.filter(c => c.id <= maxId);
      return of(courses);
    })
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
  const filteredCourses = this.courses.filter(c =>
    c.details?.some(d => d.category === category)
  );
  return of(filteredCourses);
}

getCoursesByLevel(level: string): Observable<Course[]> {
  const filteredCourses = this.courses.filter(c =>
    c.details?.some(d => d.level === level)
  );
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
    let filtered = [...this.courses];

    if (filters.query) {
      const q = filters.query.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.details?.some(d => d.tags?.some(tag => tag.toLowerCase().includes(q))) ||
        c.instructor.toLowerCase().includes(q)
      );
    }

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(c => c.details?.some(d => d.category === filters.category));
    }

    if (filters.level && filters.level !== 'all') {
      filtered = filtered.filter(c => c.details?.some(d => d.level === filters.level));
    }

if (filters.priceRange) {
  const { min, max } = filters.priceRange;
  filtered = filtered.filter(c =>
    (min === undefined || c.price >= min) &&
    (max === undefined || c.price <= max)
  );
}

    if (filters.rating) {
      filtered = filtered.filter(c => c.details?.some(d => d.rating! >= filters.rating!));
    }

    if (filters.language && filters.language !== 'all') {
      filtered = filtered.filter(c => c.details?.some(d => d.language === filters.language));
    }

if (filters.instructor) {
  const q = filters.instructor.trim().toLowerCase();
  filtered = filtered.filter(c => c.instructor.toLowerCase().includes(q));
}
    return of(filtered);
  }

  getFeaturedCourses(): Observable<Course[]> {
    const featuredCourses = this.courses.slice(0, 3);
    return of(featuredCourses);
  }

getCategories(): Observable<string[]> {
  const categories = [
    ...new Set(
      this.courses.flatMap(c =>
        (c.details ?? [])
          .map(d => d.category)
          .filter((cat): cat is string => cat !== undefined)
      )
    )
  ];
  return of(categories);
}

getLevels(): Observable<string[]> {
  const levels = [
    ...new Set(
      this.courses.flatMap(c =>
        (c.details ?? [])
          .map(d => d.level)
          .filter((l): l is string => l !== undefined)
      )
    )
  ];
  return of(levels);
}

getLanguages(): Observable<string[]> {
  const langs = [
    ...new Set(
      this.courses.flatMap(c =>
        (c.details ?? []).map(d => d.language || 'Монгол')
      )
    )
  ];
  return of(langs);
}


 getInstructors(): Observable<string[]> {
    const instructors = [...new Set(this.courses.map(c => c.instructor))];
    return of(instructors);
  }

  getPriceRange(): Observable<{ min: number; max: number }> {
    const prices = this.courses.map(c => c.price);
    return of({ min: Math.min(...prices), max: Math.max(...prices) });
  }
}


