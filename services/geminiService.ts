
import { GoogleGenAI, Type } from "@google/genai";
import { Metal, PriceData, Timeframe } from "../types";

// This is a placeholder for a real API key which should be in an environment variable
const API_KEY = process.env.API_KEY; 
if (!API_KEY) {
    console.warn("API_KEY environment variable not set. Using a placeholder. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getPromptDetails = (metal: Metal, timeframe: Timeframe) => {
    let days = 30;
    // Updated spot prices to reflect more current values. Gold price updated per user request.
    let currentPrice = metal === Metal.GOLD ? 2871.50 : 30.5;
    let points;
    
    switch(timeframe) {
        case Timeframe.INTRADAY: days = 1; points = 24; break;
        case Timeframe.WEEK: days = 7; points = 7; break;
        case Timeframe.MONTH: days = 30; points = 30; break;
        case Timeframe.YEAR: days = 365; points = 52; break;
        case Timeframe.FIVE_YEARS: days = 365 * 5; points = 60; break;
        case Timeframe.MAX: days = 365 * 10; points = 120; break;
    }
    // Gemini has a response size limit, so we cap the number of points
    const finalPoints = Math.min(points, 90);
    return { days, currentPrice, points: finalPoints, timeframe };
}

const fetchSpotPrices = async (metal: Metal, timeframe: Timeframe): Promise<PriceData[]> => {
    if (!API_KEY) {
        console.error("Gemini API key is not configured.");
        return generateMockData(metal, timeframe); // Fallback to mock data
    }
    
    const { days, currentPrice, points, timeframe: tf } = getPromptDetails(metal, timeframe);
    const metalNameGerman = metal === Metal.GOLD ? "Gold" : "Silber";
    const isIntraday = tf === Timeframe.INTRADAY;
    const timeUnit = isIntraday ? "Stunden" : "Tage";
    const duration = isIntraday ? 24 : days;
    const dateFormat = isIntraday ? "YYYY-MM-DDTHH:mm:ssZ" : "YYYY-MM-DD";
    
    const prompt = `Erzeuge simulierte historische ${isIntraday ? 'stündliche ' : ''}Spotpreisdaten für ${metalNameGerman} in EUR pro Feinunze für die letzten ${duration} ${timeUnit}, endend am 29. Juli 2025. Der aktuellste Preis sollte um ${currentPrice} EUR liegen. Gib genau ${points} Datenpunkte zurück. Jeder Datenpunkt sollte ein Datum im Format ${dateFormat} und einen Preis enthalten.`;

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
                            date: {
                                type: Type.STRING,
                                description: `Datum im Format ${dateFormat}`
                            },
                            price: {
                                type: Type.NUMBER,
                                description: "Preis in EUR"
                            }
                        },
                        required: ["date", "price"]
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText) as PriceData[];
        return data.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    } catch (error) {
        console.error(`Error fetching ${metal} prices from Gemini:`, error);
        console.warn("Falling back to mock data due to Gemini API error.");
        return generateMockData(metal, timeframe); // Fallback to mock data
    }
};

const generateMockData = (metal: Metal, timeframe: Timeframe): PriceData[] => {
    const { currentPrice, points, timeframe: tf } = getPromptDetails(metal, timeframe);
    const data: PriceData[] = [];
    const today = new Date('2025-07-29T12:00:00Z');
    const isIntraday = tf === Timeframe.INTRADAY;

    for (let i = 0; i < points; i++) {
        const date = new Date(today);
        if (isIntraday) {
            date.setHours(today.getHours() - (points - 1 - i));
        } else {
            // This logic creates a point per day for non-intraday, which is fine for demo purposes.
            date.setDate(today.getDate() - (points - 1 - i));
        }
        
        const fluctuation = (Math.random() - 0.5) * currentPrice * 0.1;
        const trend = (i / points) * currentPrice * 0.05;
        const price = currentPrice + fluctuation + trend - (currentPrice * 0.025);

        data.push({
            date: isIntraday ? date.toISOString() : date.toISOString().split('T')[0],
            price: parseFloat(price.toFixed(2))
        });
    }

    // Ensure the last data point reflects the current price accurately.
    if(data.length > 0) {
        data[data.length - 1].price = currentPrice;
    }

    return data;
}

export const geminiService = {
    fetchSpotPrices,
};
