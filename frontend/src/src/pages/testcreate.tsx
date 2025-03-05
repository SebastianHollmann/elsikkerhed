// src/pages/TestCreate.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getInstallation, getInstallations } from '../api/installations';
import { createTest, uploadTestImage } from '../api/tests';
import { useAuth } from '../contexts/AuthContext';
import { Installation } from '../models/installation';
import { TestCreate, TestType } from '../models/test';

const TestCreatePage: React.FC = () => {
  const { authToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const installationIdParam = searchParams.get('installation');
  
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [selectedInstallation, setSelectedInstallation] = useState<Installation | null>(null);
  const [isLoadingInstallations, setIsLoadingInstallations] = useState(false);
  
  const [formData, setFormData] = useState<TestCreate>({
    installation_id: installationIdParam || '',
    test_type: TestType.RCD,
    value: 0,
    unit: 'ms',
    notes: '',
    image_path: '',
  });
  
  const [testImage, setTestImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [valueError, setValueError] = useState('');

  // Indlæs installationer, hvis ingen specifik installation er valgt
  useEffect(() => {
    const fetchInstallations = async () => {
      if (!authToken) return;
      
      setIsLoadingInstallations(true);
      try {
        const installationsData = await getInstallations(authToken);
        setInstallations(installationsData);
      } catch (err) {
        console.error('Error fetching installations:', err);
        setError('Kunne ikke hente installationer');
      } finally {
        setIsLoadingInstallations(false);
      }
    };

    // Hvis vi har en installations-ID fra URL-parameteren, så hent bare den specifikke installation
    const fetchSpecificInstallation = async () => {
      if (!authToken || !installationIdParam) return;
      
      setIsLoadingInstallations(true);
      try {
        const installation = await getInstallation(authToken, installationIdParam);
        setSelectedInstallation(installation);
      } catch (err) {
        console.error('Error fetching installation:', err);
        setError('Kunne ikke hente den valgte installation');
      } finally {
        setIsLoadingInstallations(false);
      }
    };

    if (installationIdParam) {
      fetchSpecificInstallation();
    } else {
      fetchInstallations();
    }
  }, [authToken, installationIdParam]);

  // Opdater enhed baseret på testtype
  useEffect(() => {
    let unit = '';
    switch (formData.test_type) {
      case TestType.RCD:
        unit = 'ms';
        break;
      case TestType.ISOLATION:
        unit = 'MΩ';
        break;
      case TestType.CONTINUITY:
        unit = 'Ω';
        break;
      case TestType.EARTHING:
        unit = 'Ω';
        break;
      case TestType.SHORT_CIRCUIT:
        unit = 'A';
        break;
      default:
        unit = '';
    }
    setFormData(prev => ({ ...prev, unit }));
  }, [formData.test_type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'value') {
      const numValue = parseFloat(value);
      // Validér, at værdien er et tal
      if (isNaN(numValue) && value !== '') {
        setValueError('Værdien skal være et tal');
      } else {
        setValueError('');
        setFormData(prev => ({ ...prev, [name]: value ? numValue : 0 }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleInstallationChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const installationId = e.target.value;
    setFormData(prev => ({ ...prev, installation_id: installationId }));
    
    if (installationId && authToken) {
      try {
        const installation = await getInstallation(authToken, installationId);
        setSelectedInstallation(installation);
      } catch (err) {
        console.error('Error fetching installation details:', err);
      }
    } else {
      setSelectedInstallation(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setTestImage(file);
      
      // Opret et preview af billedet
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;

    // Validering
    if (!formData.installation_id) {
      setError('Vælg venligst en installation');
      return;
    }

    if (valueError) {
      setError('Ret venligst fejlene i formularen');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload billede, hvis der er valgt et
      let imagePath = '';
      if (testImage) {
        const uploadResult = await uploadTestImage(authToken, testImage);
        imagePath = uploadResult.image_path;
      }

      // Opret test med billedsti, hvis der er uploadet et billede
      const testData = {
        ...formData,
        image_path: imagePath || formData.image_path,
      };

      await createTest(authToken, testData);
      
      // Naviger tilbage til installationsdetaljer eller oversigt
      if (formData.installation_id) {
        navigate(`/installations/${formData.installation_id}`);
      } else {
        navigate('/tests');
      }
    } catch (err) {
      console.error('Error creating test:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Der opstod en fejl ved oprettelse af testen');
      }
      setIsSubmitting(false);
    }
  };

  // Hjælpefunktioner til at vise hints baseret på testtype
  const getTestTypeHint = (): { hint: string; min: number; max: number; typical: string } => {
    switch (formData.test_type) {
      case TestType.RCD:
        return {
          hint: 'Udløsningstid for RCD. Bør være under 300ms for Type A RCD.',
          min: 0,
          max: 1000,
          typical: '30-300'
        };
      case TestType.ISOLATION:
        return {
          hint: 'Isolationsmodstand. Bør være over 1 MΩ.',
          min: 0,
          max: 2000,
          typical: '1-200'
        };
      case TestType.CONTINUITY:
        return {
          hint: 'Kontinuitetsmodstand. Bør være under 1 Ω.',
          min: 0,
          max: 100,
          typical: '0.1-1.0'
        };
      case TestType.EARTHING:
        return {
          hint: 'Jordmodstand. Bør normalt være under 100 Ω.',
          min: 0,
          max: 1000,
          typical: '5-100'
        };
      case TestType.SHORT_CIRCUIT:
        return {
          hint: 'Kortslutningsstrøm. Skal være høj nok til at sikring fungerer.',
          min: 0,
          max: 10000,
          typical: '100-2000'
        };
      default:
        return {
          hint: 'Indtast måleværdien.',
          min: 0,
          max: 1000,
          typical: ''
        };
    }
  };

  const typeHint = getTestTypeHint();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Registrer Ny Test</h1>
          <div>
            {formData.installation_id && (
              <Link
                to={`/installations/${formData.installation_id}`}
                className="inline-flex items-center px-4 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Tilbage til installation
              </Link>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Fejl! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-4">
            <h2 className="text-lg font-medium text-blue-800">Testinformation</h2>
            <p className="text-sm text-blue-600">Udfyld venligst alle påkrævede felter (*)</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4">
            {/* Installation vælger */}
            <div className="mb-6">
              <label htmlFor="installation_id" className="block text-sm font-medium text-gray-700 mb-1">
                Installation <span className="text-red-500">*</span>
              </label>
              {isLoadingInstallations ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                  <span className="text-sm">Indlæser installationer...</span>
                </div>
              ) : installationIdParam ? (
                <div className="flex items-center text-gray-700 bg-gray-100 px-3 py-2 rounded border border-gray-300">
                  {selectedInstallation ? (
                    <>
                      <span className="font-medium">{selectedInstallation.id}</span>
                      <span className="mx-2">-</span>
                      <span>{selectedInstallation.address}</span>
                      <span className="mx-2">-</span>
                      <span className="text-gray-600">{selectedInstallation.customer_name}</span>
                    </>
                  ) : (
                    <span>Installation: {installationIdParam}</span>
                  )}
                </div>
              ) : (
                <select
                  id="installation_id"
                  name="installation_id"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={formData.installation_id}
                  onChange={handleInstallationChange}
                  required
                >
                  <option value="">Vælg installation</option>
                  {installations.map((installation) => (
                    <option key={installation.id} value={installation.id}>
                      {installation.id} - {installation.address} - {installation.customer_name}
                    </option>
                  ))}
                </select>
              )}

              {selectedInstallation && (
                <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="text-sm">
                    <div className="font-medium text-gray-700">Installation:</div>
                    <div className="text-gray-600">{selectedInstallation.id}</div>
                  </div>
                  <div className="text-sm mt-1">
                    <div className="font-medium text-gray-700">Adresse:</div>
                    <div className="text-gray-600">{selectedInstallation.address}</div>
                  </div>
                  <div className="text-sm mt-1">
                    <div className="font-medium text-gray-700">Kunde:</div>
                    <div className="text-gray-600">{selectedInstallation.customer_name}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Test type */}
              <div className="col-span-1">
                <label htmlFor="test_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Testtype <span className="text-red-500">*</span>
                </label>
                <select
                  id="test_type"
                  name="test_type"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={formData.test_type}
                  onChange={handleChange}
                  required
                >
                  {Object.values(TestType).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Måleværdi */}
              <div className="col-span-1">
                <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
                  Måleværdi <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="number"
                    name="value"
                    id="value"
                    className={`focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 ${
                      valueError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    placeholder={typeHint.typical}
                    min={typeHint.min}
                    max={typeHint.max}
                    step="any"
                    value={formData.value || ''}
                    onChange={handleChange}
                    required
                  />
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    {formData.unit}
                  </span>
                </div>
                {valueError ? (
                  <p className="mt-1 text-sm text-red-600">{valueError}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">{typeHint.hint}</p>
                )}
              </div>

              {/* Noter */}
              <div className="col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Noter
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                  placeholder="Eventuelle bemærkninger til testen, f.eks. '30 mA Type A RCD', 'Kap. 6', etc."
                  value={formData.notes}
                  onChange={handleChange}
                ></textarea>
              </div>

              {/* Billede upload */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Testbillede</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <div className="mb-3">
                        <img
                          src={imagePreview}
                          alt="Test preview"
                          className="mx-auto h-40 w-auto object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setTestImage(null);
                            setImagePreview(null);
                          }}
                          className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none"
                        >
                          Fjern billede
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="image-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                          >
                            <span>Upload et billede</span>
                            <input
                              id="image-upload"
                              name="image-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </label>
                          <p className="pl-1">eller træk og slip</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF op til 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-8 pt-5 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
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
                  'Gem Test'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TestCreatePage;