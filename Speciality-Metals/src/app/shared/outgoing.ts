export interface outgoing {
  outgoingID?: number;
  outgoing_Date?: Date;
  gross_Weight?: number;
  tare_Weight?: number;
  net_Weight?: number;
  sundry_Note_ID?: string;
  customerID?: number;
  productID?: number;
  employeeID?: number; // Add this line
}
