import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';


@Component({
  selector: 'app-incoming-component',
  standalone: true,
  imports: [CommonModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatSnackBarModule,
    RouterModule],
  templateUrl: './incoming-component.component.html',
  styleUrl: './incoming-component.component.css'
})
export class IncomingComponentComponent {
  constructor(private router: Router) {}

  goToViewIncomings(): void {
    this.router.navigate(['/view-incomings']);
  }

}
