const { db } = require('../config/db');

const productsCol = db.collection('products');
const storesCol = db.collection('stores');
const categoriesCol = db.collection('categories');

// Haversine distance calculator
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 2.5;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

exports.globalSearch = async (req, res) => {
  try {
    const {
      q = '',
      lat,
      lng,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      sort,
      limit = 40
    } = req.query;

    const queryStr = q.trim().toLowerCase();
    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;

    // 1. Search Products
    let matchedProducts = await productsCol.find({});

    if (queryStr) {
      matchedProducts = matchedProducts.filter(p =>
        p.name.toLowerCase().includes(queryStr) ||
        (p.brand && p.brand.toLowerCase().includes(queryStr)) ||
        (p.category && p.category.toLowerCase().includes(queryStr)) ||
        (p.description && p.description.toLowerCase().includes(queryStr))
      );
    }

    if (category) {
      matchedProducts = matchedProducts.filter(p =>
        (p.category && p.category.toLowerCase() === category.toLowerCase()) ||
        p.categoryId === category
      );
    }

    if (brand) {
      matchedProducts = matchedProducts.filter(p => p.brand && p.brand.toLowerCase() === brand.toLowerCase());
    }

    if (minPrice) {
      matchedProducts = matchedProducts.filter(p => p.sellingPrice >= parseFloat(minPrice));
    }

    if (maxPrice) {
      matchedProducts = matchedProducts.filter(p => p.sellingPrice <= parseFloat(maxPrice));
    }

    if (minRating) {
      matchedProducts = matchedProducts.filter(p => p.rating >= parseFloat(minRating));
    }

    // Enrich products with store distance & name asynchronously
    const storeCache = {};
    matchedProducts = await Promise.all(matchedProducts.map(async p => {
      if (!storeCache[p.storeId]) {
        storeCache[p.storeId] = await storesCol.findById(p.storeId);
      }
      const store = storeCache[p.storeId];
      const distance = (userLat && userLng && store)
        ? calculateDistance(userLat, userLng, store.latitude, store.longitude)
        : 2.5;

      return {
        ...p,
        storeName: store ? store.name : 'Kirana Store',
        storeRating: store ? store.rating : 4.8,
        distance
      };
    }));

    // Sorting products
    if (sort === 'price_low') {
      matchedProducts.sort((a, b) => a.sellingPrice - b.sellingPrice);
    } else if (sort === 'price_high') {
      matchedProducts.sort((a, b) => b.sellingPrice - a.sellingPrice);
    } else if (sort === 'distance') {
      matchedProducts.sort((a, b) => a.distance - b.distance);
    } else if (sort === 'rating') {
      matchedProducts.sort((a, b) => b.rating - a.rating);
    }

    // 2. Search Stores
    let matchedStores = await storesCol.find({ isApproved: true });
    if (queryStr) {
      matchedStores = matchedStores.filter(s =>
        s.name.toLowerCase().includes(queryStr) ||
        (s.category && s.category.toLowerCase().includes(queryStr)) ||
        (s.area && s.area.toLowerCase().includes(queryStr))
      );
    }

    matchedStores = matchedStores.map(s => {
      const distance = (userLat && userLng)
        ? calculateDistance(userLat, userLng, s.latitude, s.longitude)
        : 2.5;
      return { ...s, distance };
    });

    // 3. Search Categories
    let matchedCategories = await categoriesCol.find({});
    if (queryStr) {
      matchedCategories = matchedCategories.filter(c => c.name.toLowerCase().includes(queryStr));
    }

    // 4. Extract Unique Brands
    const allProducts = await productsCol.find({});
    const allBrands = Array.from(new Set(allProducts.map(p => p.brand).filter(Boolean)));
    const matchedBrands = queryStr
      ? allBrands.filter(b => b.toLowerCase().includes(queryStr))
      : allBrands.slice(0, 10);

    // 5. Suggestions
    const suggestions = [];
    if (queryStr) {
      matchedProducts.slice(0, 5).forEach(p => suggestions.push(p.name));
      matchedStores.slice(0, 3).forEach(s => suggestions.push(s.name));
      matchedCategories.slice(0, 3).forEach(c => suggestions.push(c.name));
    }

    res.json({
      success: true,
      query: q,
      counts: {
        products: matchedProducts.length,
        stores: matchedStores.length,
        categories: matchedCategories.length,
        brands: matchedBrands.length
      },
      suggestions: Array.from(new Set(suggestions)),
      products: matchedProducts.slice(0, parseInt(limit)),
      stores: matchedStores.slice(0, 10),
      categories: matchedCategories,
      brands: matchedBrands
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
