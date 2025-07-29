import { Metal, PriceData, Timeframe } from "../types.ts";

// Der Pfad zu unserer Netlify-Funktion. Er ist relativ zum Stammverzeichnis der Website.
const API_ENDPOINT = '/.netlify/functions/gemini';

/**
 * Eine Hilfsfunktion zum Aufrufen unserer Backend-API.
 * @param body Der Request-Body, der an die Funktion gesendet wird.
 */
const callApi = async (body: object) => {
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        // Versuchen, die Fehlermeldung vom Backend zu parsen
        const errorData = await response.json().catch(() => ({ error: 'Fehler beim Parsen der Fehlerantwort vom Server' }));
        throw new Error(`API-Aufruf fehlgeschlagen: ${errorData.error || response.statusText}`);
    }

    return response.json();
};

const getCurrentSpotPrice = async (metal: Metal): Promise<{ price: number, sources: any[] }> => {
    // Ruft jetzt unsere sichere Backend-Funktion anstelle von Gemini direkt auf.
    return callApi({
        action: 'getCurrentPrice',
        metal: metal,
    });
};

const fetchPriceHistory = async (metal: Metal, timeframe: Timeframe, currentPrice: number): Promise<PriceData[]> => {
     // Ruft ebenfalls unsere sichere Backend-Funktion auf.
     const historyData = await callApi({
        action: 'getHistory',
        metal: metal,
        timeframe: timeframe,
        currentPrice: currentPrice,
    });
    
    // Die Daten kommen als JSON zurück. Wir stellen sicher, dass die Datumsobjekte für die Diagramme korrekt verarbeitet werden.
    // Das Datumsformat von der API sollte ein ISO-String sein, den `new Date()` parsen kann.
    return historyData;
};

export const geminiService = {
    getCurrentSpotPrice,
    fetchPriceHistory,
};