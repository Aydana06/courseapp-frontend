import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Course, Comment } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { CourseService } from '../../services/course.service';
import { CommentService } from '../../services/comment.service';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  courses$!: Observable<Course[]>;
  comments$!: Observable<Comment[]>;
  featuredCourses$!: Observable<Course[]>;

  showForm = false;
  newComment: Comment = { name: '', role: '', content: '', rating: 5 };

  rating = [1, 2, 3, 4, 5];

  constructor(
    private cartService: CartService,
    public authService: AuthService,
    private courseService: CourseService,
    private commentService: CommentService
  ) {}

  ngOnInit() {
    this.loadCourses(3);
    this.loadComments();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  loadCourses(id: number) {
    this.courses$ = this.courseService.getCoursesUpToId(id);
    this.featuredCourses$ = this.courses$; // одоохондоо адилхан
  }

  addComment(): void {
    if (!this.newComment.name || !this.newComment.content) return;

    this.commentService.addComment(this.newComment).subscribe(() => {
      this.newComment = { name: '', role: '', content: '', rating: 5 };
      this.showForm = false;
      this.loadComments(); // refresh
    });
  }

  loadComments(): void {
    this.comments$ = this.commentService.getComments();
  }

  deleteComment(id: number): void {
    this.commentService.deleteComment(id).subscribe({
      next: () => this.loadComments(), // refresh
      error: (err) => console.error('Алдаа гарлаа:', err)
    });
  }

  addToCart(course: Course) {
    this.cartService.addToCart(course);
    alert(`"${course.title}" сагсанд нэмэгдлээ.`);
  }
}
