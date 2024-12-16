import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductReviewService } from '../../services/product-review.service';
import { ProductReview } from '../../../type';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-review',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule
  ],
  templateUrl: './product-review.component.html',
  styleUrl: './product-review.component.scss'
})
export class ProductReviewComponent implements OnInit {
  reviews: ProductReview[] = [];
  displayedColumns: string[] = ['thumbnail', 'productName', 'fullName', 'rating', 'reviewText', 'reviewDate', 'status', 'actions'];

  constructor(
    private productReviewService: ProductReviewService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.productReviewService.getProductReviews().subscribe({
      next: (data) => {
        this.reviews = data;
      },
      error: (error) => {
        this.showMessage('Error loading reviews');
      }
    });
  }

  approveReview(id: number): void {
    this.productReviewService.approveProductReview(id.toString()).subscribe({
      next: () => {
        this.showMessage('Đã duyệt đánh giá');
        this.loadReviews();
      },
      error: () => {
        this.showMessage('Đã duyệt đánh giá');
      }
    });
  }

  rejectReview(id: number): void {
    this.productReviewService.rejectProductReview(id.toString()).subscribe({
      next: () => {
        this.showMessage('Đã từ chối đánh giá');
        this.loadReviews();
      },
      error: () => {
        this.showMessage('Đã từ chối đánh giá');
      }
    });
  }

  deleteReview(id: number): void {
    if (confirm('Bạn có chắc muốn xóa đánh giá này ?')) {
      this.productReviewService.deleteProductReview(id.toString()).subscribe({
        next: () => {
          this.showMessage('Đã xóa đánh giá');
          this.loadReviews();
        },
        error: () => {
          this.showMessage('Đã xóa đánh giá');
        }
      });
    }
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000
    });
  }

  getRatingStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
}
