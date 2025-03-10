import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTest, updateTest } from '../api/test';
import { useAuth } from '../contexts/AuthContext';
import { Test, TestStatus, TestUpdate } from '../models/test';

// Define an extended Test interface that includes optional fields we're using
interface TestFormData extends Partial<Test> {
  technician?: string;
  notes?: string;
}

const TestEdit: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const { authToken } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<TestFormData>({
    value: 0, // Initialize with appropriate default values
    unit: '',
    status: undefined, // Initialize as undefined
    notes: '',
    technician: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestData = async () => {
      if (!authToken || !testId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Convert testId to number if your API requires it, or pass as string if API handles it
        const testData = await getTest(authToken, testId);
        setFormData({
          ...testData,
          // Ensure we don't modify these fields
          id: testData.id,
          installation_id: testData.installation_id,
          test_type: testData.test_type,
          timestamp: testData.timestamp,
          // Add optional fields that might not be in the Test type
          technician: (testData as any).technician || '',
          notes: (testData as any).notes || ''
        });
      } catch (err) {
        console.error('Error fetching test details:', err);
        setError('Der opstod en fejl ved hentning af testdetaljer');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestData();
  }, [authToken, testId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || !testId) return;

    setIsSaving(true);
    setError(null);

    try {
      // Convert testId to number if your API requires it, or pass as string if API handles it
      await updateTest(authToken, testId, formData as unknown as TestUpdate);
      navigate(`/tests/${testId}`);
    } catch (err) {
      console.error('Error updating test:', err);
      setError('Der opstod en fejl ved opdatering af testen');
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
        <h1 className="text-2xl font-bold">Rediger Test</h1>
        <button
          onClick={() => navigate(`/tests/${testId}`)}
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
            <h3 className="text-lg leading-6 font-medium text-gray-900">Test Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Rediger testens detaljer nedenfor
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="test_type" className="block text-sm font-medium text-gray-700">
                  Test Type
                </label>
                <input
                  type="text"
                  name="test_type"
                  id="test_type"
                  value={formData.test_type || ''}
                  disabled
                  className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Test typen kan ikke ændres</p>
              </div>

              <div>
                <label htmlFor="installation_id" className="block text-sm font-medium text-gray-700">
                  Installations ID
                </label>
                <input
                  type="text"
                  name="installation_id"
                  id="installation_id"
                  value={formData.installation_id || ''}
                  disabled
                  className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-700 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Installationen kan ikke ændres</p>
              </div>

              <div>
                <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                  Måleværdi
                </label>
                <input
                  type="text"
                  name="value"
                  id="value"
                  value={formData.value || ''}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                  Enhed
                </label>
                <input
                  type="text"
                  name="unit"
                  id="unit"
                  value={formData.unit || ''}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status || ''}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Vælg status</option>
                  <option value={TestStatus.PASS}>Godkendt</option>
                  <option value={TestStatus.WARNING}>Advarsel</option>
                  <option value={TestStatus.FAIL}>Ikke godkendt</option>
                </select>
              </div>

              <div>
                <label htmlFor="technician" className="block text-sm font-medium text-gray-700">
                  Tekniker
                </label>
                <input
                  type="text"
                  name="technician"
                  id="technician"
                  value={formData.technician || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Noter
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                ></textarea>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="button"
              onClick={() => navigate(`/tests/${testId}`)}
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

export default TestEdit; 