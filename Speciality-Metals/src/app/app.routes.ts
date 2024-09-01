import { Routes } from '@angular/router';
import { LoginComponent } from '../Components/Login/Login/login/login.component';  // Adjust the path as necessary
import { HomeComponent } from '../Components/Login/home/home.component';
import { EmployeeComponent } from '../Components/Login/employee/employee.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'login', component: LoginComponent }    ,       // Route to LoginComponent


  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'home', component: HomeComponent } ,
  
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'employee', component: EmployeeComponent }     
  
  
  
  // Route to LoginComponent
];
