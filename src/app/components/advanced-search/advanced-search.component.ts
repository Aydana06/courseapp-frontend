import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService, SearchFilters } from '../../services/course.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.css']
})
export class AdvancedSearchComponent implements OnInit {
  @Output() searchResults = new EventEmitter<any[]>();

  filters: SearchFilters = {
    query: '',
    category: 'all',
    level: 'all',
    language: 'all',
    instructor: 'all',
    rating: 0,
    priceRange: { min: 0, max: 1000000 }
  };

  categories: string[] = [];
  levels: string[] = [];
  languages: string[] = [];
  instructors: string[] = [];
  priceRange: { min: number; max: number } = { min: 0, max: 1000000 };
  currentPriceRange: { min: number; max: number } = { min: 0, max: 1000000 };

  private searchSubject = new Subject<SearchFilters>();

  constructor(private courseService: CourseService) {}

  ngOnInit() {
    this.loadFilterOptions();

    // debounce ашиглан хайлтын хүсэлт багасгах
    this.searchSubject.pipe(debounceTime(300)).subscribe(filters => {
      this.courseService.searchCourses(filters).subscribe(results => {
        this.searchResults.emit(results);
      });
    });
  }

  loadFilterOptions() {
    this.courseService.getCategories().subscribe(c => this.categories = c);
    this.courseService.getLevels().subscribe(l => this.levels = l);
    this.courseService.getLanguages().subscribe(l => this.languages = l);
    this.courseService.getInstructors().subscribe(i => this.instructors = i);
    this.courseService.getPriceRange().subscribe(range => {
      this.priceRange = range;
      this.currentPriceRange = { ...range };
      this.filters.priceRange = { ...range };
    });
  }

  onSearch() {
    const searchFilters: SearchFilters = {
      ...this.filters,
      priceRange: this.currentPriceRange
    };
    this.searchSubject.next(searchFilters);
  }

  onClearFilters() {
    this.filters = {
      query: '',
      category: 'all',
      level: 'all',
      language: 'all',
      instructor: 'all',
      rating: 0,
      priceRange: { ...this.priceRange }
    };
    this.currentPriceRange = { ...this.priceRange };
    this.onSearch();
  }
}
