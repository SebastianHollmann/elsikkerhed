import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllTests } from '../api/tests';
import { useAuth } from '../contexts/AuthContext';
import { Test, TestStatus, TestType } from '../models/test';

// Define an extended Test interface that includes optional fields we're using
interface ExtendedTest extends Test {
  technician?: string;
  notes?: string;
}

const TestsList: React.FC = () => {
  const { authToken } = useAuth();
  const [tests, setTests] = useState<ExtendedTest[]>([]);
  const [filteredTests, setFilteredTests] = useState<ExtendedTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    const fetchTests = async () => {
      if (!authToken) return;

      setIsLoading(true);
      setError(null);

      try {
        const testsData = await getAllTests(authToken);
        setTests(testsData as ExtendedTest[]);
        setFilteredTests(testsData as ExtendedTest[]);
      } catch (err) {
        console.error('Error fetching tests:', err);
        setError('Der opstod en fejl ved hentning af tests');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, [authToken]);

  useEffect(() => {
    // Apply filters
    let result = tests;

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(test => 
        test.id.toString().toLowerCase().includes(lowerSearchTerm) ||
        test.installation_id.toString().toLowerCase().includes(lowerSearchTerm) ||
        (test.technician && test.technician.toLowerCase().includes(lowerSearchTerm))
      );
    }

    if (statusFilter) {
      result = result.filter(test => test.status === statusFilter);
    }

    if (typeFilter) {
      result = result.filter(test => test.test_type === typeFilter);
    }

    setFilteredTests(result);
  }, [tests, searchTerm, statusFilter, typeFilter]);

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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Alle Tests</h1>
        <Link
          to="/tests/new"
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Ny Test
        </Link>
      </div>

      {/* Filtre */}
      <div className="bg-white shadow rounded-lg mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Søg</label>
            <input
              type="text"
              id="search"
              placeholder="Søg efter test ID, installations ID eller tekniker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Alle statusser</option>
              <option value={TestStatus.PASS}>Godkendt</option>
              <option value={TestStatus.WARNING}>Advarsel</option>
              <option value={TestStatus.FAIL}>Ikke godkendt</option>
            </select>
          </div>
          <div>
            <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
            <select
              id="typeFilter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Alle typer</option>
              <option value={TestType.RCD}>RCD</option>
              <option value={TestType.ISOLATION}>Isolation</option>
              <option value={TestType.CONTINUITY}>Kontinuitet</option>
              <option value={TestType.EARTHING}>Jordforbindelse</option>
              <option value={TestType.SHORT_CIRCUIT}>Kortslutning</option>
            </select>
          </div>
        </div>
      </div>

      {/* Test liste */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {filteredTests.length === 0 ? (
          <div className="px-4 py-5 text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">Ingen tests fundet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Installation
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Værdi
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dato
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Handlinger</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {test.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center text-gray-600">
                          {getTestTypeIcon(test.test_type as TestType)}
                        </div>
                        <div className="ml-2 text-sm text-gray-900">
                          {test.test_type}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-900">
                      <Link to={`/installations/${test.installation_id}`}>
                        {test.installation_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {test.value} {test.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(test.status as TestStatus)}`}>
                        {test.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(test.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/tests/${test.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                        Detaljer
                      </Link>
                      <Link to={`/tests/${test.id}/edit`} className="text-blue-600 hover:text-blue-900">
                        Rediger
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestsList; 