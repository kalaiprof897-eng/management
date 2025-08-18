
import React from 'react';
import DataTable from '../components/DataTable';
import { useAppData } from '../context/DataContext';
import { Tool, ToolStatus } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const ToolInventory: React.FC = () => {
    const { tools, loading } = useAppData();

    if (loading) {
        return <LoadingSpinner />;
    }
    
    const getStatusColor = (status: ToolStatus) => {
        switch (status) {
            case ToolStatus.Active: return 'bg-green-500 text-green-100';
            case ToolStatus.Inactive: return 'bg-gray-500 text-gray-100';
            case ToolStatus.NeedsReplacement: return 'bg-red-500 text-red-100';
            default: return 'bg-gray-600';
        }
    }

    const columns = [
        { key: 'id', header: 'Tool ID' },
        { key: 'type', header: 'Type' },
        { 
            key: 'remainingLife', 
            header: 'Remaining Life',
            render: (item: Tool) => {
                const life = item.remainingLife;
                let bgColor = 'bg-green-500';
                if (life < 20) bgColor = 'bg-red-500';
                else if (life < 50) bgColor = 'bg-yellow-500';
                return (
                    <div className="relative w-full bg-gray-600 rounded-full h-4 my-1">
                        <div className={`${bgColor} h-4 rounded-full`} style={{ width: `${life}%` }}></div>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">{life}%</span>
                    </div>
                )
            }
        },
        { key: 'location', header: 'Location' },
        { 
            key: 'status', 
            header: 'Status',
            render: (item: Tool) => (
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                </span>
            )
        },
    ];

    return (
        <div>
            <DataTable columns={columns} data={tools} />
        </div>
    );
};

export default ToolInventory;
