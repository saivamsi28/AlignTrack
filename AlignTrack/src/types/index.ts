export type UoMType = 'Numeric' | '%' | 'Timeline' | 'Zero-based';
export type Role = 'Employee' | 'Manager' | 'Admin';
export type SheetStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rework';
export type TrackingStatus = 'Not Started' | 'On Track' | 'Completed';

export interface Goal {
  id: string;
  thrustArea: string;
  title: string;
  description: string;
  uom: UoMType;
  target: string;
  weightage: number;
  isShared?: boolean;
  
  // Phase 2: Tracking Fields
  actualAchievement?: string;
  progressStatus?: TrackingStatus;
  managerComment?: string;
}