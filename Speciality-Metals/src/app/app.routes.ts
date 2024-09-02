import { Routes } from '@angular/router';
import { LoginComponentComponent } from './components/login/login-component/login-component/login-component.component'; // Adjust the path as necessary
import { HomeComponentComponent } from './components/login/login-component/home-component/home-component/home-component.component';
import { EmployeeHomeComponent } from './components/employee/employee-home/employee-home/employee-home.component';
import { ProductsHomeComponent } from './components/products/products-home/products-home/products-home.component';
import { ReportingComponentComponent } from './components/reporting/reporting-component/reporting-component.component';
import { OutgoingComponentComponent } from './components/outgoing/outgoing-component/outgoing-component.component';
import { SupplierHomeComponent } from './components/supplier/supplier-home/supplier-home/supplier-home.component';
import { IncomingComponentComponent } from './components/incoming/incoming-component/incoming-component.component';
import { AddEmployeeComponent } from './components/employee/add-employee/add-employee/add-employee.component';
import { AddSupplierComponent } from './components/supplier/add-supplier/add-supplier/add-supplier.component';
import { ViewSupplierComponent } from './components/supplier/view-supplier/view-supplier/view-supplier.component';
import { ViewProductsComponent } from './components/products/view-products/view-products/view-products.component';
import { AddProductsComponent } from './components/products/add-products/add-products/add-products.component';
import { CustomerHomeComponent } from './components/customer/customer-home/customer-home/customer-home.component';
import { AddCustomerComponent } from './components/customer/add-customer/add-customer/add-customer.component';
import { ViewCustomerComponent } from './components/customer/view-customer/view-customer/view-customer.component';
import { ViewEmployeeComponent } from './components/employee/view-employee/view-employee/view-employee.component';
import { GenerateEmployeeCodeComponent } from './components/login/login-component/generate-employee-code/generate-employee-code/generate-employee-code.component';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'login', component: LoginComponentComponent }    ,       // Route to LoginComponent


  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'home', component: HomeComponentComponent } ,
  
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'employee', component: EmployeeHomeComponent } ,    
  
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'products', component: ProductsHomeComponent } ,
  
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'reporting', component: ReportingComponentComponent },
  
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'outgoing', component: OutgoingComponentComponent },     
  
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'supplier', component: SupplierHomeComponent },     
  
  
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'incoming', component: IncomingComponentComponent },    

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
  { path: 'add-products', component: AddProductsComponent },  

  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'customer', component: CustomerHomeComponent },  
  
  // Route to LoginComponent
];
