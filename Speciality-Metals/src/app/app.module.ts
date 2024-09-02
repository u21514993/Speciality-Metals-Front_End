import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { LoginComponentComponent } from './components/login/login-component/login-component/login-component.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EmployeeHomeComponent } from './components/employee/employee-home/employee-home/employee-home.component';
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
    LoginComponentComponent,
    AppComponent, 
  ],
  providers: [HttpClient],
  bootstrap: [] // Or whatever your root component is
})
export class AppModule { }
