import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Metal, PriceData, Timeframe, GroundingChunk } from '../types';
import { formatCurrency } from '../App';

interface SpotPriceCardProps {
  metal: Metal;
  spotPrice: number | null;
  priceHistory: PriceData[];
  loading: boolean;
  error: string | null;
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
  sources: GroundingChunk[];
}

const timeframeOptions = Object.values(Timeframe);

const CustomTooltip = ({ active, payload, label, timeframe }: any) => {
    if (active && payload && payload.length) {
        const date = new Date(label);
        const formattedLabel = timeframe === Timeframe.INTRADAY 
            ? date.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString('de-DE');

        return (
            <div className="bg-secondary-dark p-2 border border-tertiary-dark rounded-md shadow-lg">
                <p className="label text-gray-300">{formattedLabel}</p>
                <p className="intro text-accent">{formatCurrency(payload[0].value)}</p>
            </div>
        );
    }
    return null;
};

const SpotPriceCard: React.FC<SpotPriceCardProps> = ({ metal, spotPrice, priceHistory, loading, error, timeframe, setTimeframe, sources }) => {
  const isGold = metal === Metal.GOLD;
  const color = isGold ? '#FFD700' : '#C0C0C0';
  const gradientId = isGold ? 'goldGradient' : 'silverGradient';

  const tickFormatter = (tick: string) => {
      const date = new Date(tick);
      if (timeframe === Timeframe.INTRADAY) {
          return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
      }
      if (timeframe === Timeframe.WEEK || timeframe === Timeframe.MONTH) {
           return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
      }
      return date.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' });
  };


  return (
    <div className="bg-secondary-dark p-6 rounded-lg shadow-xl flex flex-col">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-white">{metal} Spot-Preis</h2>
          <p className="text-sm text-gray-400">pro Feinunze in EUR</p>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isGold ? 'bg-gold' : 'bg-silver'}`}>
            <span className="text-primary-dark font-extrabold text-xl">{isGold ? 'Au' : 'Ag'}</span>
        </div>
      </div>
      
      {loading && <div className="text-center py-10">Lade Preisdaten...</div>}
      {error && <div className="text-center py-10 text-red-400">{error}</div>}
      
      {!loading && !error && (
        <>
            <div className="mt-4">
                <p className="text-4xl font-bold" style={{ color }}>
                {spotPrice ? formatCurrency(spotPrice) : 'N/A'}
                </p>
            </div>
             <div className="mt-4 flex flex-wrap gap-1 sm:gap-2">
                {timeframeOptions.map(tf => (
                    <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                            timeframe === tf
                            ? 'bg-accent text-primary-dark'
                            : 'bg-tertiary-dark hover:bg-gray-600 text-gray-300'
                        }`}
                    >
                        {tf}
                    </button>
                ))}
            </div>
            <div className="flex-grow mt-6 h-48">
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={color} stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} tickFormatter={tickFormatter} />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} domain={['dataMin', 'dataMax']} hide={true} />
                    <Tooltip content={<CustomTooltip timeframe={timeframe} />} />
                    <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#${gradientId})`} />
                </AreaChart>
                </ResponsiveContainer>
            </div>
            {sources && sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-tertiary-dark">
                    <h4 className="text-xs font-semibold text-gray-400">Datenquelle (aktueller Preis):</h4>
                    <ul className="text-xs text-gray-500 mt-1 space-y-1">
                        {sources.map((source, index) => (
                            <li key={index} className="truncate">
                                <a 
                                    href={source.web.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:text-accent transition-colors"
                                    title={source.web.title}
                                >
                                    {source.web.title || source.web.uri}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
      )}
    </div>
  );
};

export default SpotPriceCard;