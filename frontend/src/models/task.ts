// src/models/task.ts

export enum TaskStatus {
    PLANNED = "Planlagt",
    IN_PROGRESS = "I gang",
    COMPLETED = "Afsluttet",
    CANCELLED = "Annulleret"
}

export enum TaskPriority {
    LOW = "Lav",
    MEDIUM = "Medium",
    HIGH = "Høj",
    URGENT = "Akut"
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus | string;
    priority: TaskPriority | string;
    installation_id?: string;
    created_date: string;
    due_date?: string;
    completed_date?: string;
    assigned_to?: string;
    estimated_hours?: number;
    actual_hours?: number;
    notes?: string;
}

export interface TaskCreate {
    title: string;
    description?: string;
    status: TaskStatus | string;
    priority: TaskPriority | string;
    installation_id?: string;
    due_date?: string;
    assigned_to?: string;
    estimated_hours?: number;
    notes?: string;
}

export interface TaskUpdate {
    title?: string;
    description?: string;
    status?: TaskStatus | string;
    priority?: TaskPriority | string;
    installation_id?: string;
    due_date?: string;
    completed_date?: string;
    assigned_to?: string;
    estimated_hours?: number;
    actual_hours?: number;
    notes?: string;
}