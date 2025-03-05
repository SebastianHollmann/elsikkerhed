// src/api/tests.ts
import axios from 'axios';
import { Test, TestCreate, TestUpdate } from '../models/test';

const API_URL = 'http://localhost:8000';

/**
 * Henter alle testresultater
 */
export const getAllTests = async (token: string, skip = 0, limit = 100): Promise<Test[]> => {
  try {
    const response = await axios.get(`${API_URL}/tests?skip=${skip}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Fejl ved hentning af tests:', error);
    throw new Error('Kunne ikke hente tests');
  }
};

/**
 * Henter testresultater for en bestemt installation
 */
export const getTestsByInstallation = async (token: string, installationId: string): Promise<Test[]> => {
  try {
    const response = await axios.get(`${API_URL}/tests/installation/${installationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Fejl ved hentning af tests for installation ${installationId}:`, error);
    throw new Error('Kunne ikke hente tests for denne installation');
  }
};

/**
 * Henter et specifikt testresultat
 */
export const getTest = async (token: string, id: number): Promise<Test> => {
  try {
    const response = await axios.get(`${API_URL}/tests/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Fejl ved hentning af test ${id}:`, error);
    throw new Error('Kunne ikke hente test');
  }
};

/**
 * Opretter et nyt testresultat
 */
export const createTest = async (token: string, test: TestCreate): Promise<Test> => {
  try {
    const response = await axios.post(`${API_URL}/tests`, test, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Fejl ved oprettelse af test:', error);
    throw new Error('Kunne ikke oprette test');
  }
};

/**
 * Opdaterer et eksisterende testresultat
 */
export const updateTest = async (token: string, id: number, testUpdate: TestUpdate): Promise<Test> => {
  try {
    const response = await axios.put(`${API_URL}/tests/${id}`, testUpdate, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Fejl ved opdatering af test ${id}:`, error);
    throw new Error('Kunne ikke opdatere test');
  }
};

/**
 * Sletter et testresultat
 */
export const deleteTest = async (token: string, id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/tests/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error(`Fejl ved sletning af test ${id}:`, error);
    throw new Error('Kunne ikke slette test');
  }
};

/**
 * Upload billede til et testresultat
 */
export const uploadTestImage = async (token: string, file: File): Promise<{ image_path: string; filename: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/tests/upload-image`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Fejl ved upload af billede:', error);
    throw new Error('Kunne ikke uploade billede');
  }
};