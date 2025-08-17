
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import { useAppData } from '../context/DataContext';
import { MachineStatus } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { machines, productionRecords, loading } = useAppData();

  if (loading) {
    return <LoadingSpinner />;
  }

  const totalProduction = productionRecords.reduce((acc, r) => acc + r.quantityProduced, 0);
  const runningMachines = machines.filter(m => m.status === MachineStatus.Running).length;
  const avgOee = machines.length > 0 ? (machines.reduce((acc, m) => acc + m.oee, 0) / machines.length).toFixed(1) : '0.0';
  const issuesDetected = machines.filter(m => m.status === MachineStatus.Error || m.status === MachineStatus.Maintenance).length;

  const machineStatusData = Object.values(MachineStatus).map(status => ({
    name: status,
    value: machines.filter(m => m.status === status).length,
  }));

  const productionByMachine = machines.map(machine => ({
    name: machine.name,
    production: productionRecords
        .filter(record => record.machineName === machine.name)
        .reduce((sum, record) => sum + record.quantityProduced, 0)
  }));

  const COLORS = {
      [MachineStatus.Running]: '#10B981', // Emerald 500
      [MachineStatus.Idle]: '#6B7280', // Gray 500
      [MachineStatus.Maintenance]: '#F59E0B', // Amber 500
      [MachineStatus.Error]: '#EF4444', // Red 500
  };

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Production (Units)" value={totalProduction.toLocaleString()} color="bg-blue-500" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>} />
        <StatCard title="Machines Running" value={`${runningMachines} / ${machines.length}`} color="bg-green-500" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
        <StatCard title="Average OEE" value={`${avgOee}%`} color="bg-purple-500" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} />
        <StatCard title="Issues Detected" value={issuesDetected.toString()} color="bg-red-500" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Production by Machine">
          <ResponsiveContainer>
            <BarChart data={productionByMachine} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} />
              <Legend />
              <Bar dataKey="production" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Machine Status">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={machineStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {machineStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as MachineStatus]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default Dashboard;
