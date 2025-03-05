// src/models/test.ts

export enum TestType {
    RCD = "RCD Test",
    ISOLATION = "Isolationstest",
    CONTINUITY = "Kontinuitetstest",
    EARTHING = "Jordingstest",
    SHORT_CIRCUIT = "Kortslutningstest"
  }
  
  export enum TestStatus {
    PASS = "Godkendt",
    FAIL = "Ikke godkendt",
    WARNING = "Advarsel"
  }
  
  export interface Test {
    id: number;
    installation_id: string;
    test_type: TestType;
    value: number;
    unit: string;
    status: TestStatus;
    timestamp: string;
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