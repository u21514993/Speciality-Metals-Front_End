export interface Employee {
    staffID?: number;            // Optional field for ID, only needed when updating an existing employee
    employee_Name: string;
    employee_Age: number;
    iD_Number: string;
    employee_Code: string;
    employee_Type_ID?: number;      // Optional field for Employee Type ID
  }
  