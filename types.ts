export type Sex = 'Male' | 'Female';
export type ComorbidityLevel = 'none' | 'mild' | 'severe';
export type CancerType = 'gastric' | 'colorectal' | 'lung' | 'breast' | 'cervical';

export interface SurvivalDataPoint {
  age: number;
  Base: number;
  Intervention: number;
}

export interface SimulationResult {
  gainDays: number;
  personalEx: number;
  referenceEx: number;
  survivalData: SurvivalDataPoint[];
}

export interface GuidanceResult {
  status: 'recommended' | 'shared' | 'not_recommended';
  message: string;
}

export interface GuidanceMap {
  gastric: GuidanceResult;
  colorectal: GuidanceResult;
  lung: GuidanceResult;
  breast: GuidanceResult;
  cervical: GuidanceResult;
}