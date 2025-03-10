// src/models/test.ts

export enum TestType {
    RCD = "RCD Test",
    ISOLATION = "Isolationstest",
    CONTINUITY = "Kontinuitetstest",
    EARTHING = "Jordingstest",
    SHORT_CIRCUIT = "Kortslutningstest"
  }
  
  export enum TestStatus {
    PASS = "PASS",
    FAIL = "FAIL",
    WARNING = "WARNING"
  }
  
  export interface Test {
    id: string | number;
    installation_id: string | number;
    test_type: TestType | string;
    value: number | string;
    unit: string;
    status: TestStatus | string;
    timestamp: string | null;
    technician?: string;
    notes?: string;
    image_path?: string;
  }
  
  export interface TestCreate {
    installation_id: string;
    test_type: TestType;
    value: number;
    unit: string;
    notes?: string;
    image_path?: string;
  }
  
  export interface TestUpdate {
    value?: number;
    unit?: string;
    status?: TestStatus;
    notes?: string;
    image_path?: string;
  }