export type UoMType = 'Min (Numeric / %)' | 'Max (Numeric / %)' | 'Timeline' | 'Zero';
export type Role = 'Employee' | 'Manager' | 'Admin';
export type SheetStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rework';
export type TrackingStatus = 'Not Started' | 'On Track' | 'Completed';
export type Cycle = 'Phase 1 (Setup)' | 'Q1 Check-in' | 'Q2 Check-in' | 'Q3 Check-in' | 'Q4 / Annual';

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
}

export interface Goal {
  id: string;
  thrustArea: string;
  title: string;
  description: string;
  uom: UoMType;
  target: string;
  weightage: number;
  isShared?: boolean;
  actualAchievement?: string;
  progressStatus?: TrackingStatus;
  managerComment?: string;
}