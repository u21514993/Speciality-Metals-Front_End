import { Routes } from '@angular/router';
import { LoginComponent } from '../Components/Login/Login/login/login.component';  // Adjust the path as necessary
import { HomeComponent } from '../Components/Login/home/home.component';
import { EmployeeComponent } from '../Components/Login/employee/employee.component';
import { ProductsComponent } from '../Components/Login/products/products.component';
import { ReportingComponent } from '../Components/reporting/reporting.component';
import { OutgoingComponent } from '../Components/outgoing/outgoing.component';
import { SupplierComponent } from '../Components/supplier/supplier.component';
import { IncomingComponent } from '../Components/incoming/incoming.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'login', component: LoginComponent }    ,       // Route to LoginComponent


  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'home', component: HomeComponent } ,
  
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'employee', component: EmployeeComponent } ,    
  
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'products', component: ProductsComponent } ,
  
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'reporting', component: ReportingComponent },
  
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'outgoing', component: OutgoingComponent },     
  
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'supplier', component: SupplierComponent },     
  
  
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'incoming', component: IncomingComponent },    
  
  // Route to LoginComponent
];
