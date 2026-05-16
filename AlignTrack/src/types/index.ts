export type UoMType = 'Numeric' | '%' | 'Timeline' | 'Zero-based';
export type Role = 'Employee' | 'Manager' | 'Admin';
export type SheetStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rework';
export type TrackingStatus = 'Not Started' | 'On Track' | 'Completed';
export type Cycle = 'Phase 1 (Setup)' | 'Q1 (July)' | 'Q2 (Oct)' | 'Q3 (Jan)' | 'Q4 (March)';

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