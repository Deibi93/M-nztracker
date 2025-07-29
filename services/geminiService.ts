import { GoogleGenAI, Type } from "@google/genai";
import { Metal, PriceData, Timeframe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateMockData = (metal: Metal, timeframe: Timeframe, currentPrice: number): PriceData[] => {
    let points;
    switch(timeframe) {
        case Timeframe.INTRADAY: points = 24; break;
        case Timeframe.WEEK: points = 7; break;
        case Timeframe.MONTH: points = 30; break;
        case Timeframe.YEAR: points = 52; break;
        case Timeframe.FIVE_YEARS: points = 60; break;
        case Timeframe.MAX: points = 120; break;
        default: points = 30;
    }
    
    const data: PriceData[] = [];
    const today = new Date();
    const isIntraday = timeframe === Timeframe.INTRADAY;

    for (let i = 0; i < points; i++) {
        const date = new Date(today);
        if (isIntraday) {
            date.setHours(today.getHours() - (points - 1 - i));
        } else {
            const daysToSubtract = (points - 1 - i) * (timeframe === Timeframe.WEEK ? 1 : timeframe === Timeframe.MONTH ? 1 : timeframe === Timeframe.YEAR ? 7 : 30);
            date.setDate(today.getDate() - daysToSubtract);
        }
        
        const fluctuation = (Math.random() - 0.5) * currentPrice * 0.1;
        const trend = (i / points) * currentPrice * 0.05;
        const price = currentPrice + fluctuation + trend - (currentPrice * 0.025);

        data.push({
            date: isIntraday ? date.toISOString() : date.toISOString().split('T')[0],
            price: parseFloat(price.toFixed(2))
        });
    }

    if(data.length > 0) {
        data[data.length - 1].price = currentPrice;
    }

    return data;
}

const getCurrentSpotPrice = async (metal: Metal): Promise<{ price: number, sources: any[] }> => {
    const metalNameGerman = metal === Metal.GOLD ? "Gold" : "Silber";
    const prompt = `Was ist der aktuelle Spotpreis für ${metalNameGerman} in EUR pro Feinunze? Antworte nur mit der Zahl (z.B. 2150.55).`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            }
        });
        const text = response.text;
        const price = parseFloat(text.replace(/[^0-9.,]/g, '').replace(',', '.'));
        if (isNaN(price)) {
            console.error('Could not parse price from response:', text);
            throw new Error('Could not parse price from response');
        }
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        return { price, sources };
    } catch (error) {
        console.error(`Error fetching current ${metal} price with Gemini:`, error);
        console.warn("Falling back to mock price.");
        const fallbackPrice = metal === Metal.GOLD ? 2150.00 : 28.50;
        return { price: fallbackPrice, sources: [] };
    }
}

const fetchPriceHistory = async (metal: Metal, timeframe: Timeframe, currentPrice: number): Promise<PriceData[]> => {
    let days = 30;
    let points;
    
    switch(timeframe) {
        case Timeframe.INTRADAY: days = 1; points = 24; break;
        case Timeframe.WEEK: days = 7; points = 7; break;
        case Timeframe.MONTH: days = 30; points = 30; break;
        case Timeframe.YEAR: days = 365; points = 52; break;
        case Timeframe.FIVE_YEARS: days = 365 * 5; points = 60; break;
        case Timeframe.MAX: days = 365 * 10; points = 120; break;
    }
    const finalPoints = Math.min(points, 90);

    const metalNameGerman = metal === Metal.GOLD ? "Gold" : "Silber";
    const isIntraday = timeframe === Timeframe.INTRADAY;
    const timeUnit = isIntraday ? "Stunden" : "Tage";
    const duration = isIntraday ? 24 : days;
    const dateFormat = isIntraday ? "YYYY-MM-DDTHH:mm:ssZ" : "YYYY-MM-DD";
    
    const prompt = `Erzeuge simulierte historische ${isIntraday ? 'stündliche ' : ''}Spotpreisdaten für ${metalNameGerman} in EUR pro Feinunze für die letzten ${duration} ${timeUnit}, die heute enden. Der aktuellste Preis sollte genau ${currentPrice.toFixed(2)} EUR sein. Gib genau ${finalPoints} Datenpunkte zurück. Jeder Datenpunkt sollte ein Datum im Format ${dateFormat} und einen Preis enthalten.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            date: { type: Type.STRING, description: `Datum im Format ${dateFormat}` },
                            price: { type: Type.NUMBER, description: "Preis in EUR" }
                        },
                        required: ["date", "price"]
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText) as PriceData[];
        
        const sortedData = data.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (sortedData.length > 0) {
            sortedData[sortedData.length - 1].price = currentPrice;
        }

        return sortedData;

    } catch (error) {
        console.error(`Error fetching ${metal} history from Gemini:`, error);
        console.warn("Falling back to mock data due to Gemini API error.");
        return generateMockData(metal, timeframe, currentPrice);
    }
};

export const geminiService = {
    getCurrentSpotPrice,
    fetchPriceHistory,
};