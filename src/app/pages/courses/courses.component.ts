import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {  Course } from '../../models/models';
import { CartService } from '../../services/cart.service';
import {CourseService  } from '../../services/course.service';

import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  categories: string[] = [];
  levels: string[] = [];
  searchQuery = '';
  selectedCategory = 'all';
  selectedLevel = 'all';

  constructor(
    private courseService: CourseService,
    private cartService: CartService,
    public authService: AuthService,
      private router: Router
  ) {}

  addToCart(course: Course) {
    this.cartService.addToCart(course);
    alert(`"${course.title}" сагсанд нэмэгдлээ!`);
  }
  ngOnInit() {
    this.loadCourses();
    this.loadFilterOptions();
  }

  loadCourses() {
    this.courseService.getAllCourses().subscribe(courses => {
      this.courses = courses;
      this.filteredCourses = courses;
    });
  }

  goToCourse(id: string) {
    this.router.navigate(['/courses', id]);
  }

loadFilterOptions() {
  this.courseService.getAllCourses().subscribe(courses => {
    this.courses = courses;

    this.categories = [
      ...new Set(
        courses
          .map(c => c.details?.[0]?.category)
          .filter((cat): cat is string => !!cat)
      )
    ];
    this.levels = [
      ...new Set(
        courses
          .map(c => c.details?.[0]?.level)
          .filter((lvl): lvl is string => !!lvl)
      )
    ];
  });
}



  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.filterCourses();
  }

  onCategoryChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedCategory = target.value;
    this.filterCourses();
  }

  onLevelChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedLevel = target.value;
    this.filterCourses();
  }
filterCourses() {
  this.filteredCourses = this.courses.filter(course => {
    const matchesSearch =
      course.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(this.searchQuery.toLowerCase());

    const matchesCategory =
      this.selectedCategory === 'all' ||
      course.details?.some(d => d.category === this.selectedCategory);

    const matchesLevel =
      this.selectedLevel === 'all' ||
      course.details?.some(d => d.level === this.selectedLevel);

    return matchesSearch && matchesCategory && matchesLevel;
  });
}
} 