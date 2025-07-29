
import React, { useState, useEffect } from 'react';
import { Item, Metal, WeightUnit, ItemType } from '../types';

interface ItemModalProps {
  item: Item | null;
  onClose: () => void;
  onSave: (item: Item) => void;
}

const ItemModal: React.FC<ItemModalProps> = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState<Omit<Item, 'id'>>({
    name: '',
    weight: 0,
    weightUnit: WeightUnit.OUNCE,
    itemType: ItemType.COIN,
    metal: Metal.GOLD,
    purity: 999.9,
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: 0,
    quantity: 1,
    mintingDate: '',
    notes: '',
  });

  useEffect(() => {
    if (item) {
      // Omit id as it's not part of the form data state
      const { id, ...itemData } = item;
      setFormData(itemData);
    }
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: parseFloat(value) || 0}));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemToSave: Item = {
      ...formData,
      id: item?.id || new Date().toISOString(), // Use existing id or create a new one
    };
    onSave(itemToSave);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-dark rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              {item ? 'Posten Bearbeiten' : 'Neuen Posten Hinzufügen'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Name */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full bg-tertiary-dark border-gray-600 rounded-md shadow-sm focus:ring-accent focus:border-accent text-white" />
              </div>

              {/* Metal & Item Type */}
              <div>
                <label htmlFor="metal" className="block text-sm font-medium text-gray-300">Metall</label>
                <select name="metal" id="metal" value={formData.metal} onChange={handleChange} className="mt-1 block w-full bg-tertiary-dark border-gray-600 rounded-md shadow-sm focus:ring-accent focus:border-accent text-white">
                  <option>{Metal.GOLD}</option>
                  <option>{Metal.SILVER}</option>
                </select>
              </div>
              <div>
                <label htmlFor="itemType" className="block text-sm font-medium text-gray-300">Typ</label>
                <select name="itemType" id="itemType" value={formData.itemType} onChange={handleChange} className="mt-1 block w-full bg-tertiary-dark border-gray-600 rounded-md shadow-sm focus:ring-accent focus:border-accent text-white">
                  <option>{ItemType.COIN}</option>
                  <option>{ItemType.BAR}</option>
                </select>
              </div>

              {/* Weight & Unit */}
              <div>
                 <label htmlFor="weight" className="block text-sm font-medium text-gray-300">Gewicht</label>
                 <div className="flex mt-1">
                    <input type="number" name="weight" id="weight" value={formData.weight} onChange={handleNumberChange} step="any" required className="flex-grow w-full bg-tertiary-dark border-gray-600 rounded-l-md shadow-sm focus:ring-accent focus:border-accent text-white" />
                    <select name="weightUnit" value={formData.weightUnit} onChange={handleChange} className="bg-gray-600 border-gray-600 rounded-r-md text-white focus:ring-accent focus:border-accent">
                        <option value={WeightUnit.OUNCE}>oz</option>
                        <option value={WeightUnit.GRAM}>g</option>
                    </select>
                 </div>
              </div>
               {/* Purity */}
              <div>
                <label htmlFor="purity" className="block text-sm font-medium text-gray-300">Reinheit ( / 1000)</label>
                <input type="number" name="purity" id="purity" value={formData.purity} onChange={handleNumberChange} step="any" required className="mt-1 block w-full bg-tertiary-dark border-gray-600 rounded-md shadow-sm focus:ring-accent focus:border-accent text-white" />
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-300">Anzahl</label>
                <input type="number" name="quantity" id="quantity" value={formData.quantity} onChange={handleNumberChange} min="1" step="1" required className="mt-1 block w-full bg-tertiary-dark border-gray-600 rounded-md shadow-sm focus:ring-accent focus:border-accent text-white" />
              </div>
              {/* Purchase Price */}
              <div>
                <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-300">Kaufpreis (pro Stück)</label>
                <input type="number" name="purchasePrice" id="purchasePrice" value={formData.purchasePrice} onChange={handleNumberChange} step="any" required className="mt-1 block w-full bg-tertiary-dark border-gray-600 rounded-md shadow-sm focus:ring-accent focus:border-accent text-white" />
              </div>
              
              {/* Purchase Date */}
              <div>
                <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-300">Kaufdatum</label>
                <input type="date" name="purchaseDate" id="purchaseDate" value={formData.purchaseDate} onChange={handleChange} required className="mt-1 block w-full bg-tertiary-dark border-gray-600 rounded-md shadow-sm focus:ring-accent focus:border-accent text-white" />
              </div>
              {/* Minting Date */}
              <div>
                <label htmlFor="mintingDate" className="block text-sm font-medium text-gray-300">Prägedatum / Jahr</label>
                <input type="text" name="mintingDate" id="mintingDate" value={formData.mintingDate} onChange={handleChange} className="mt-1 block w-full bg-tertiary-dark border-gray-600 rounded-md shadow-sm focus:ring-accent focus:border-accent text-white" />
              </div>
              {/* Notes */}
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-300">Notizen</label>
                <textarea name="notes" id="notes" value={formData.notes} onChange={handleChange} rows={3} className="mt-1 block w-full bg-tertiary-dark border-gray-600 rounded-md shadow-sm focus:ring-accent focus:border-accent text-white"></textarea>
              </div>
            </div>
          </div>
          <div className="bg-tertiary-dark p-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-500 transition-colors">Abbrechen</button>
            <button type="submit" className="px-4 py-2 rounded-md text-primary-dark font-semibold bg-accent hover:bg-yellow-500 transition-colors">Speichern</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemModal;
