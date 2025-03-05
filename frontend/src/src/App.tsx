// src/App.tsx
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import InstallationCreate from './pages/InstallationCreate';
import InstallationDetails from './pages/InstallationDetails';
import InstallationEdit from './pages/InstallationEdit';
import Installations from './pages/Installations';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import TestCreate from './pages/TestCreate';
import TestDetails from './pages/TestDetails';
import TestEdit from './pages/TestEdit';
import TestsList from './pages/TestsList';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            <Route path="installations">
              <Route index element={<Installations />} />
              <Route path="new" element={<InstallationCreate />} />
              <Route path=":installationId" element={<InstallationDetails />} />
              <Route path=":installationId/edit" element={<InstallationEdit />} />
            </Route>
            
            <Route path="tests">
              <Route index element={<TestsList />} />
              <Route path="new" element={<TestCreate />} />
              <Route path=":testId" element={<TestDetails />} />
              <Route path=":testId/edit" element={<TestEdit />} />
            </Route>
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;