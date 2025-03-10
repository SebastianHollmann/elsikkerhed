import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTasks } from '../api/tasks';
import { useAuth } from '../contexts/AuthContext';
import { Task, TaskPriority, TaskStatus } from '../models/task';

const TasksList: React.FC = () => {
  const { authToken } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  useEffect(() => {
    const fetchTasks = async () => {
      if (!authToken) return;

      setIsLoading(true);
      setError(null);

      try {
        const tasksData = await getTasks(authToken);
        setTasks(tasksData);
        setFilteredTasks(tasksData);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Der opstod en fejl ved hentning af opgaver');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [authToken]);

  useEffect(() => {
    // Apply filters
    let result = tasks;

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(lowerSearchTerm) ||
        (task.description && task.description.toLowerCase().includes(lowerSearchTerm)) ||
        (task.assigned_to && task.assigned_to.toLowerCase().includes(lowerSearchTerm))
      );
    }

    if (statusFilter) {
      result = result.filter(task => task.status === statusFilter);
    }

    if (priorityFilter) {
      result = result.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(result);
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  // Formatér dato til dansk format
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Ikke angivet';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Funktion til at få baggrundfarve ud fra opgavestatus
  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-800 border-green-200';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case TaskStatus.PLANNED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case TaskStatus.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Funktion til at få baggrundfarve ud fra prioritet
  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case TaskPriority.URGENT:
        return 'bg-red-100 text-red-800 border-red-200';
      case TaskPriority.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case TaskPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case TaskPriority.LOW:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
        <h1 className="text-2xl font-bold">Opgaver</h1>
        <Link
          to="/tasks/new"
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Ny Opgave
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
              placeholder="Søg efter titel, beskrivelse eller tildelt person..."
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
              <option value={TaskStatus.PLANNED}>Planlagt</option>
              <option value={TaskStatus.IN_PROGRESS}>I gang</option>
              <option value={TaskStatus.COMPLETED}>Afsluttet</option>
              <option value={TaskStatus.CANCELLED}>Annulleret</option>
            </select>
          </div>
          <div>
            <label htmlFor="priorityFilter" className="block text-sm font-medium text-gray-700 mb-1">Prioritet</label>
            <select
              id="priorityFilter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Alle prioriteter</option>
              <option value={TaskPriority.LOW}>Lav</option>
              <option value={TaskPriority.MEDIUM}>Medium</option>
              <option value={TaskPriority.HIGH}>Høj</option>
              <option value={TaskPriority.URGENT}>Akut</option>
            </select>
          </div>
        </div>
      </div>

      {/* Opgaveliste */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        {filteredTasks.length === 0 ? (
          <div className="px-4 py-5 text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="mt-2">Ingen opgaver fundet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opgave
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status / Prioritet
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Installation
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tildelt
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Handlinger</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <React.Fragment>
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {task.description}
                            </div>
                          )}
                        </React.Fragment>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status as TaskStatus)}`}>
                        {task.status}
                      </span>
                      <span className={`mt-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority as TaskPriority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.installation_id ? (
                        <Link to={`/installations/${task.installation_id}`} className="text-blue-600 hover:text-blue-900">
                          {task.installation_id}
                        </Link>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.assigned_to || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(task.due_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/tasks/${task.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Detaljer
                      </Link>
                      <Link
                        to={`/tasks/${task.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
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

export default TasksList;