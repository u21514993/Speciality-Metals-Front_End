import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-supplier-home',
  standalone: true,
  imports: [CommonModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatSnackBarModule,
    RouterModule],
  templateUrl: './supplier-home.component.html',
  styleUrl: './supplier-home.component.css'
})
export class SupplierHomeComponent {

}
