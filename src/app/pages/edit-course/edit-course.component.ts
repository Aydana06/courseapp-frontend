import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { Course } from '../../models/models';

@Component({
  selector: 'app-edit-course',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-course.component.html',
  styleUrls: ['./edit-course.component.css']
})
export class EditCourseComponent implements OnInit {
  course: Course | null = null;
  isLoading = false;
  errorMessage = '';
  lessonsText = '';
  requirementsText = '';
  outcomesText = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Сургалтын ID олдсонгүй';
      return;
    }
    this.isLoading = true;
    this.courseService.getCourseById(id).subscribe({
      next: (c) => {
        this.course = c;
        const d = c?.details?.[0];
        this.lessonsText = (d?.lessons || []).map((l: any) => `${l.title || ''} | ${l.duration || ''} | ${l.type || ''}`).join('\n');
        this.requirementsText = (d?.requirements || []).join('\n');
        this.outcomesText = (d?.outcomes || []).join('\n');
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Сургалтыг уншихад алдаа гарлаа';
        this.isLoading = false;
      }
    });
  }

  save(): void {
    if (!this.course) return;
    this.isLoading = true;
    const courseId = this.course._id;
    const payload: Partial<Course> = {
      title: this.course.title,
      description: this.course.description,
      price: this.course.price,
      duration: this.course.duration,
      image: this.course.image,
      instructor: this.course.instructor,
      details: [{
        id: '',
        level: this.course.details?.[0]?.level,
        category: this.course.details?.[0]?.category,
        rating: this.course.details?.[0]?.rating,
        students: this.course.details?.[0]?.students,
        language: this.course.details?.[0]?.language,
        lastUpdated: new Date().toISOString().split('T')[0],
        tags: this.course.details?.[0]?.tags || [],
        lessons: this.lessonsText.split('\n').map(l => l.trim()).filter(Boolean).map(line => {
          const [title, duration, type] = line.split('|').map(s => s?.trim());
          return { title: title || 'Untitled', duration: duration || '', type: type || '' } as any;
        }),
        requirements: this.requirementsText.split('\n').map(s => s.trim()).filter(Boolean),
        outcomes: this.outcomesText.split('\n').map(s => s.trim()).filter(Boolean)
      }]
    };
    this.courseService.updateCourse(courseId, payload).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Сургалт амжилттай хадгалагдлаа');
        // Clear list cache to reflect latest changes when returning
        this.courseService.refreshCourses().subscribe(() => {
          this.router.navigate(['/admin']);
        });
      },
      error: () => {
        this.isLoading = false;
        alert('Хадгалахад алдаа гарлаа');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin']);
  }
}


