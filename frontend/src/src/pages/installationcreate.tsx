// src/pages/InstallationCreate.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createInstallation } from '../api/installations';
import { useAuth } from '../contexts/AuthContext';
import { InstallationCreate } from '../models/installation';

const InstallationCreatePage: React.FC = () => {
  const { authToken } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<InstallationCreate>({
    id: '',
    address: '',
    customer_name: '',
    installation_date: null,
    last_inspection: null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idTouched, setIdTouched] = useState(false);
  const [customerTouched, setCustomerTouched] = useState(false);
  const [addressTouched, setAddressTouched] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validering
  const validateId = () => {
    if (!formData.id.trim()) {
      return 'Installations-ID er påkrævet';
    }
    if (formData.id.length < 3) {
      return 'ID skal være mindst 3 tegn';
    }
    if (formData.id.length > 50) {
      return 'ID må højst være 50 tegn';
    }
    return '';
  };

  const validateCustomer = () => {
    if (!formData.customer_name.trim()) {
      return 'Kundenavn er påkrævet';
    }
    if (formData.customer_name.length < 2) {
      return 'Kundenavn skal være mindst 2 tegn';
    }
    if (formData.customer_name.length > 100) {
      return 'Kundenavn må højst være 100 tegn';
    }
    return '';
  };

  const validateAddress = () => {
    if (!formData.address.trim()) {
      return 'Adresse er påkrævet';
    }
    if (formData.address.length < 3) {
      return 'Adresse skal være mindst 3 tegn';
    }
    if (formData.address.length > 255) {
      return 'Adresse må højst være 255 tegn';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;

    // Sæt alle felter som berørt for at vise alle valideringsfejl
    setIdTouched(true);
    setCustomerTouched(true);
    setAddressTouched(true);

    // Valider alle felter
    const idError = validateId();
    const customerError = validateCustomer();
    const addressError = validateAddress();

    if (idError || customerError || addressError) {
      setError('Ret venligst fejlene i formularen');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createInstallation(authToken, formData);
      navigate('/installations');
    } catch (err) {
      console.error('Error creating installation:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Der opstod en fejl ved oprettelse af installationen');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Beregn validationsfejl kun hvis feltet er berørt
  const idError = idTouched ? validateId() : '';
  const customerError = customerTouched ? validateCustomer() : '';
  const addressError = addressTouched ? validateAddress() : '';

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Opret Ny Installation</h1>
          <Link
            to="/installations"
            className="inline-flex items-center px-4 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Tilbage til liste
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Fejl! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-4">
            <h2 className="text-lg font-medium text-blue-800">Installationsdetaljer</h2>
            <p className="text-sm text-blue-600">Udfyld venligst alle påkrævede felter (*)</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="col-span-1">
                <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
                  Installations-ID <span className="text-red-500">*</span>
                </label>
                <input
                  id="id"
                  name="id"
                  type="text"
                  placeholder="F.eks. INST-001"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    idError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  value={formData.id}
                  onChange={handleChange}
                  onBlur={() => setIdTouched(true)}
                  required
                />
                {idError && (
                  <p className="mt-1 text-sm text-red-600">{idError}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Angiv et unikt ID for installationen
                </p>
              </div>

              <div className="col-span-1">
                <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Kundenavn <span className="text-red-500">*</span>
                </label>
                <input
                  id="customer_name"
                  name="customer_name"
                  type="text"
                  placeholder="Angiv kundens navn"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    customerError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  value={formData.customer_name}
                  onChange={handleChange}
                  onBlur={() => setCustomerTouched(true)}
                  required
                />
                {customerError && (
                  <p className="mt-1 text-sm text-red-600">{customerError}</p>
                )}
              </div>

              <div className="col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse <span className="text-red-500">*</span>
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Angiv installationsadressen"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    addressError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={() => setAddressTouched(true)}
                  required
                />
                {addressError && (
                  <p className="mt-1 text-sm text-red-600">{addressError}</p>
                )}
              </div>

              <div className="col-span-1">
                <label htmlFor="installation_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Installationsdato
                </label>
                <input
                  id="installation_date"
                  name="installation_date"
                  type="date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.installation_date || ''}
                  onChange={handleChange}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Valgfri. Angiv datoen for den oprindelige installation
                </p>
              </div>

              <div className="col-span-1">
                <label htmlFor="last_inspection" className="block text-sm font-medium text-gray-700 mb-1">
                  Seneste inspektion
                </label>
                <input
                  id="last_inspection"
                  name="last_inspection"
                  type="date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.last_inspection || ''}
                  onChange={handleChange}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Valgfri. Angiv datoen for seneste inspektion
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-8 pt-5 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/installations')}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                Annuller
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Gemmer...
                  </>
                ) : (
                  'Gem Installation'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InstallationCreatePage;