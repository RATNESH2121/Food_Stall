import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [stallId, setStallId] = useState(() => {
    return localStorage.getItem('cartStallId') || null;
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (stallId) localStorage.setItem('cartStallId', stallId);
    else localStorage.removeItem('cartStallId');
  }, [cart, stallId]);

  const addToCart = (item, stall_id) => {
    if (stallId && stallId !== stall_id) {
      if (!window.confirm("Adding an item from a different stall will clear your current cart. Continue?")) {
        return;
      }
      setCart([]);
    }
    setStallId(stall_id);
    
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const updated = prev.filter((i) => i.id !== itemId);
      if (updated.length === 0) setStallId(null);
      return updated;
    });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) return;
    setCart((prev) => prev.map((i) => i.id === itemId ? { ...i, quantity } : i));
  };

  const clearCart = () => {
    setCart([]);
    setStallId(null);
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ 
      cart, stallId, addToCart, removeFromCart, updateQuantity, clearCart, getSubtotal 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
