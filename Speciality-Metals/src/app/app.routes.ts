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
import { ViewIncomingsComponent } from './components/incoming/view-incomings/view-incomings.component';
import { SundryComponent } from './components/Sundry/sundry/sundry.component';
import { ReportCustComponent } from './components/report-cust/report-cust.component';
import { ReportProductComponent } from './components/report-product/report-product.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Default route
  { path: 'login', component: LoginComponentComponent }, // Route to LoginComponent

  { path: 'home', component: HomeComponentComponent },

  { path: 'reportProduct', component: ReportProductComponent },

  { path: 'reportCust', component: ReportCustComponent },

  { path: 'employee', component: ViewEmployeeComponent },

  { path: 'products', component: ProductsHomeComponent },

  { path: 'reporting', component: ReportingComponentComponent },

  { path: 'outgoing', component: OutgoingComponentComponent },

  { path: 'supplier', component: SupplierHomeComponent },

  { path: 'incoming', component: IncomingComponentComponent },

  { path: 'employee-home', component: EmployeeHomeComponent },

  { path: 'add-employee', component: AddEmployeeComponent },

  { path: 'add-supplier', component: AddSupplierComponent },

  { path: 'view-supplier', component: ViewSupplierComponent },

  { path: 'view-products', component: ViewProductsComponent },

  { path: 'add-products', component: AddProductsComponent },

  { path: 'customer', component: CustomerHomeComponent },
  { path: 'add-customer', component: AddCustomerComponent },
  { path: 'view-customer', component: ViewCustomerComponent },

  { path: 'view-incomings', component: ViewIncomingsComponent },
  { path: 'sundry', component: SundryComponent }
  // Route to LoginComponent
];
