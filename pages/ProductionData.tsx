
import React from 'react';
import DataTable from '../components/DataTable';
import { useAppData } from '../context/DataContext';
import { ProductionRecord } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductionData: React.FC = () => {
    const { productionRecords, loading } = useAppData();

    if (loading) {
        return <LoadingSpinner />;
    }

    const columns = [
        { key: 'timestamp' as keyof ProductionRecord, header: 'Timestamp', render: (item: ProductionRecord) => item.timestamp.toLocaleString() },
        { key: 'partId' as keyof ProductionRecord, header: 'Part ID' },
        { key: 'machineName' as keyof ProductionRecord, header: 'Machine Name' },
        { key: 'quantityProduced' as keyof ProductionRecord, header: 'Quantity Produced' },
        { key: 'scrapCount' as keyof ProductionRecord, header: 'Scrap Count' },
        { 
            key: 'scrapRate' as keyof ProductionRecord,
            header: 'Scrap Rate (%)',
            render: (item: ProductionRecord) => {
                const rate = item.quantityProduced > 0 ? ((item.scrapCount / (item.quantityProduced + item.scrapCount)) * 100).toFixed(2) : '0.00';
                const rateValue = parseFloat(rate);
                const color = rateValue > 2 ? 'text-red-400' : rateValue > 1 ? 'text-yellow-400' : 'text-green-400';
                return <span className={color}>{rate}%</span>;
            }
        },
        { key: 'cycleTime' as keyof ProductionRecord, header: 'Cycle Time (s)' },
    ];

    return (
        <div>
            <DataTable columns={columns} data={productionRecords} />
        </div>
    );
};

export default ProductionData;