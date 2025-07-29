import React, { useState, useMemo } from 'react';
import { Item, Timeframe, Metal } from './types.ts';
import Header from './components/Header.tsx';
import SpotPriceCard from './components/SpotPriceCard.tsx';
import PortfolioChart from './components/PortfolioChart.tsx';
import InventoryTable from './components/InventoryTable.tsx';
import ItemModal from './components/ItemModal.tsx';
import Controls from './components/Controls.tsx';
import { useInventory } from './hooks/useInventory.ts';
import { useSpotPrices } from './hooks/useSpotPrices.ts';

// Helper for currency formatting
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
};

export default function App() {
  const { 
    items, 
    addItem, 
    updateItem, 
    deleteItem, 
    importFromXLSX,
    exportToXLSX,
    exportToPDF
  } = useInventory();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>(Timeframe.MONTH);

  const {
      goldSpotPrice,
      silverSpotPrice,
      goldPriceHistory,
      silverPriceHistory,
      goldSources,
      silverSources,
      loading,
      error
  } = useSpotPrices(timeframe);

  const handleOpenModal = (item: Item | null = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const handleSaveItem = (item: Item) => {
    if (editingItem) {
      updateItem(item);
    } else {
      addItem(item);
    }
    handleCloseModal();
  };

  const portfolioHistory = useMemo(() => {
    if (!goldPriceHistory.length || !silverPriceHistory.length) return [];
    
    // Assuming both histories have the same dates
    return goldPriceHistory.map((goldData, index) => {
        const date = goldData.date;
        const silverData = silverPriceHistory.find(d => d.date === date) || { price: silverPriceHistory[index]?.price || 0};
        
        let totalValue = 0;
        items.forEach(item => {
            if (new Date(item.purchaseDate) <= new Date(date)) {
                const spotPrice = item.metal === Metal.GOLD ? goldData.price : silverData.price;
                const weightInOz = item.weightUnit === 'g' ? item.weight / 31.1035 : item.weight;
                const metalValue = weightInOz * (item.purity / 1000) * spotPrice;
                totalValue += metalValue * item.quantity;
            }
        });

        return { date, value: totalValue };
    });
  }, [items, goldPriceHistory, silverPriceHistory]);


  const totalPortfolioValue = useMemo(() => {
    if (!goldSpotPrice || !silverSpotPrice) return 0;
    return items.reduce((acc, item) => {
      const spotPrice = item.metal === Metal.GOLD ? goldSpotPrice : silverSpotPrice;
      const weightInOz = item.weightUnit === 'g' ? item.weight / 31.1035 : item.weight;
      const value = item.quantity * weightInOz * (item.purity / 1000) * spotPrice;
      return acc + value;
    }, 0);
  }, [items, goldSpotPrice, silverSpotPrice]);

  return (
    <div className="min-h-screen bg-primary-dark text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header onAddItem={() => handleOpenModal()} />
        
        <main className="mt-8 space-y-8">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SpotPriceCard 
              metal={Metal.GOLD}
              spotPrice={goldSpotPrice}
              priceHistory={goldPriceHistory}
              sources={goldSources}
              loading={loading}
              error={error}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
            />
            <SpotPriceCard
              metal={Metal.SILVER}
              spotPrice={silverSpotPrice}
              priceHistory={silverPriceHistory}
              sources={silverSources}
              loading={loading}
              error={error}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
            />
          </section>

          <section>
              <PortfolioChart
                  portfolioValue={totalPortfolioValue}
                  portfolioHistory={portfolioHistory}
                  timeframe={timeframe}
                  loading={loading}
              />
          </section>

          <section>
            <Controls onAddItem={() => handleOpenModal()} onImport={importFromXLSX} onExportXLSX={() => exportToXLSX(items)} onExportPDF={() => exportToPDF(items, goldSpotPrice, silverSpotPrice)}/>
          </section>

          <section>
            <InventoryTable 
              items={items} 
              onEdit={handleOpenModal} 
              onDelete={deleteItem}
              goldSpotPrice={goldSpotPrice}
              silverSpotPrice={silverSpotPrice}
            />
          </section>
        </main>
      </div>

      {isModalOpen && (
        <ItemModal
          item={editingItem}
          onClose={handleCloseModal}
          onSave={handleSaveItem}
        />
      )}
    </div>
  );
}