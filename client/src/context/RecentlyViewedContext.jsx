import { createContext, useContext, useState, useEffect } from 'react';

const RecentlyViewedContext = createContext(null);

const STORAGE_KEY = 'recently_viewed';
const MAX_ITEMS = 8;

export function RecentlyViewedProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addProduct = (product) => {
    setItems(prev => {
      const filtered = prev.filter(i => i.id !== product.id);
      const entry = { id: product.id, name: product.name, price: product.price, image: product.image, brand: product.brand, category: product.category };
      return [entry, ...filtered].slice(0, MAX_ITEMS);
    });
  };

  return (
    <RecentlyViewedContext.Provider value={{ items, addProduct }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export const useRecentlyViewed = () => useContext(RecentlyViewedContext);
