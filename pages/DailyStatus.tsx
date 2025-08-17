import React, { useState, useCallback } from 'react';
import { useAppData } from '../context/DataContext';
import { generateDailySummary } from '../services/geminiService';
import { ProductionRecord } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const DailyStatus: React.FC = () => {
  const { productionRecords, loading } = useAppData();
  const [summary, setSummary] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleGenerateSummary = useCallback(async () => {
    if (!productionRecords || productionRecords.length === 0) {
        setGenerationError("No production data available to generate a summary.");
        return;
    }
    setIsGenerating(true);
    setGenerationError(null);
    setSummary('');
    try {
      const result = await generateDailySummary(productionRecords);
      setSummary(result);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setGenerationError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [productionRecords]);

  // Use a slice of recent activities for display
  const recentActivities = productionRecords.slice(0, 10);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* AI Summary Section */}
      <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">AI-Powered Daily Summary</h2>
          <button
            onClick={handleGenerateSummary}
            disabled={isGenerating}
            className="bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate Summary'
            )}
          </button>
        </div>
        <div className="bg-gray-900 p-4 rounded-md min-h-[300px] text-gray-300 whitespace-pre-wrap leading-relaxed">
          {generationError && <p className="text-red-400">{generationError}</p>}
          {summary || (!isGenerating && !generationError && "Click 'Generate Summary' to get an AI-powered analysis of today's production.")}
        </div>
      </div>

      {/* Recent Activity Feed */}
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
    </div>
  );
};

export default DailyStatus;