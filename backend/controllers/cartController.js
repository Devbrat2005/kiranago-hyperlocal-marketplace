const { db } = require('../config/db');

const cartsCol = db.collection('carts');
const productsCol = db.collection('products');
const storesCol = db.collection('stores');

exports.getCart = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : (req.query.sessionId || 'guest_session');
    let userCart = await cartsCol.findOne({ userId });

    if (!userCart) {
      userCart = { userId, items: [] };
    }

    // Refresh product details & calculate totals grouped by store
    const storeMap = {};
    let grandSubtotal = 0;
    let grandMrpTotal = 0;
    let itemCount = 0;

    for (const item of (userCart.items || [])) {
      const prod = await productsCol.findById(item.productId);
      if (!prod) continue;

      const storeId = prod.storeId || item.storeId || 'store_1';
      const store = (await storesCol.findById(storeId)) || { name: 'Kirana Partner', deliveryFee: 15, minimumOrder: 99 };

      if (!storeMap[storeId]) {
        storeMap[storeId] = {
          storeId,
          storeName: store.name,
          deliveryFee: store.deliveryFee !== undefined ? store.deliveryFee : 15,
          minimumOrder: store.minimumOrder || 99,
          items: [],
          storeSubtotal: 0
        };
      }

      const itemTotal = prod.sellingPrice * item.quantity;
      const itemMrpTotal = (prod.price || prod.mrp || prod.sellingPrice) * item.quantity;

      grandSubtotal += itemTotal;
      grandMrpTotal += itemMrpTotal;
      itemCount += item.quantity;

      storeMap[storeId].storeSubtotal += itemTotal;
      storeMap[storeId].items.push({
        productId: prod._id || prod.id,
        name: prod.name,
        brand: prod.brand || 'Generic',
        image: prod.image,
        weight: prod.unit || prod.weight || '1 unit',
        mrp: prod.price || prod.mrp || prod.sellingPrice,
        sellingPrice: prod.sellingPrice,
        discount: prod.discount || '0%',
        quantity: item.quantity,
        stock: prod.stock || 50,
        itemTotal
      });
    }

    const storeGroups = Object.values(storeMap);

    // Total delivery fee across stores
    let totalDeliveryFee = 0;
    storeGroups.forEach(grp => {
      // Free delivery if subtotal >= 500
      if (grp.storeSubtotal >= 500) {
        grp.deliveryFee = 0;
      }
      totalDeliveryFee += grp.deliveryFee;
    });

    const platformFee = grandSubtotal > 0 ? 5 : 0;
    const taxes = Math.round(grandSubtotal * 0.05); // 5% GST on items
    const totalDiscount = grandMrpTotal - grandSubtotal;
    const grandTotal = grandSubtotal + totalDeliveryFee + platformFee + taxes;

    res.json({
      success: true,
      cart: {
        userId,
        itemCount,
        storeGroups,
        grandMrpTotal,
        grandSubtotal,
        totalDiscount,
        totalDeliveryFee,
        platformFee,
        taxes,
        grandTotal
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : (req.body.sessionId || 'guest_session');
    const { productId, quantity = 1 } = req.body;

    const prod = await productsCol.findById(productId);
    if (!prod) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if ((prod.stock || 50) < 1) {
      return res.status(400).json({ success: false, message: 'Product is currently out of stock' });
    }

    let userCart = await cartsCol.findOne({ userId });
    if (!userCart) {
      userCart = await cartsCol.insertOne({ userId, items: [] });
    }

    const items = userCart.items || [];
    const existingIndex = items.findIndex(i => String(i.productId) === String(productId));
    if (existingIndex !== -1) {
      const newQty = items[existingIndex].quantity + parseInt(quantity);
      if (newQty > (prod.stock || 50)) {
        return res.status(400).json({ success: false, message: `Only ${prod.stock || 50} items available in stock` });
      }
      items[existingIndex].quantity = newQty;
    } else {
      items.push({
        productId: String(productId),
        storeId: prod.storeId,
        quantity: parseInt(quantity)
      });
    }

    await cartsCol.updateOne({ userId }, { items });

    res.json({ success: true, message: `${prod.name} added to cart!`, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : (req.body.sessionId || 'guest_session');
    const { productId, quantity } = req.body;

    let userCart = await cartsCol.findOne({ userId });
    if (!userCart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    let items = userCart.items || [];
    const qty = parseInt(quantity);
    if (qty <= 0) {
      items = items.filter(i => String(i.productId) !== String(productId));
    } else {
      const prod = await productsCol.findById(productId);
      if (prod && qty > (prod.stock || 50)) {
        return res.status(400).json({ success: false, message: `Only ${prod.stock || 50} items in stock` });
      }
      const item = items.find(i => String(i.productId) === String(productId));
      if (item) {
        item.quantity = qty;
      }
    }

    await cartsCol.updateOne({ userId }, { items });

    res.json({ success: true, message: 'Cart updated', items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : (req.body.sessionId || 'guest_session');
    const { productId } = req.params;

    let userCart = await cartsCol.findOne({ userId });
    if (userCart) {
      const items = (userCart.items || []).filter(i => String(i.productId) !== String(productId));
      await cartsCol.updateOne({ userId }, { items });
    }

    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : (req.body.sessionId || 'guest_session');
    await cartsCol.updateOne({ userId }, { items: [] });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
