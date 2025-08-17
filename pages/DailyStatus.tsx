import React from 'react';
import { useAppData } from '../context/DataContext';
import { ProductionRecord } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const DailyStatus: React.FC = () => {
  const { productionRecords, loading } = useAppData();

  // Use a slice of recent activities for display
  const recentActivities = productionRecords.slice(0, 15);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {recentActivities.length > 0 ? recentActivities.map((record: ProductionRecord) => (
          <div key={record.id} className="flex items-start space-x-3">
            <div className="bg-blue-500 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold">{record.partId} batch completed on {record.machineName}</p>
              <p className="text-sm text-gray-400">{record.quantityProduced} units, {record.scrapCount} scrap</p>
              <p className="text-xs text-gray-500">{record.timestamp.toLocaleTimeString()}</p>
            </div>
          </div>
        )) : <p className="text-gray-400">No recent production data found.</p>}
      </div>
    </div>
  );
};

export default DailyStatus;
