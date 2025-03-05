// src/pages/Installations.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getInstallations } from '../api/installations';
import { useAuth } from '../contexts/AuthContext';
import { Installation } from '../models/installation';

const Installations: React.FC = () => {
  const { authToken } = useAuth();
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchInstallations = async () => {
      if (!authToken) return;

      setIsLoading(true);
      setError(null);

      try {
        // Hent alle installationer (i et rigtigt projekt ville vi implementere server-side paginering)
        const installationsData = await getInstallations(authToken, 0, 100);
        setInstallations(installationsData);
      } catch (err) {
        console.error('Error fetching installations:', err);
        setError('Der opstod en fejl ved hentning af installationer');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstallations();
  }, [authToken]);

  // Filtrer installationer baseret på søgeord
  const filteredInstallations = installations.filter(
    (installation) =>
      installation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installation.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installation.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Beregn paginering
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInstallations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInstallations.length / itemsPerPage);

  // Formatér dato til dansk format
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Ikke angivet';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
        <h1 className="text-2xl font-bold">Installationer</h1>
        <Link
          to="/installations/new"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
        >
          + Ny Installation
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Fejl! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Søgefelt */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Søg efter installations-ID, adresse eller kunde..."
            className="pl-10 p-2 border border-gray-300 rounded w-full"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Nulstil til første side ved søgning
            }}
          />
        </div>
      </div>

      {/* Installationers tabel */}
      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Kunde
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Adresse
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Installationsdato
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Seneste Inspektion
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Handlinger</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  {searchTerm ? 'Ingen installationer matcher din søgning' : 'Ingen installationer fundet'}
                </td>
              </tr>
            ) : (
              currentItems.map((installation) => (
                <tr key={installation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {installation.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {installation.customer_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {installation.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(installation.installation_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(installation.last_inspection)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/installations/${installation.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Detaljer
                    </Link>
                    <Link
                      to={`/installations/${installation.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Rediger
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginering */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div>
            <span className="text-sm text-gray-700">
              Viser {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredInstallations.length)} af{' '}
              {filteredInstallations.length} installationer
            </span>
          </div>
          <div className="flex">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 mx-1 rounded ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Forrige
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 mx-1 rounded ${
                  currentPage === index + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 mx-1 rounded ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Næste
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Installations;