import { Routes } from '@angular/router';
import { LoginComponent } from '../Components/Login/Login/login/login.component';  // Adjust the path as necessary
import { HomeComponent } from '../Components/Login/home/home.component';
import { EmployeeComponent } from '../Components/Login/employee/employee.component';
import { ProductsComponent } from '../Components/Login/products/products.component';
import { ReportingComponent } from '../Components/reporting/reporting.component';
import { OutgoingComponent } from '../Components/outgoing/outgoing.component';
import { SupplierComponent } from '../Components/supplier/supplier.component';
import { IncomingComponent } from '../Components/incoming/incoming.component';
import { EmployeeHomeComponent } from '../Components/Login/employee/employee-home/employee-home.component';
import { AddEmployeeComponent } from '../Components/Login/employee/add-employee/add-employee.component';
import { AddSupplierComponent } from '../Components/supplier/add-supplier/add-supplier.component';
import { ViewSupplierComponent } from '../Components/supplier/view-supplier/view-supplier.component';
import { ViewProductsComponent } from '../Components/Login/products/view-products/view-products.component';
import { AddProductComponent } from '../Components/Login/products/add-products/add-products.component';

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

  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'employee-home', component: EmployeeHomeComponent },   

  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'add-employee', component: AddEmployeeComponent },   

  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'add-supplier', component: AddSupplierComponent },  

  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'view-supplier', component: ViewSupplierComponent },  

  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'view-products', component: ViewProductsComponent },  

  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'add-products', component: AddProductComponent },  
  
  // Route to LoginComponent
];
