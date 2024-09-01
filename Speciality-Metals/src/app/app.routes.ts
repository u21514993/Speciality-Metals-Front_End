import { Routes } from '@angular/router';
import { LoginComponent } from '../Components/Login/Login/login/login.component';  // Adjust the path as necessary
import { HomeComponent } from '../Components/Login/home/home.component';
import { EmployeesComponent } from '../Components/Login/employees/employees.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'login', component: LoginComponent }    ,       // Route to LoginComponent


  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'home', component: HomeComponent }     ,
  
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'employee', component: EmployeesComponent }   // Route to LoginComponent
];
