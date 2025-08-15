import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CourseService, Course } from '../../services/course.service';
import { CartService } from '../../services/cart.service';
import { AdvancedSearchComponent } from '../../components/advanced-search/advanced-search.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdvancedSearchComponent],
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
  showAdvancedSearch = false;

  constructor(
    private courseService: CourseService,
    private cartService: CartService,
      public authService: AuthService
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

  loadFilterOptions() {
    this.courseService.getCategories().subscribe(categories => {
      this.categories = categories;
    });

    this.courseService.getLevels().subscribe(levels => {
      this.levels = levels;
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
      const matchesSearch = course.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           course.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCategory = this.selectedCategory === 'all' || course.category === this.selectedCategory;
      const matchesLevel = this.selectedLevel === 'all' || course.level === this.selectedLevel;
      
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }

  toggleAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  onAdvancedSearchResults(results: Course[]) {
    this.filteredCourses = results;
  }
} 