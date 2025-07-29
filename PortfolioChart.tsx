
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Timeframe } from '../types.ts';
import { formatCurrency } from '../App.tsx';

interface PortfolioChartProps {
    portfolioValue: number;
    portfolioHistory: { date: string; value: number }[];
    timeframe: Timeframe;
    loading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-secondary-dark p-2 border border-tertiary-dark rounded-md shadow-lg">
                <p className="label text-gray-300">{new Date(label).toLocaleDateString('de-DE')}</p>
                <p className="intro text-accent">{formatCurrency(payload[0].value)}</p>
            </div>
        );
    }
    return null;
};


const PortfolioChart: React.FC<PortfolioChartProps> = ({ portfolioValue, portfolioHistory, timeframe, loading }) => {
    return (
        <div className="bg-secondary-dark p-4 sm:p-6 rounded-lg shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <div>
                    <h3 className="text-xl font-bold text-white">Portfolio Wertentwicklung</h3>
                    <p className="text-4xl font-bold text-accent mt-1">{formatCurrency(portfolioValue)}</p>
                </div>
            </div>
            <div className="mt-6 h-72">
                 {loading && <div className="w-full h-full flex items-center justify-center text-gray-400">Lade Portfoliodaten...</div>}
                {!loading && portfolioHistory.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={portfolioHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.7}/>
                                    <stop offset="95%" stopColor="#FBBF24" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} tickFormatter={(tick) => new Date(tick).toLocaleDateString('de-DE', {month: 'short', year: '2-digit'})} />
                            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} domain={['dataMin', 'dataMax']} tickFormatter={(tick) => `€${Math.round(tick/1000)}k`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="value" stroke="#FBBF24" strokeWidth={2} fill="url(#portfolioGradient)" />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
                {!loading && portfolioHistory.length === 0 && (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Fügen Sie Posten hinzu, um die Wertentwicklung Ihres Portfolios zu sehen.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PortfolioChart;