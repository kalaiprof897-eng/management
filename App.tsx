
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CncRunningTime from './pages/CncRunningTime';
import DailyStatus from './pages/DailyStatus';
import ProductionData from './pages/ProductionData';
import ToolInventory from './pages/ToolInventory';
import Machines from './pages/Machines';
import SetupGuide from './components/SetupGuide';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cnc-running-time" element={<CncRunningTime />} />
            <Route path="/daily-status" element={<DailyStatus />} />
            <Route path="/production-data" element={<ProductionData />} />
            <Route path="/tool-inventory" element={<ToolInventory />} />
            <Route path="/machines" element={<Machines />} />
            <Route path="/setup" element={<SetupGuide />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
