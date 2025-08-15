  import { Component, Input } from '@angular/core';
  import { CommonModule } from '@angular/common';

  @Component({
    selector: 'app-loading',
    standalone: true,
    imports: [CommonModule],
    template: `
  <div class="loading-overlay" *ngIf="show" role="alert" aria-live="polite">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <div class="loading-text">{{ message || 'Уншиж байна...' }}</div>
      </div>
    </div>
    `,
    styles: [`
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      }

      .loading-container {
        background: white;
        padding: 2rem;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      }

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .loading-text {
        color: #333;
        font-size: 1rem;
        font-weight: 500;
      }
    `]
  })
  export class LoadingComponent {
    @Input() show = false;
    @Input() message?: string;
  } 