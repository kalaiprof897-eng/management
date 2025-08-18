

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import ChartCard from '../components/ChartCard';
import DataTable from '../components/DataTable';
import { useAppData } from '../context/DataContext';
import { Machine, CncTimeLog } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import AddCncTimeModal from '../components/AddCncTimeModal';

const CncRunningTime: React.FC = () => {
    const { machines, cncTimeLogs, loading, setupRequired, showNotification, isCncLogSchemaMissing, refetchData } = useAppData();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (loading) {
        return <LoadingSpinner />;
    }
    
    const isAddFeatureDisabled = setupRequired || isCncLogSchemaMissing;

    const handleAddClick = () => {
        if (isAddFeatureDisabled) {
            showNotification('Database update required for this feature. Please go to the Setup page.', 'error');
        } else {
            setIsModalOpen(true);
        }
    };
    
    const chartData = machines.map(m => ({
        name: m.id,
        'Running Time (h)': m.runningTime,
        'Idle Time (h)': m.idleTime,
    }));

    const machineUtilizationColumns = [
        { key: 'name', header: 'Machine' },
        { key: 'runningTime', header: 'Running Time (h)' },
        { key: 'idleTime', header: 'Idle Time (h)' },
        { 
            key: 'utilization', 
            header: 'Utilization (%)',
            render: (item: Machine) => {
                const total = item.runningTime + item.idleTime;
                const utilization = total > 0 ? ((item.runningTime / total) * 100).toFixed(1) : '0.0';
                return `${utilization}%`;
            }
        },
        { key: 'status', header: 'Current Status' },
    ];
    
    const recentLogsColumns = [
        { key: 'inTime', header: 'In Time', render: (item: CncTimeLog) => item.inTime.toLocaleString() },
        { key: 'outTime', header: 'Out Time', render: (item: CncTimeLog) => item.outTime.toLocaleString() },
        { key: 'machineName', header: 'Machine' },
        { key: 'workOrderNumber', header: 'Work Order #' },
        { key: 'workPieceName', header: 'Work Piece' },
        { key: 'quantity', header: 'Qty' },
    ]

    return (
        <div className="space-y-8">
            {setupRequired && (
                <div className="bg-yellow-800/50 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg flex items-center justify-between" role="alert">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <div>
                            <strong className="font-bold">Database Update Required!</strong>
                            <span className="block sm:inline ml-1">Go to the <Link to="/setup" className="font-bold underline hover:text-yellow-100">Setup Page</Link> to apply the latest updates.</span>
                        </div>
                    </div>
                    <button onClick={() => refetchData()} disabled={loading} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-wait flex-shrink-0">
                        Re-check
                    </button>
                </div>
            )}
            {isCncLogSchemaMissing && !setupRequired && (
                 <div className="bg-blue-900/50 border border-blue-700 text-blue-200 px-4 py-3 rounded-lg flex items-center justify-between" role="alert">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <div>
                            <strong className="font-bold">'Add CNC Time' requires a database update.</strong>
                            <span className="block sm:inline ml-1">The `cnc_time_logs` table is missing. Go to the <Link to="/setup" className="font-bold underline hover:text-blue-100">Setup Page</Link> to create it.</span>
                        </div>
                    </div>
                     <button onClick={() => refetchData()} disabled={loading} className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-1 px-3 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-wait flex-shrink-0">
                        Re-check
                    </button>
                </div>
            )}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Machine Utilization</h2>
                <button
                    onClick={handleAddClick}
                    title={isAddFeatureDisabled ? "Database update required for this feature" : "Add a new CNC time log"}
                    className={`text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center space-x-2 ${
                        isAddFeatureDisabled 
                        ? 'bg-teal-500 opacity-60' 
                        : 'bg-teal-500 hover:bg-teal-600'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Add CNC Time</span>
                </button>
            </div>
            
            <ChartCard title="Machine Utilization (Last 24h)">
                <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} cursor={{fill: '#374151'}}/>
                        <Legend />
                        <Bar dataKey="Running Time (h)" stackId="a" fill="#10B981" />
                        <Bar dataKey="Idle Time (h)" stackId="a" fill="#6B7280" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            <DataTable columns={machineUtilizationColumns} data={machines} />

            <div className="mt-12">
                <h2 className="text-2xl font-bold text-white mb-4">Recent Time Logs</h2>
                <DataTable columns={recentLogsColumns} data={cncTimeLogs} />
            </div>

            <AddCncTimeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default CncRunningTime;