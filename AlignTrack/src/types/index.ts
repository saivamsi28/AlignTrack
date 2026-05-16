export type UoMType = 'Numeric' | '%' | 'Timeline' | 'Zero-based';

export interface Goal {
  id: string;
  thrustArea: string;
  title: string;
  description: string;
  uom: UoMType;
  target: string;
  weightage: number;
}