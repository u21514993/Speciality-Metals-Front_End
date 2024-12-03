import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { LoginComponentComponent } from './components/login/login-component/login-component/login-component.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';  // Only import HttpClientModule here
import { EmployeeHomeComponent } from './components/employee/employee-home/employee-home/employee-home.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MaterialModule } from './shared/material.module';
import { ReportingComponentComponent } from './components/reporting/reporting-component/reporting-component.component';
import { ReportCustComponent } from './components/report-cust/report-cust.component';


@NgModule({
  declarations: [
    // Add your components here
  ],
  imports: [
    BrowserModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
    HttpClientModule,    // Only add HttpClientModule here
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MaterialModule,   
    ReportingComponentComponent,

    ReportCustComponent
  ],
  providers: [],
  bootstrap: [], // Or whatever your root component is
})
export class AppModule {}
