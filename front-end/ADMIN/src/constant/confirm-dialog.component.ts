import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatDialogContent ,MatDialogActions,MatDialogClose} from "@angular/material/dialog";
@Component({
    standalone:true,
    imports:[MatDialogContent,MatDialogActions,MatDialogClose],
    selector: 'app-confirm-dialog',
    
    template: `
      <h2 mat-dialog-title>{{data.title}}</h2>
      <mat-dialog-content>{{data.message}}</mat-dialog-content>
      <mat-dialog-actions align="end">
        <button class="btn btn-secondary" [mat-dialog-close]="false">Hủy</button>
        <button class="btn btn-danger" [mat-dialog-close]="true">Xác nhận</button>
      </mat-dialog-actions>
    `,
  })
  export class ConfirmDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: {title: string, message: string}) {}
  }