import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency } from '../utils/time';

interface ChartData {
    label: string;
    value: number;
}

interface ComparisonChartProps {
    data: ChartData[];
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ data }) => {
    const { language } = useLanguage();
    const maxValue = Math.max(...data.map(d => d.value), 0);

    if (data.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500">No data to display</div>;
    }

    return (
        <div className="space-y-4">
            {data.map(item => (
                <div key={item.label} className="grid grid-cols-3 gap-4 items-center">
                    <div className="text-sm text-gray-300 truncate" title={item.label}>{item.label}</div>
                    <div className="col-span-2 group">
                        <div className="flex items-center">
                            <div 
                                className="h-6 bg-[var(--primary-color)] rounded-r-md transition-all duration-500"
                                style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
                            ></div>
                            <span className="text-xs font-mono text-white ps-2">{formatCurrency(item.value, language)}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
