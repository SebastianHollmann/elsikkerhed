// src/pages/taskcreate.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getInstallation, getInstallations } from '../api/installations';
import { createTask } from '../api/tasks';
import { useAuth } from '../contexts/AuthContext';
import { Installation } from '../models/installation';
import { TaskCreate as TaskCreateType, TaskPriority, TaskStatus } from '../models/task';

const TaskCreate: React.FC = () => {
  const { authToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedInstallationId = searchParams.get('installation');
  
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [selectedInstallation, setSelectedInstallation] = useState<Installation | null>(null);
  const [isLoadingInstallations, setIsLoadingInstallations] = useState(false);
  
  const [formData, setFormData] = useState<Partial<TaskCreateType>>({
    title: '',
    description: '',
    status: TaskStatus.PLANNED,
    priority: TaskPriority.MEDIUM,
    installation_id: preselectedInstallationId || '',
    assigned_to: '',
    estimated_hours: undefined,
    notes: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstallations = async () => {
      if (!authToken) return;

      setIsLoadingInstallations(true);
      setError(null);

      try {
        const installationsData = await getInstallations(authToken);
        setInstallations(installationsData);
        
        // Hvis der er en forudvalgt installation, hent detaljerne
        if (preselectedInstallationId) {
          const installation = await getInstallation(authToken, preselectedInstallationId);
          setSelectedInstallation(installation);
        }
      } catch (err) {
        console.error('Error fetching installations:', err);
        setError('Der opstod en fejl ved hentning af installationer');
      } finally {
        setIsLoadingInstallations(false);
      }
    };

    fetchInstallations();
  }, [authToken, preselectedInstallationId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'estimated_hours') {
      setFormData(prev => ({ ...prev, [name]: value ? parseFloat(value) : undefined }));
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
        setSelectedInstallation(null);
      }
    } else {
      setSelectedInstallation(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;

    // Validate form
    if (!formData.title || !formData.status || !formData.priority) {
      setError('Udfyld venligst alle påkrævede felter');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Opret opgave
      const newTask = await createTask(authToken, formData as TaskCreateType);
      
      // Naviger til den nye opgave
      navigate(`/tasks/${newTask.id}`);
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Der opstod en fejl ved oprettelse af opgaven');
      setIsSubmitting(false);
    }
  };

  if (isLoadingInstallations) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Opret Ny Opgave</h1>
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
            <h2 className="text-lg font-medium text-blue-800">Opgaveinformation</h2>
            <p className="text-sm text-blue-600">Udfyld venligst alle påkrævede felter (*)</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4">
            {/* Titel */}
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Titel <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Angiv en titel for opgaven"
              />
            </div>

            {/* Beskrivelse */}
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Beskrivelse
              </label>
              <textarea
id="description"
name="description"
rows={3}
value={formData.description}
onChange={handleChange}
className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
placeholder="Beskriv opgaven i detaljer"
/>
</div>

<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
{/* Status */}
<div className="mb-4">
<label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
  Status <span className="text-red-500">*</span>
</label>
<select
  id="status"
  name="status"
  value={formData.status}
  onChange={handleChange}
  required
  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
>
  <option value={TaskStatus.PLANNED}>Planlagt</option>
  <option value={TaskStatus.IN_PROGRESS}>I gang</option>
  <option value={TaskStatus.COMPLETED}>Afsluttet</option>
  <option value={TaskStatus.CANCELLED}>Annulleret</option>
</select>
</div>

{/* Prioritet */}
<div className="mb-4">
<label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
  Prioritet <span className="text-red-500">*</span>
</label>
<select
  id="priority"
  name="priority"
  value={formData.priority}
  onChange={handleChange}
  required
  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
>
  <option value={TaskPriority.LOW}>Lav</option>
  <option value={TaskPriority.MEDIUM}>Medium</option>
  <option value={TaskPriority.HIGH}>Høj</option>
  <option value={TaskPriority.URGENT}>Akut</option>
</select>
</div>
</div>

{/* Installation */}
<div className="mb-4">
<label htmlFor="installation_id" className="block text-sm font-medium text-gray-700 mb-1">
Installation
</label>
<select
id="installation_id"
name="installation_id"
value={formData.installation_id || ''}
onChange={handleInstallationChange}
className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
>
<option value="">Vælg installation</option>
{installations.map((installation) => (
  <option key={installation.id} value={installation.id}>
    {installation.id} - {installation.address} - {installation.customer_name}
  </option>
))}
</select>

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

<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
{/* Tildelt til */}
<div className="mb-4">
<label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 mb-1">
  Tildelt til
</label>
<input
  type="text"
  id="assigned_to"
  name="assigned_to"
  value={formData.assigned_to || ''}
  onChange={handleChange}
  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
  placeholder="Angiv navn på ansvarlig person"
/>
</div>

{/* Estimeret tid */}
<div className="mb-4">
<label htmlFor="estimated_hours" className="block text-sm font-medium text-gray-700 mb-1">
  Estimeret tid (timer)
</label>
<input
  type="number"
  id="estimated_hours"
  name="estimated_hours"
  value={formData.estimated_hours || ''}
  onChange={handleChange}
  min="0"
  step="0.5"
  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
  placeholder="Estimeret tid i timer"
/>
</div>
</div>

{/* Deadline */}
<div className="mb-4">
<label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
Deadline
</label>
<input
type="date"
id="due_date"
name="due_date"
value={formData.due_date ? new Date(formData.due_date).toISOString().split('T')[0] : ''}
onChange={handleChange}
className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
/>
</div>

{/* Noter */}
<div className="mb-4">
<label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
Noter
</label>
<textarea
id="notes"
name="notes"
rows={3}
value={formData.notes || ''}
onChange={handleChange}
className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
placeholder="Eventuelle bemærkninger eller noter til opgaven"
/>
</div>

<div className="flex items-center justify-end space-x-3 mt-6 pt-5 border-t border-gray-200">
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
    Opretter...
  </>
) : (
  'Opret Opgave'
)}
</button>
</div>
</form>
</div>
</div>
</div>
);
};

export default TaskCreate;