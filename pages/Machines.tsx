
import React from 'react';
import { useAppData } from '../context/DataContext';
import { Machine, MachineStatus } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const MachineCard: React.FC<{ machine: Machine }> = ({ machine }) => {
  const getStatusIndicatorColor = (status: MachineStatus) => {
    switch (status) {
      case MachineStatus.Running: return 'bg-green-500';
      case MachineStatus.Idle: return 'bg-gray-500';
      case MachineStatus.Maintenance: return 'bg-yellow-500';
      case MachineStatus.Error: return 'bg-red-500';
    }
  };

  const statusColor = getStatusIndicatorColor(machine.status);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col justify-between transition-all hover:shadow-xl hover:translate-y-[-4px]">
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-white">{machine.name}</h3>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor} text-white`}>
              {machine.status}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-1">{machine.id}</p>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <span className="text-sm text-gray-400">Current Part</span>
          <p className="font-semibold text-white">{machine.currentPart || 'N/A'}</p>
        </div>
        <div className="flex justify-between items-center">
            <div>
                <span className="text-sm text-gray-400">Running Time</span>
                <p className="font-semibold text-white">{machine.runningTime}h</p>
            </div>
            <div>
                <span className="text-sm text-gray-400">OEE</span>
                <p className="font-semibold text-white">{machine.oee}%</p>
            </div>
        </div>
      </div>
    </div>
  );
};

const Machines: React.FC = () => {
    const { machines, loading } = useAppData();

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {machines.map(machine => (
                <MachineCard key={machine.id} machine={machine} />
            ))}
        </div>
    );
};

export default Machines;
