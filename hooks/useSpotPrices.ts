import { useState, useEffect, useCallback } from 'react';
import { Metal, PriceData, Timeframe, GroundingChunk } from '../types';
import { geminiService } from '../services/geminiService';

export function useSpotPrices(timeframe: Timeframe) {
    const [goldSpotPrice, setGoldSpotPrice] = useState<number | null>(null);
    const [silverSpotPrice, setSilverSpotPrice] = useState<number | null>(null);
    const [goldPriceHistory, setGoldPriceHistory] = useState<PriceData[]>([]);
    const [silverPriceHistory, setSilverPriceHistory] = useState<PriceData[]>([]);
    const [goldSources, setGoldSources] = useState<GroundingChunk[]>([]);
    const [silverSources, setSilverSources] = useState<GroundingChunk[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPrices = useCallback(async (tf: Timeframe) => {
        setLoading(true);
        setError(null);
        try {
            // Step 1: Fetch current prices and sources for both metals in parallel
            const [goldCurrent, silverCurrent] = await Promise.all([
                geminiService.getCurrentSpotPrice(Metal.GOLD),
                geminiService.getCurrentSpotPrice(Metal.SILVER),
            ]);

            setGoldSpotPrice(goldCurrent.price);
            setSilverSpotPrice(silverCurrent.price);
            setGoldSources(goldCurrent.sources);
            setSilverSources(silverCurrent.sources);
            
            // Step 2: Fetch historical data using the current prices
            const [goldHistoryData, silverHistoryData] = await Promise.all([
                geminiService.fetchPriceHistory(Metal.GOLD, tf, goldCurrent.price),
                geminiService.fetchPriceHistory(Metal.SILVER, tf, silverCurrent.price),
            ]);

            setGoldPriceHistory(goldHistoryData);
            setSilverPriceHistory(silverHistoryData);

        } catch (err) {
            console.error("Error fetching spot prices:", err);
            setError("Fehler beim Abrufen der Preisdaten. Versuchen Sie es später erneut.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPrices(timeframe);
    }, [timeframe, fetchPrices]);

    useEffect(() => {
        // Fetch prices every hour
        const intervalId = setInterval(() => {
            fetchPrices(timeframe);
        }, 3600 * 1000); 

        return () => clearInterval(intervalId);
    }, [timeframe, fetchPrices]);

    return { 
        goldSpotPrice, 
        silverSpotPrice, 
        goldPriceHistory, 
        silverPriceHistory, 
        goldSources, 
        silverSources, 
        loading, 
        error 
    };
}