import { useState, useEffect, useCallback } from 'react';
import { Item, Metal, WeightUnit, ItemType } from '../types.ts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const LOCAL_STORAGE_KEY = 'muenztracker-inventory';

export function useInventory() {
    const [items, setItems] = useState<Item[]>(() => {
        try {
            const savedItems = window.localStorage.getItem(LOCAL_STORAGE_KEY);
            return savedItems ? JSON.parse(savedItems) : [];
        } catch (error) {
            console.error("Could not load items from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
        } catch (error) {
            console.error("Could not save items to localStorage", error);
        }
    }, [items]);

    const addItem = useCallback((item: Item) => {
        setItems(prevItems => [...prevItems, item]);
    }, []);

    const updateItem = useCallback((updatedItem: Item) => {
        setItems(prevItems => prevItems.map(item => item.id === updatedItem.id ? updatedItem : item));
    }, []);

    const deleteItem = useCallback((id: string) => {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
    }, []);

    const importFromXLSX = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json<any>(worksheet);

                const newItems: Item[] = json.map((row, index) => ({
                    id: `imported-${Date.now()}-${index}`,
                    name: String(row['Name'] || ''),
                    weight: parseFloat(row['Gewicht'] || 0),
                    weightUnit: String(row['Einheit'] || 'oz').toLowerCase() === 'g' ? WeightUnit.GRAM : WeightUnit.OUNCE,
                    itemType: String(row['Typ'] || 'Münze') === 'Barren' ? ItemType.BAR : ItemType.COIN,
                    metal: String(row['Metall'] || 'Gold') === 'Silber' ? Metal.SILVER : Metal.GOLD,
                    purity: parseFloat(row['Reinheit'] || 999.9),
                    purchaseDate: new Date(row['Kaufdatum'] || Date.now()).toISOString().split('T')[0],
                    purchasePrice: parseFloat(row['Kaufpreis'] || 0),
                    quantity: parseInt(row['Anzahl'] || 1, 10),
                    mintingDate: String(row['Prägedatum'] || ''),
                    notes: String(row['Notizen'] || ''),
                }));
                
                setItems(prev => [...prev, ...newItems]);
                alert(`${newItems.length} Posten erfolgreich importiert!`);
            } catch (error) {
                console.error("Fehler beim Importieren der XLSX-Datei:", error);
                alert("Fehler beim Importieren der Datei. Bitte stellen Sie sicher, dass das Format korrekt ist.");
            }
        };
        reader.readAsBinaryString(file);
    }, []);

    const exportToXLSX = useCallback((itemsToExport: Item[]) => {
        const worksheet = XLSX.utils.json_to_sheet(itemsToExport.map(item => ({
            'Name': item.name,
            'Gewicht': item.weight,
            'Einheit': item.weightUnit,
            'Typ': item.itemType,
            'Metall': item.metal,
            'Reinheit': item.purity,
            'Kaufdatum': item.purchaseDate,
            'Kaufpreis': item.purchasePrice,
            'Anzahl': item.quantity,
            'Prägedatum': item.mintingDate,
            'Notizen': item.notes,
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Münzbestand');
        XLSX.writeFile(workbook, 'Münztracker_Bestand.xlsx');
    }, []);

    const exportToPDF = useCallback((itemsToExport: Item[], goldPrice: number | null, silverPrice: number | null) => {
        const doc = new jsPDF();
        doc.text("Münztracker Bestandsübersicht", 14, 16);
        doc.setFontSize(10);
        doc.text(`Exportiert am: ${new Date().toLocaleDateString('de-DE')}`, 14, 22);

        const head = [['Name', 'Anzahl', 'Metall', 'Kaufwert', 'Akt. Wert', 'Zuwachs']];
        const body = itemsToExport.map(item => {
            const spotPrice = item.metal === Metal.GOLD ? goldPrice : silverPrice;
            const weightInOz = item.weightUnit === WeightUnit.GRAM ? item.weight / 31.1035 : item.weight;
            const currentValue = spotPrice ? item.quantity * weightInOz * (item.purity / 1000) * spotPrice : 0;
            const purchaseValue = item.purchasePrice * item.quantity;
            const valueGrowth = currentValue - purchaseValue;

            return [
                item.name,
                item.quantity,
                item.metal,
                `${purchaseValue.toFixed(2)} €`,
                `${currentValue.toFixed(2)} €`,
                `${valueGrowth.toFixed(2)} €`,
            ];
        });

        (doc as any).autoTable({
            startY: 30,
            head: head,
            body: body,
            theme: 'striped',
            headStyles: { fillColor: [31, 41, 55] }
        });

        doc.save('Münztracker_Bestand.pdf');
    }, []);

    return { items, addItem, updateItem, deleteItem, importFromXLSX, exportToXLSX, exportToPDF };
}