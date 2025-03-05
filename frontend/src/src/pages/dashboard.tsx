// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInstallations } from '../api/installations';
import { getAllTests } from '../api/tests';
import { useAuth } from '../contexts/AuthContext';
import { Installation } from '../models/installation';
import { Test, TestStatus } from '../models/test';

const Dashboard: React.FC = () => {
  const { authToken } = useAuth();
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [recentTests, setRecentTests] = useState<Test[]>([]);
  const [testStats, setTestStats] = useState({
    total: 0,
    pass: 0,
    fail: 0,
    warning: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!authToken) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch installations
        const installationsData = await getInstallations(authToken, 0, 5);
        setInstallations(installationsData);

        // Fetch recent tests
        const testsData = await getAllTests(authToken, 0, 20);
        setRecentTests(testsData.slice(0, 10)); // Only show 10 most recent

        // Calculate test statistics
        const total = testsData.length;
        const pass = testsData.filter(test => test.status === TestStatus.PASS).length;
        const fail = testsData.filter(test => test.status === TestStatus.FAIL).length;
        const warning = testsData.filter(test => test.status === TestStatus.WARNING).length;

        setTestStats({ total, pass, fail, warning });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Der opstod en fejl ved hentning af data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [authToken]);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4 mx-4" role="alert">
        <strong className="font-bold">Fejl! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Statistik kort */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="font-bold text-xl mb-2 text-gray-800">Antal Tests</div>
          <p className="text-3xl font-bold text-blue-600">{testStats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="font-bold text-xl mb-2 text-gray-800">Godkendte</div>
          <p className="text-3xl font-bold text-green-600">{testStats.pass}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="font-bold text-xl mb-2 text-gray-800">Advarsler</div>
          <p className="text-3xl font-bold text-yellow-600">{testStats.warning}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="font-bold text-xl mb-2 text-gray-800">Ikke Godkendt</div>
          <p className="text-3xl font-bold text-red-600">{testStats.fail}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seneste installationer */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-blue-500 text-white px-4 py-3 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Seneste Installationer</h2>
            <Link to="/installations" className="text-sm hover:underline">
              Se alle
            </Link>
          </div>
          
          {installations.length === 0 ? (
            <div className="p-4 text-gray-600">Ingen installationer fundet</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {installations.map((installation) => (
                <Link
                  key={installation.id}
                  to={`/installations/${installation.id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-blue-600 truncate">
                        {installation.customer_name}
                      </p>
                      <div className="text-sm text-gray-500">
                        ID: {installation.id}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-700">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {installation.address}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Sidst inspiceret: {formatDate(installation.last_inspection)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          <div className="bg-gray-50 px-4 py-3 text-center">
            <Link
              to="/installations/new"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Opret ny installation
            </Link>
          </div>
        </div>

        {/* Seneste tests */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-blue-500 text-white px-4 py-3 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Seneste Tests</h2>
            <Link to="/tests" className="text-sm hover:underline">
              Se alle
            </Link>
          </div>
          
          {recentTests.length === 0 ? (
            <div className="p-4 text-gray-600">Ingen tests fundet</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentTests.map((test) => (
                <div key={test.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-blue-600 truncate">
                      {test.test_type}
                    </p>
                    <div className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(test.status)}`}>
                      {test.status}
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-700">
                        Værdi: {test.value} {test.unit}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(test.timestamp)}
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Installation ID: <Link to={`/installations/${test.installation_id}`} className="text-blue-500 hover:underline">{test.installation_id}</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="bg-gray-50 px-4 py-3 text-center">
            <Link
              to="/tests/new"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Registrer ny test
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;