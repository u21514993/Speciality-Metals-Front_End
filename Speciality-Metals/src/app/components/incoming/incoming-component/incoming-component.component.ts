import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-incoming-component',
  standalone: true,
  imports: [],
  templateUrl: './incoming-component.component.html',
  styleUrl: './incoming-component.component.css'
})
export class IncomingComponentComponent {
  constructor(private router: Router) {}

  goToViewIncomings(): void {
    this.router.navigate(['/view-incomings']);
  }

}
