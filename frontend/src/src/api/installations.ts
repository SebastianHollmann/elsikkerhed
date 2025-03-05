// src/api/installations.ts
import axios from 'axios';
import { Installation, InstallationCreate } from '../models/installation';

const API_URL = 'http://localhost:8000';

/**
 * Henter alle installationer
 */
export const getInstallations = async (token: string, skip = 0, limit = 100): Promise<Installation[]> => {
  try {
    const response = await axios.get(`${API_URL}/installations?skip=${skip}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Fejl ved hentning af installationer:', error);
    throw new Error('Kunne ikke hente installationer');
  }
};

/**
 * Henter en specifik installation
 */
export const getInstallation = async (token: string, id: string): Promise<Installation> => {
  try {
    const response = await axios.get(`${API_URL}/installations/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Fejl ved hentning af installation ${id}:`, error);
    throw new Error('Kunne ikke hente installation');
  }
};

/**
 * Opretter en ny installation
 */
export const createInstallation = async (token: string, installation: InstallationCreate): Promise<Installation> => {
  try {
    const response = await axios.post(`${API_URL}/installations`, installation, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Fejl ved oprettelse af installation:', error);
    throw new Error('Kunne ikke oprette installation');
  }
};

/**
 * Opdaterer en eksisterende installation
 */
export const updateInstallation = async (
  token: string,
  id: string,
  installationUpdate: Partial<InstallationCreate>
): Promise<Installation> => {
  try {
    const response = await axios.put(`${API_URL}/installations/${id}`, installationUpdate, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Fejl ved opdatering af installation ${id}:`, error);
    throw new Error('Kunne ikke opdatere installation');
  }
};

/**
 * Sletter en installation
 */
export const deleteInstallation = async (token: string, id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/installations/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error(`Fejl ved sletning af installation ${id}:`, error);
    throw new Error('Kunne ikke slette installation');
  }
};