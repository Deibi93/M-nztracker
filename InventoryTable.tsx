
import React from 'react';
import { Item, Metal, WeightUnit } from '../types.ts';
import { formatCurrency } from '../App.tsx';

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

interface InventoryTableProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
  goldSpotPrice: number | null;
  silverSpotPrice: number | null;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ items, onEdit, onDelete, goldSpotPrice, silverSpotPrice }) => {
    
    const calculateCurrentValue = (item: Item): number => {
        if (!goldSpotPrice || !silverSpotPrice) return 0;
        const spotPrice = item.metal === Metal.GOLD ? goldSpotPrice : silverSpotPrice;
        const weightInOz = item.weightUnit === WeightUnit.GRAM ? item.weight / 31.1035 : item.weight;
        const value = item.quantity * weightInOz * (item.purity / 1000) * spotPrice;
        return value;
    };

    if (items.length === 0) {
        return (
            <div className="text-center py-10 bg-secondary-dark rounded-lg">
                <h3 className="text-xl font-semibold text-white">Ihr Bestand ist leer</h3>
                <p className="text-gray-400 mt-2">Fügen Sie Ihre erste Münze oder Ihren ersten Barren hinzu, um zu beginnen.</p>
            </div>
        )
    }

    return (
        <div className="bg-secondary-dark rounded-lg shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-tertiary-dark">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-gray-300 tracking-wider">Name</th>
                            <th className="p-4 text-sm font-semibold text-gray-300 tracking-wider">Menge</th>
                            <th className="p-4 text-sm font-semibold text-gray-300 tracking-wider">Kaufwert</th>
                            <th className="p-4 text-sm font-semibold text-gray-300 tracking-wider">Aktueller Wert</th>
                            <th className="p-4 text-sm font-semibold text-gray-300 tracking-wider">Wertzuwachs</th>
                            <th className="p-4 text-sm font-semibold text-gray-300 tracking-wider text-right">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-tertiary-dark">
                        {items.map(item => {
                            const currentValue = calculateCurrentValue(item);
                            const purchaseValue = item.purchasePrice * item.quantity;
                            const valueGrowth = currentValue - purchaseValue;
                            const valueGrowthPercent = purchaseValue > 0 ? (valueGrowth / purchaseValue) * 100 : 0;
                            const growthColor = valueGrowth >= 0 ? 'text-green-400' : 'text-red-400';

                            return (
                                <tr key={item.id} className="hover:bg-tertiary-dark transition-colors duration-200">
                                    <td className="p-4">
                                        <div className="font-medium text-white">{item.name}</div>
                                        <div className="text-xs text-gray-400">
                                            {item.metal} {item.itemType}, {item.weight}{item.weightUnit}, {item.purity}/1000
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-300">{item.quantity}</td>
                                    <td className="p-4 text-gray-300">{formatCurrency(purchaseValue)}</td>
                                    <td className="p-4 font-semibold text-white">{formatCurrency(currentValue)}</td>
                                    <td className={`p-4 font-semibold ${growthColor}`}>
                                        {formatCurrency(valueGrowth)} ({valueGrowthPercent.toFixed(2)}%)
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end items-center space-x-3">
                                            <button onClick={() => onEdit(item)} className="text-blue-400 hover:text-blue-300 transition-colors">
                                                <EditIcon />
                                            </button>
                                            <button onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-400 transition-colors">
                                                <DeleteIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InventoryTable;