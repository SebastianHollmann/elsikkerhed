import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getInstallation, updateInstallation } from '../api/installations';
import { useAuth } from '../contexts/AuthContext';
import { Installation } from '../models/installation';

const InstallationEdit: React.FC = () => {
  const { installationId } = useParams<{ installationId: string }>();
  const { authToken } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<Partial<Installation>>({
    customer_name: '',
    address: '',
    installation_date: '',
    last_inspection: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstallationData = async () => {
      if (!authToken || !installationId) return;

      setIsLoading(true);
      setError(null);

      try {
        const installationData = await getInstallation(authToken, installationId);
        setFormData({
          ...installationData,
          // Ensure we don't modify the ID
          id: installationData.id
        });
      } catch (err) {
        console.error('Error fetching installation details:', err);
        setError('Der opstod en fejl ved hentning af installationsdetaljer');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstallationData();
  }, [authToken, installationId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || !installationId) return;

    setIsSaving(true);
    setError(null);

    try {
      await updateInstallation(authToken, installationId, formData);
      navigate(`/installations/${installationId}`);
    } catch (err) {
      console.error('Error updating installation:', err);
      setError('Der opstod en fejl ved opdatering af installationen');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Rediger Installation</h1>
        <button
          onClick={() => navigate(`/installations/${installationId}`)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          Annuller
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Fejl! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <form onSubmit={handleSubmit}>
          <div className="px-4 py-5 sm:px-6 bg-blue-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Installations Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Rediger installationens detaljer nedenfor
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="id" className="block text-sm font-medium text-gray-700">
                  Installations ID
                </label>
                <input
                  type="text"
                  name="id"
                  id="id"
                  value={formData.id || ''}
                  disabled
                  className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">ID kan ikke ændres</p>
              </div>

              <div>
                <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700">
                  Kundenavn
                </label>
                <input
                  type="text"
                  name="customer_name"
                  id="customer_name"
                  value={formData.customer_name || ''}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Adresse
                </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="installation_date" className="block text-sm font-medium text-gray-700">
                  Installationsdato
                </label>
                <input
                  type="date"
                  name="installation_date"
                  id="installation_date"
                  value={formData.installation_date ? new Date(formData.installation_date).toISOString().split('T')[0] : ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="last_inspection" className="block text-sm font-medium text-gray-700">
                  Seneste inspektion
                </label>
                <input
                  type="date"
                  name="last_inspection"
                  id="last_inspection"
                  value={formData.last_inspection ? new Date(formData.last_inspection).toISOString().split('T')[0] : ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="button"
              onClick={() => navigate(`/installations/${installationId}`)}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            >
              Annuller
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSaving ? 'Gemmer...' : 'Gem ændringer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstallationEdit; 