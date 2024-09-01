import { Routes } from '@angular/router';
import { LoginComponent } from '../Components/Login/Login/login/login.component';  // Adjust the path as necessary

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'login', component: LoginComponent }           // Route to LoginComponent
];
