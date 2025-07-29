
import { useState, useEffect, useCallback } from 'react';
import { Metal, PriceData, Timeframe } from '../types';
import { geminiService } from '../services/geminiService';

export function useSpotPrices(timeframe: Timeframe) {
    const [goldSpotPrice, setGoldSpotPrice] = useState<number | null>(null);
    const [silverSpotPrice, setSilverSpotPrice] = useState<number | null>(null);
    const [goldPriceHistory, setGoldPriceHistory] = useState<PriceData[]>([]);
    const [silverPriceHistory, setSilverPriceHistory] = useState<PriceData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPrices = useCallback(async (tf: Timeframe) => {
        setLoading(true);
        setError(null);
        try {
            const [goldData, silverData] = await Promise.all([
                geminiService.fetchSpotPrices(Metal.GOLD, tf),
                geminiService.fetchSpotPrices(Metal.SILVER, tf),
            ]);

            if (goldData.length > 0) {
                setGoldPriceHistory(goldData);
                setGoldSpotPrice(goldData[goldData.length - 1].price);
            }
            if (silverData.length > 0) {
                setSilverPriceHistory(silverData);
                setSilverSpotPrice(silverData[silverData.length - 1].price);
            }
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

    return { goldSpotPrice, silverSpotPrice, goldPriceHistory, silverPriceHistory, loading, error };
}
