import { createContext, useContext, useState } from 'react';

const QuickViewContext = createContext(null);

export function QuickViewProvider({ children }) {
  const [product, setProduct] = useState(null);
  const open = (p) => setProduct(p);
  const close = () => setProduct(null);
  return (
    <QuickViewContext.Provider value={{ product, open, close }}>
      {children}
    </QuickViewContext.Provider>
  );
}

export const useQuickView = () => useContext(QuickViewContext);
