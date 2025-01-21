export interface incoming {
  incomingID: number;
    incoming_Date: Date;  // Keep as Date type
    gross_Weight: number;
    tare_Weight: number;
    net_Weight: number;
    supplierID: number;
    productID: number;
    employeeID: number;
    grV_ID: number;
    comments?: string;
    sundry_Note_ID: number;
}
