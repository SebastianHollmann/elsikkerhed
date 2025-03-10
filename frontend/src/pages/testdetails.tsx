import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteTest, getTest } from '../api/tests';
import { useAuth } from '../contexts/AuthContext';
import { Test, TestStatus, TestType } from '../models/test';

const TestDetails: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const { authToken } = useAuth();
  const navigate = useNavigate();
  
  const [test, setTest] = useState<Test | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchTestData = async () => {
      if (!authToken || !testId) return;

      setIsLoading(true);
      setError(null);

      try {
        const testData = await getTest(authToken, testId);
        setTest(testData);
      } catch (err) {
        console.error('Error fetching test details:', err);
        setError('Der opstod en fejl ved hentning af testdetaljer');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestData();
  }, [authToken, testId]);

  const handleDelete = async () => {
    if (!authToken || !testId) return;

    setIsDeleting(true);
    try {
      await deleteTest(authToken, testId);
      navigate('/tests');
    } catch (err) {
      console.error('Error deleting test:', err);
      setError('Der opstod en fejl ved sletning af testen');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Formatér dato til dansk format
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Ikke angivet';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Funktion til at få baggrundfarve ud fra teststatus
  const getStatusColor = (status: TestStatus): string => {
    switch (status) {
      case TestStatus.PASS:
        return 'bg-green-100 text-green-800 border-green-200';
      case TestStatus.FAIL:
        return 'bg-red-100 text-red-800 border-red-200';
      case TestStatus.WARNING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Funktion til at få ikon baseret på testtype
  const getTestTypeIcon = (testType: TestType): React.ReactElement => {
    switch (testType) {
      case TestType.RCD:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        );
      case TestType.ISOLATION:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l.707.707L15.414 4a1 1 0 01-1.414 1.414l-2-2A1 1 0 0112 2zm0 10a1 1 0 01.707.293l.707.707 2-2a1 1 0 111.414 1.414l-2.828 2.828a1 1 0 01-1.414 0l-1.414-1.414A1 1 0 0112 12z" clipRule="evenodd" />
          </svg>
        );
      case TestType.CONTINUITY:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
          </svg>
        );
      case TestType.EARTHING:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
          </svg>
        );
      case TestType.SHORT_CIRCUIT:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v-1l1-1 1-1-.707-.707A6 6 0 118 2v6h2V7a5 5 0 10-5 5 1 1 0 01-2 0 7 7 0 117-7v1.243a6.001 6.001 0 01-6 6.243V14l-1 1-1 1H6v-1l1-1 1-1-.707-.707A6 6 0 118 8zm-2 4l1 1-1 1 4-4-4-4 1 1-1 1 4 4-4-4z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Fejl! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Bemærk: </strong>
          <span className="block sm:inline">Testen blev ikke fundet</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Bekræftelsesdialog til sletning */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bekræft sletning</h3>
            <p className="text-sm text-gray-600 mb-6">
              Er du sikker på, at du vil slette denne test? Denne handling kan ikke fortrydes.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                disabled={isDeleting}
              >
                Annuller
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                disabled={isDeleting}
              >
                {isDeleting ? 'Sletter...' : 'Ja, slet test'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">Test: {test.id}</h1>
            <span className={`ml-4 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(test.status as TestStatus)}`}>
              {test.status}
            </span>
          </div>
          <p className="text-gray-600">
            {test.test_type} - {formatDate(test.timestamp)}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link
            to={`/tests/${testId}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Rediger
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Slet
          </button>
          <Link
            to={`/installations/${test.installation_id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Til Installation
          </Link>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-blue-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Testdetaljer</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Detaljeret information om testen</p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Test ID</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">{test.id}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Installations ID</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                <Link to={`/installations/${test.installation_id}`} className="text-blue-600 hover:underline">
                  {test.installation_id}
                </Link>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Test type</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">{test.test_type}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Måleværdi</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                {test.value} {test.unit}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm sm:col-span-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(test.status as TestStatus)}`}>
                  {test.status}
                </span>
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Testtidspunkt</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">{formatDate(test.timestamp)}</dd>
            </div>
            {test.technician && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Tekniker</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">{test.technician}</dd>
              </div>
            )}
            {test.notes && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Noter</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">{test.notes}</dd>
              </div>
            )}
            {test.image_path && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Billede</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                  <img 
                    src={test.image_path} 
                    alt="Test billede" 
                    className="max-w-md rounded-md shadow-sm" 
                  />
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default TestDetails; 