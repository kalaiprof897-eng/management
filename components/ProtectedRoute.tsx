import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DataProvider, useAppData } from '../context/DataContext';
import Sidebar from './Sidebar';
import Header from './Header';
import Notification from './Notification';

const AppLayoutContent: React.FC = () => {
  const { notification, hideNotification } = useAppData();
  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
    </div>
  );
};


const ProtectedRoute: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DataProvider>
      <AppLayoutContent />
    </DataProvider>
  );
};

export default ProtectedRoute;