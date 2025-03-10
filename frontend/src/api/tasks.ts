// src/api/tasks.ts
import axios from 'axios';
import { Task, TaskCreate, TaskUpdate } from '../models/task';

const API_URL = 'http://localhost:8000';

/**
 * Henter alle opgaver
 */
export const getTasks = async (
    token: string, 
    skip = 0, 
    limit = 100, 
    status?: string, 
    installation_id?: string, 
    assigned_to?: string
): Promise<Task[]> => {
    try {
        let url = `${API_URL}/tasks?skip=${skip}&limit=${limit}`;
        
        if (status) {
            url += `&status=${status}`;
        }
        
        if (installation_id) {
            url += `&installation_id=${installation_id}`;
        }
        
        if (assigned_to) {
            url += `&assigned_to=${assigned_to}`;
        }
        
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Fejl ved hentning af opgaver:', error);
        throw new Error('Kunne ikke hente opgaver');
    }
};

/**
 * Henter en specifik opgave
 */
export const getTask = async (token: string, id: string): Promise<Task> => {
    try {
        const response = await axios.get(`${API_URL}/tasks/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Fejl ved hentning af opgave ${id}:`, error);
        throw new Error('Kunne ikke hente opgave');
    }
};

/**
 * Opretter en ny opgave
 */
export const createTask = async (token: string, task: TaskCreate): Promise<Task> => {
    try {
        const response = await axios.post(`${API_URL}/tasks`, task, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Fejl ved oprettelse af opgave:', error);
        throw new Error('Kunne ikke oprette opgave');
    }
};

/**
 * Opdaterer en eksisterende opgave
 */
export const updateTask = async (
    token: string,
    id: string,
    taskUpdate: TaskUpdate
): Promise<Task> => {
    try {
        const response = await axios.put(`${API_URL}/tasks/${id}`, taskUpdate, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Fejl ved opdatering af opgave ${id}:`, error);
        throw new Error('Kunne ikke opdatere opgave');
    }
};

/**
 * Sletter en opgave
 */
export const deleteTask = async (token: string, id: string): Promise<void> => {
    try {
        await axios.delete(`${API_URL}/tasks/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error(`Fejl ved sletning af opgave ${id}:`, error);
        throw new Error('Kunne ikke slette opgave');
    }
};