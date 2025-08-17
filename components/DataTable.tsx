
import React from 'react';

interface DataTableProps<T> {
  columns: { key: keyof T; header: string; render?: (item: T) => React.ReactNode }[];
  data: T[];
}

const DataTable = <T extends { id: string | number }>(
    { columns, data }: DataTableProps<T>
) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)} className="p-4 font-semibold text-sm text-gray-300 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-700/50 transition-colors">
                {columns.map((col) => (
                  <td key={String(col.key)} className="p-4 text-gray-200 whitespace-nowrap">
                    {col.render ? col.render(item) : String(item[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
