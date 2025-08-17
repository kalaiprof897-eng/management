

export enum MachineStatus {
  Running = 'Running',
  Idle = 'Idle',
  Maintenance = 'Maintenance',
  Error = 'Error',
}

export interface Machine {
  id: string;
  name: string;
  status: MachineStatus;
  oee: number; // Overall Equipment Effectiveness (%)
  runningTime: number; // in hours
  idleTime: number; // in hours
  currentPart: string | null;
}

export enum ToolStatus {
    Active = 'Active',
    Inactive = 'Inactive',
    NeedsReplacement = 'Needs Replacement',
}

export interface Tool {
    id: string;
    type: string;
    remainingLife: number; // percentage
    location: string;
    status: ToolStatus;
}

export interface ProductionRecord {
    id: string;
    partId: string;
    machineName: string;
    quantityProduced: number;
    scrapCount: number;
    cycleTime: number; // in seconds
    timestamp: Date;
}

export interface CncTimeLog {
  id: string;
  machineName: string;
  workOrderNumber: string;
  workPieceName: string;
  quantity: number;
  siNo: string;
  inTime: Date;
  outTime: Date;
  userId?: string;
}