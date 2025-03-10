// src/models/installation.ts

export interface Installation {
    id: string;
    address: string;
    customer_name: string;
    installation_date: string | null;
    last_inspection: string | null;
  }
  
  export interface InstallationCreate {
    id: string;
    address: string;
    customer_name: string;
    installation_date?: string | null;
    last_inspection?: string | null;
  }
  
  export interface InstallationUpdate {
    address?: string;
    customer_name?: string;
    installation_date?: string | null;
    last_inspection?: string | null;
  }