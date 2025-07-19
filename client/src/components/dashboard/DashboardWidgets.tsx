import React from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * MetricCard: shows a single statistic with an icon.
 */
export interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export function MetricCard({ title, value, icon: Icon }: MetricCardProps) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 flex items-center">
      <div className="p-3 bg-blue-100 rounded-full">
        <Icon className="w-6 h-6 text-blue-500" />
      </div>
      <div className="ml-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
}

/**
 * ChartCard: wraps any chart with a title and card styling.
 */
export interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

export function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

/**
 * DataTable: generic table with a title, column definitions, and data.
 */
export interface DataTableColumn<T> {
  header: string;
  accessor: keyof T;
}

export interface DataTableProps<T> {
  title: string;
  columns: DataTableColumn<T>[];
  data: T[];
}

export function DataTable<T>({ title, columns, data }: DataTableProps<T>) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-x-auto">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>
      <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.header} className="px-4 py-2 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              {columns.map(col => (
                <td key={String(col.accessor)} className="px-4 py-2">
                  {String(row[col.accessor] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
