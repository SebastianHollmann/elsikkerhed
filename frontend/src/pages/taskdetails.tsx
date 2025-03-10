// src/pages/taskdetails.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteTask, getTask } from '../api/tasks';
import { useAuth } from '../contexts/AuthContext';
import { Task, TaskPriority, TaskStatus } from '../models/task';

const TaskDetails: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { authToken } = useAuth();
  const navigate = useNavigate();
  
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchTaskData = async () => {
      if (!authToken || !taskId) return;

      setIsLoading(true);
      setError(null);

      try {
        const taskData = await getTask(authToken, taskId);
        setTask(taskData);
      } catch (err) {
        console.error('Error fetching task details:', err);
        setError('Der opstod en fejl ved hentning af opgavedetaljer');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskData();
  }, [authToken, taskId]);

  const handleDelete = async () => {
    if (!authToken || !taskId) return;

    setIsDeleting(true);
    try {
      await deleteTask(authToken, taskId);
      navigate('/tasks');
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Der opstod en fejl ved sletning af opgaven');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Formatér dato til dansk format
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Ikke angivet';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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

  if (!task) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Bemærk: </strong>
          <span className="block sm:inline">Opgaven blev ikke fundet</span>
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
              Er du sikker på, at du vil slette opgaven "{task.title}"? Denne handling kan ikke fortrydes.
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
                {isDeleting ? 'Sletter...' : 'Ja, slet opgave'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">{task.title}</h1>
            <span className={`ml-4 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(task.status as TaskStatus)}`}>
              {task.status}
            </span>
          </div>
          <div className="flex items-center mt-1">
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getPriorityColor(task.priority as TaskPriority)}`}>
              {task.priority}
            </span>
            {task.installation_id && (
              <Link to={`/installations/${task.installation_id}`} className="ml-4 text-blue-600 hover:text-blue-900">
                Installation: {task.installation_id}
              </Link>
            )}
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link
            to={`/tasks/${taskId}/edit`}
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
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-blue-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Opgavedetaljer</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Detaljeret information om opgaven</p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Beskrivelse</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                {task.description || 'Ingen beskrivelse'}
              </dd>
            </div>
            
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm sm:col-span-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status as TaskStatus)}`}>
                  {task.status}
                </span>
              </dd>
            </div>
            
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Prioritet</dt>
              <dd className="mt-1 text-sm sm:col-span-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority as TaskPriority)}`}>
                  {task.priority}
                </span>
              </dd>
            </div>
            
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Tildelt til</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                {task.assigned_to || 'Ikke tildelt'}
              </dd>
            </div>
            
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Installation</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                {task.installation_id ? (
                  <Link to={`/installations/${task.installation_id}`} className="text-blue-600 hover:text-blue-900">
                    {task.installation_id}
                  </Link>
                ) : (
                  'Ingen tilknyttet installation'
                )}
              </dd>
            </div>
            
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Oprettet</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                {formatDate(task.created_date)}
              </dd>
            </div>
            
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Deadline</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                {formatDate(task.due_date)}
              </dd>
            </div>
            
            {task.completed_date && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Afsluttet</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                  {formatDate(task.completed_date)}
                </dd>
              </div>
            )}
            
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Estimeret tid</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                {task.estimated_hours ? `${task.estimated_hours} timer` : 'Ikke angivet'}
              </dd>
            </div>
            
            {task.actual_hours && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Faktisk tid</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                  {`${task.actual_hours} timer`}
                </dd>
              </div>
            )}
            
            {task.notes && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Noter</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                  {task.notes}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;