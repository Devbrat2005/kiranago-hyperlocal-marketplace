const { db } = require('../config/db');

const storesCol = db.collection('stores');
const productsCol = db.collection('products');
const reviewsCol = db.collection('reviews');

// Haversine formula to calculate distance between 2 GPS coordinates in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

exports.getStores = async (req, res) => {
  try {
    const {
      lat,
      lng,
      query,
      category,
      rating,
      popular,
      topRated,
      fastDelivery,
      openNow,
      maxDistance = 15
    } = req.query;

    let allStores = await storesCol.find({ isApproved: true });

    // Calculate distance if customer lat/lng supplied
    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;

    let processed = allStores.map(store => {
      let distance = 2.5; // fallback default distance in km
      if (userLat && userLng && store.latitude && store.longitude) {
        distance = calculateDistance(userLat, userLng, store.latitude, store.longitude);
      }
      const canDeliver = distance <= (store.deliveryRadius || 10);

      return {
        ...store,
        distance,
        canDeliver
      };
    });

    // Resilient distance filtering (falls back to all stores if GPS filtering yields 0 matches)
    let filtered = processed;
    if (userLat && userLng) {
      const distanceFiltered = processed.filter(s => s.canDeliver && s.distance <= parseFloat(maxDistance));
      if (distanceFiltered.length > 0) {
        filtered = distanceFiltered;
      }
    }

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.category && s.category.toLowerCase().includes(q)) ||
        (s.area && s.area.toLowerCase().includes(q))
      );
    }

    if (category) {
      filtered = filtered.filter(s => s.category && s.category.toLowerCase() === category.toLowerCase());
    }

    if (rating) {
      filtered = filtered.filter(s => s.rating >= parseFloat(rating));
    }

    if (popular === 'true') {
      const popFiltered = filtered.filter(s => s.isPopular);
      if (popFiltered.length > 0) filtered = popFiltered;
    }

    if (topRated === 'true') {
      const topFiltered = filtered.filter(s => s.isTopRated || s.rating >= 4.5);
      if (topFiltered.length > 0) filtered = topFiltered;
    }

    if (fastDelivery === 'true') {
      const fastFiltered = filtered.filter(s => s.isFastDelivery || (s.deliveryTime && (s.deliveryTime.includes('10-') || s.deliveryTime.includes('12-') || s.deliveryTime.includes('15-'))));
      if (fastFiltered.length > 0) filtered = fastFiltered;
    }

    if (openNow === 'true') {
      const openFiltered = filtered.filter(s => s.isOpen);
      if (openFiltered.length > 0) filtered = openFiltered;
    }

    // Sort by distance
    filtered.sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      count: filtered.length,
      stores: filtered
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await storesCol.findById(id);

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Fetch store products & reviews
    const storeProducts = await productsCol.find({ storeId: id });
    const reviews = await reviewsCol.find({ storeId: id });

    res.json({
      success: true,
      store,
      products: storeProducts,
      reviews
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.registerStore = async (req, res) => {
  try {
    const {
      name,
      ownerName,
      phone,
      email,
      address,
      area,
      city,
      pincode,
      latitude,
      longitude,
      gst,
      pan,
      bankDetails,
      image,
      logo,
      openingTime,
      closingTime,
      category,
      deliveryRadius,
      deliveryFee,
      minimumOrder
    } = req.body;

    const newStore = await storesCol.insertOne({
      name,
      ownerName,
      ownerId: req.user ? req.user.id : null,
      phone,
      email,
      address,
      area,
      city,
      pincode,
      latitude: parseFloat(latitude) || 12.9716,
      longitude: parseFloat(longitude) || 77.5946,
      gst,
      pan,
      bankDetails,
      image: image || 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&auto=format&fit=crop&q=60',
      logo: logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=60',
      rating: 4.5,
      reviewsCount: 0,
      openingTime: openingTime || '07:00 AM',
      closingTime: closingTime || '10:00 PM',
      category: category || 'General Store',
      deliveryRadius: parseFloat(deliveryRadius) || 7.0,
      deliveryFee: parseFloat(deliveryFee) || 15,
      minimumOrder: parseFloat(minimumOrder) || 99,
      deliveryTime: '15-25 mins',
      isOpen: true,
      isApproved: true, // Default active for seamless exploration
      isPopular: false,
      isTopRated: false
    });

    res.status(201).json({
      success: true,
      message: 'Store registration submitted successfully!',
      store: newStore
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStoreStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isOpen } = req.body;

    const updated = await storesCol.updateOne({ _id: id }, { isOpen });
    res.json({ success: true, message: `Store is now ${isOpen ? 'OPEN' : 'CLOSED'}`, store: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
