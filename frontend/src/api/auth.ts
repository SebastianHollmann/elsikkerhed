// src/api/auth.ts
import axios from 'axios';

const API_URL = 'http://localhost:8000';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

/**
 * Logger brugeren ind ved hjælp af brugernavn og adgangskode
 */
export const login = async (username: string, password: string): Promise<string> => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/auth/token`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Login fejl:', error);
    throw new Error('Login fejlede');
  }
};

/**
 * Registrerer en ny bruger
 */
export const register = async (
  username: string,
  password: string,
  email: string,
  fullName: string
): Promise<void> => {
  try {
    await axios.post(`${API_URL}/auth/register`, {
      username,
      password,
      email,
      full_name: fullName,
    });
  } catch (error) {
    console.error('Registrering fejlede:', error);
    throw new Error('Registrering fejlede');
  }
};

/**
 * Henter information om den aktuelle bruger
 */
export const getCurrentUser = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/auth/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Fejl ved hentning af bruger:', error);
    throw new Error('Kunne ikke hente brugerinformation');
  }
};