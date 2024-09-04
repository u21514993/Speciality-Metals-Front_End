import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-incoming',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './add-incoming.component.html',
  styleUrls: ['./add-incoming.component.css']
})
export class AddIncomingComponent implements OnInit {
  addIncomingForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddIncomingComponent>
  ) {}

  ngOnInit(): void {
    // Initialize the form group
    this.addIncomingForm = this.fb.group({
      gross_Weight: ['', Validators.required],
      tare_Weight: ['', Validators.required],
      net_Weight: ['', Validators.required],
      grV_Number: ['', Validators.required],
      supplierID: ['', Validators.required],
      productID: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.addIncomingForm.valid) {
      // Return the form value to the calling component
      this.dialogRef.close(this.addIncomingForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close(null); // Close without any data
  }
}
