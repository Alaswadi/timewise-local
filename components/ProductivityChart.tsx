import React from 'react';

interface ProductivityChartProps {
    data: number[];
    labels: string[];
    height?: number;
}

export const ProductivityChart: React.FC<ProductivityChartProps> = ({
    data,
    labels,
    height = 192 // 48 * 4 = 192px (h-48)
}) => {
    const maxValue = 100; // Always scale to 100% for productivity
    const width = 472; // Match the original SVG width
    const chartHeight = 150; // Chart area height
    const padding = { top: 10, bottom: 20, left: 10, right: 10 };

    // Filter out days with no data for a cleaner line
    const validDataPoints = data.map((value, index) => ({ value, index }))
        .filter(point => point.value > 0);
    
    if (data.length === 0 || validDataPoints.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                    <span className="material-symbols-outlined text-4xl mb-2 block">analytics</span>
                    <p className="text-sm">No productivity data</p>
                    <p className="text-xs mt-1 text-gray-600">Track billable time to see productivity trends</p>
                </div>
            </div>
        );
    }
    
    // Calculate points for the line chart
    const points = data.map((value, index) => {
        const x = padding.left + (index / Math.max(data.length - 1, 1)) * (width - padding.left - padding.right);
        const y = padding.top + ((maxValue - value) / maxValue) * (chartHeight - padding.top - padding.bottom);
        return { x, y, value, index };
    });

    // Create points only for days with data for the line
    const linePoints = points.filter(point => point.value > 0);
    
    // Create the path string for the line (only for days with data)
    const linePath = linePoints.reduce((path, point, index) => {
        const command = index === 0 ? 'M' : 'L';
        return `${path} ${command} ${point.x} ${point.y}`;
    }, '').trim();

    // Create the area path (for the gradient fill)
    const areaPath = linePoints.length > 1
        ? `${linePath} L ${linePoints[linePoints.length - 1].x} ${chartHeight} L ${linePoints[0].x} ${chartHeight} Z`
        : '';
    
    return (
        <div className="h-full w-full">
            <svg 
                className="h-full w-full" 
                fill="none" 
                preserveAspectRatio="none" 
                viewBox={`0 0 ${width} ${chartHeight}`} 
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Gradient definition */}
                <defs>
                    <linearGradient 
                        gradientUnits="userSpaceOnUse" 
                        id="productivity-chart-gradient" 
                        x1={width / 2} 
                        x2={width / 2} 
                        y1="0" 
                        y2={chartHeight}
                    >
                        <stop stopColor="var(--primary-color)" stopOpacity="0.3" />
                        <stop offset="1" stopColor="var(--primary-color)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                
                {/* Grid lines for reference */}
                {[25, 50, 75, 100].map(percentage => {
                    const y = padding.top + ((maxValue - percentage) / maxValue) * (chartHeight - padding.top - padding.bottom);
                    return (
                        <g key={percentage}>
                            <line
                                x1={padding.left}
                                y1={y}
                                x2={width - padding.right}
                                y2={y}
                                stroke="rgba(255, 255, 255, 0.1)"
                                strokeWidth="1"
                                strokeDasharray="2,2"
                            />
                            {/* Y-axis labels */}
                            <text
                                x={padding.left - 5}
                                y={y + 3}
                                fill="rgba(255, 255, 255, 0.4)"
                                fontSize="10"
                                textAnchor="end"
                            >
                                {percentage}%
                            </text>
                        </g>
                    );
                })}
                
                {/* Area fill */}
                {areaPath && (
                    <path
                        d={areaPath}
                        fill="url(#productivity-chart-gradient)"
                    />
                )}

                {/* Main line */}
                {linePoints.length > 1 && (
                    <path
                        d={linePath}
                        stroke="var(--primary-color)"
                        strokeLinecap="round"
                        strokeWidth="3"
                        fill="none"
                    />
                )}

                {/* Data points - only show for days with data */}
                {linePoints.map((point, index) => (
                    <g key={`point-${point.index}`}>
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r="4"
                            fill="var(--primary-color)"
                            stroke="white"
                            strokeWidth="2"
                        />
                        {/* Tooltip on hover */}
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r="8"
                            fill="transparent"
                            className="hover:fill-white hover:fill-opacity-10 cursor-pointer"
                        >
                            <title>{`${point.value}% productivity`}</title>
                        </circle>
                    </g>
                ))}

                {/* Average line */}
                {linePoints.length > 0 && (() => {
                    const average = linePoints.reduce((sum, point) => sum + point.value, 0) / linePoints.length;
                    const avgY = padding.top + ((maxValue - average) / maxValue) * (chartHeight - padding.top - padding.bottom);
                    return (
                        <line
                            x1={padding.left}
                            y1={avgY}
                            x2={width - padding.right}
                            y2={avgY}
                            stroke="rgba(255, 255, 255, 0.5)"
                            strokeWidth="1"
                            strokeDasharray="4,4"
                        >
                            <title>{`Average: ${Math.round(average)}%`}</title>
                        </line>
                    );
                })()}
            </svg>
            
            {/* Labels */}
            <div className="mt-2 flex justify-between text-xs font-medium text-gray-400 px-2">
                {labels.map((label, index) => (
                    <span 
                        key={index} 
                        className={`${label ? 'opacity-100' : 'opacity-0'} truncate`}
                        style={{ 
                            width: `${100 / labels.length}%`,
                            textAlign: index === 0 ? 'left' : index === labels.length - 1 ? 'right' : 'center'
                        }}
                    >
                        {label}
                    </span>
                ))}
            </div>
        </div>
    );
};
