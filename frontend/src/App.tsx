// src/App.tsx
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/common/layout';
import ProtectedRoute from './components/common/protectedroute';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/dashboard';
import InstallationCreate from './pages/installationcreate';
import InstallationDetails from './pages/installationdetails';
import InstallationEdit from './pages/installationedit';
import Installations from './pages/installations';
import Login from './pages/login';
import NotFound from './pages/notfound';
import TestCreate from './pages/testcreate';
import TestDetails from './pages/testdetails';
import TestEdit from './pages/testedit';
import TestsList from './pages/testslist';

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