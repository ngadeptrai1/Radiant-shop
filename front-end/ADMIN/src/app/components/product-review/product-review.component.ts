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
        this.showMessage('Review approved successfully');
        this.loadReviews();
      },
      error: () => {
        this.showMessage('Error approving review');
      }
    });
  }

  rejectReview(id: number): void {
    this.productReviewService.rejectProductReview(id.toString()).subscribe({
      next: () => {
        this.showMessage('Review rejected successfully');
        this.loadReviews();
      },
      error: () => {
        this.showMessage('Error rejecting review');
      }
    });
  }

  deleteReview(id: number): void {
    if (confirm('Are you sure you want to delete this review?')) {
      this.productReviewService.deleteProductReview(id.toString()).subscribe({
        next: () => {
          this.showMessage('Review deleted successfully');
          this.loadReviews();
        },
        error: () => {
          this.showMessage('Error deleting review');
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
