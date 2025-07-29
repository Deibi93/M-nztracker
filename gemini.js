import { GoogleGenAI, Type } from "@google/genai";

// Diese Funktion generiert Mock-Daten, wenn die Gemini-API fehlschlägt,
// genau wie der ursprüngliche Frontend-Service.
const generateMockData = (metal, timeframe, currentPrice) => {
    let points;
    switch(timeframe) {
        case 'Interday': points = 24; break;
        case 'Woche': points = 7; break;
        case 'Monat': points = 30; break;
        case 'Jahr': points = 52; break;
        case '5 Jahre': points = 60; break;
        case 'Max': points = 120; break;
        default: points = 30;
    }
    
    const data = [];
    const today = new Date();
    const isIntraday = timeframe === 'Interday';

    for (let i = 0; i < points; i++) {
        const date = new Date(today);
        if (isIntraday) {
            date.setHours(today.getHours() - (points - 1 - i));
        } else {
            const daysToSubtract = (points - 1 - i) * (timeframe === 'Woche' ? 1 : timeframe === 'Monat' ? 1 : timeframe === 'Jahr' ? 7 : 30);
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

const getCurrentSpotPrice = async (ai, metal) => {
    const metalNameGerman = metal; // 'Gold' oder 'Silber'
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
            throw new Error('Could not parse price from response');
        }
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        return { price, sources };
    } catch (error) {
        console.error(`Error fetching current ${metal} price with Gemini:`, error);
        console.warn("Falling back to mock price.");
        const fallbackPrice = metal === 'Gold' ? 2150.00 : 28.50;
        return { price: fallbackPrice, sources: [] };
    }
}

const fetchPriceHistory = async (ai, metal, timeframe, currentPrice) => {
    let days = 30;
    let points;
    
    switch(timeframe) {
        case 'Interday': days = 1; points = 24; break;
        case 'Woche': days = 7; points = 7; break;
        case 'Monat': days = 30; points = 30; break;
        case 'Jahr': days = 365; points = 52; break;
        case '5 Jahre': days = 365 * 5; points = 60; break;
        case 'Max': days = 365 * 10; points = 120; break;
        default: days = 30; points = 30;
    }
    const finalPoints = Math.min(points, 90);

    const metalNameGerman = metal;
    const isIntraday = timeframe === 'Interday';
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
        const data = JSON.parse(jsonText);
        
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

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
    
    if (!process.env.API_KEY) {
        return { statusCode: 500, body: JSON.stringify({ error: 'API key is not configured on the server.' }) };
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const body = JSON.parse(event.body || '{}');
        let data;

        switch(body.action) {
            case 'getCurrentPrice':
                data = await getCurrentSpotPrice(ai, body.metal);
                break;
            case 'getHistory':
                if (body.metal === undefined || body.timeframe === undefined || body.currentPrice === undefined) {
                     return { statusCode: 400, body: JSON.stringify({ error: 'Missing parameters for getHistory' }) };
                }
                data = await fetchPriceHistory(ai, body.metal, body.timeframe, body.currentPrice);
                break;
            default:
                return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action' }) };
        }
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        };
    } catch (error) {
        console.error('Error in Netlify function handler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'An internal server error occurred.' }),
        };
    }
};
