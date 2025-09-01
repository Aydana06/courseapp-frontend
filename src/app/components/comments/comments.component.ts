import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../../services/comment.service';
import { Comment } from '../../models/models';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentComponent implements OnInit {
  comments$!: Observable<Comment[]>;
  showForm = false;
  
  // Partial<Comment> ашиглаж зөвхөн шаардлагатай талбарыг үүсгэж байна
  newComment: Partial<Comment> = { content: '', rating: 5 };
  rating = [1, 2, 3, 4, 5];

  constructor(private commentService: CommentService, public authService: AuthService ) {}

  ngOnInit() {
    this.loadComments();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  addComment(): void {
    if (!this.newComment.content) return;

    this.commentService.addComment(this.newComment).subscribe({
      next: () => {
        this.newComment = { content: '', rating: 5 };
        this.showForm = false;
        this.loadComments(); // коммент шинэчилнэ
      },
      error: (err) => console.error('Коммент нэмэхэд алдаа гарлаа:', err)
    });
  }

  loadComments(): void {
    this.comments$ = this.commentService.getComments();
  }

  deleteComment(id: string): void {
    this.commentService.deleteComment(id).subscribe({
      next: () => this.loadComments(), // refresh
      error: (err) => console.error('Коммент устгахад алдаа гарлаа:', err)
    });
  }
}
