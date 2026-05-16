export type UoMType = 'Numeric' | '%' | 'Timeline' | 'Zero-based';
export type Role = 'Employee' | 'Manager' | 'Admin';
export type SheetStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rework';

export interface Goal {
  id: string;
  thrustArea: string;
  title: string;
  description: string;
  uom: UoMType;
  target: string;
  weightage: number;
  isShared?: boolean; // Identifies a Departmental KPI
}