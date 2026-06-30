import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem('mycart_cart');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('mycart_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, qty = 1) => {
    const pId = product._id || product.id;
    setItems(prev => {
      const existing = prev.find(i => (i._id || i.id) === pId);
      if (existing) {
        toast.success(`Updated quantity in cart`);
        return prev.map(i => (i._id || i.id) === pId ? { ...i, qty: i.qty + qty } : i);
      }
      toast.success(`${product.name} added to cart!`);
      return [...prev, { ...product, id: pId, _id: pId, qty }];
    });
  };

  const removeFromCart = (id) => {
    setItems(prev => prev.filter(i => (i._id || i.id) !== id));
    toast.success('Item removed from cart');
  };

  const updateQty = (id, qty) => {
    if (qty < 1) { removeFromCart(id); return; }
    setItems(prev => prev.map(i => (i._id || i.id) === id ? { ...i, qty } : i));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
