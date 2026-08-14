import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('kiranago_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('kiranago_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    setItems(prevItems => {
      const pId = product._id || product.id;
      const existingIndex = prevItems.findIndex(i => (i._id || i.id) === pId);

      if (existingIndex !== -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    setItems(prevItems => {
      if (newQuantity <= 0) {
        return prevItems.filter(i => (i._id || i.id) !== productId);
      }
      return prevItems.map(i => {
        if ((i._id || i.id) === productId) {
          return { ...i, quantity: newQuantity };
        }
        return i;
      });
    });
  };

  const removeFromCart = (productId) => {
    setItems(prevItems => prevItems.filter(i => (i._id || i.id) !== productId));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('kiranago_cart');
  };

  // Total item count badge calculation
  const totalItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Group items by store for Multi-Store Cart support
  const storeGroupsMap = {};
  let grandSubtotal = 0;
  let grandMrpTotal = 0;

  items.forEach(item => {
    const storeId = item.storeId || 'store_1';
    const storeName = item.storeName || 'Kirana Partner';

    if (!storeGroupsMap[storeId]) {
      storeGroupsMap[storeId] = {
        storeId,
        storeName,
        items: [],
        storeSubtotal: 0
      };
    }

    const itemTotal = item.sellingPrice * item.quantity;
    const itemMrpTotal = (item.mrp || item.sellingPrice) * item.quantity;

    grandSubtotal += itemTotal;
    grandMrpTotal += itemMrpTotal;
    storeGroupsMap[storeId].storeSubtotal += itemTotal;
    storeGroupsMap[storeId].items.push({ ...item, itemTotal });
  });

  const storeGroups = Object.values(storeGroupsMap);
  const totalDeliveryFee = storeGroups.length > 0 ? storeGroups.length * 15 : 0;
  const platformFee = items.length > 0 ? 5 : 0;
  const taxes = Math.round(grandSubtotal * 0.05);
  const totalSavings = grandMrpTotal - grandSubtotal;
  const grandTotal = grandSubtotal + totalDeliveryFee + platformFee + taxes;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItemCount,
        storeGroups,
        grandMrpTotal,
        grandSubtotal,
        totalDeliveryFee,
        platformFee,
        taxes,
        totalSavings,
        grandTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
