import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('kiranago_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Hydrate cart from MongoDB Atlas backend API on initial mount
  useEffect(() => {
    fetchMongoCart();
  }, []);

  const fetchMongoCart = async () => {
    try {
      const res = await fetch('/api/cart?sessionId=guest_session');
      const data = await res.json();
      if (data.success && data.cart && Array.isArray(data.cart.storeGroups)) {
        // Flatten items from MongoDB response
        const dbItems = [];
        data.cart.storeGroups.forEach(group => {
          if (Array.isArray(group.items)) {
            group.items.forEach(i => dbItems.push({ ...i, storeId: group.storeId, storeName: group.storeName }));
          }
        });
        if (dbItems.length > 0) {
          setItems(dbItems);
        }
      }
    } catch (err) {
      console.warn('Backend cart sync notice:', err.message);
    }
  };

  useEffect(() => {
    localStorage.setItem('kiranago_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    const pId = product._id || product.id || product.productId;

    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(i => String(i._id || i.id || i.productId) === String(pId));

      if (existingIndex !== -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      } else {
        return [...prevItems, { ...product, _id: pId, id: pId, quantity }];
      }
    });

    // Save cart data asynchronously to MongoDB Atlas
    fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: pId, quantity, sessionId: 'guest_session' })
    }).catch(err => console.error('MongoDB Cart Save Error:', err));
  };

  const updateQuantity = (productId, newQuantity) => {
    setItems(prevItems => {
      if (newQuantity <= 0) {
        return prevItems.filter(i => String(i._id || i.id || i.productId) !== String(productId));
      }
      return prevItems.map(i => {
        if (String(i._id || i.id || i.productId) === String(productId)) {
          return { ...i, quantity: newQuantity };
        }
        return i;
      });
    });

    // Sync quantity update to MongoDB Atlas
    if (newQuantity <= 0) {
      fetch(`/api/cart/item/${productId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'guest_session' })
      }).catch(err => console.error('MongoDB Cart Remove Error:', err));
    } else {
      fetch('/api/cart/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: newQuantity, sessionId: 'guest_session' })
      }).catch(err => console.error('MongoDB Cart Update Error:', err));
    }
  };

  const removeFromCart = (productId) => {
    setItems(prevItems => prevItems.filter(i => String(i._id || i.id || i.productId) !== String(productId)));

    fetch(`/api/cart/item/${productId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'guest_session' })
    }).catch(err => console.error('MongoDB Cart Remove Error:', err));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('kiranago_cart');

    fetch('/api/cart/clear', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'guest_session' })
    }).catch(err => console.error('MongoDB Cart Clear Error:', err));
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

    const sellingPrice = item.sellingPrice || item.price || 90;
    const mrp = item.price || item.mrp || sellingPrice;

    const itemTotal = sellingPrice * item.quantity;
    const itemMrpTotal = mrp * item.quantity;

    grandSubtotal += itemTotal;
    grandMrpTotal += itemMrpTotal;
    storeGroupsMap[storeId].storeSubtotal += itemTotal;
    storeGroupsMap[storeId].items.push({ ...item, sellingPrice, mrp, itemTotal });
  });

  const storeGroups = Object.values(storeGroupsMap);
  const totalDeliveryFee = storeGroups.length > 0 ? storeGroups.length * 15 : 0;
  const platformFee = items.length > 0 ? 5 : 0;
  const taxes = Math.round(grandSubtotal * 0.05);
  const totalSavings = Math.max(0, grandMrpTotal - grandSubtotal);
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
