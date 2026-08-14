const { db } = require('../config/db');

const productsCol = db.collection('products');
const storesCol = db.collection('stores');

exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      storeId,
      brand,
      query,
      minPrice,
      maxPrice,
      rating,
      popular,
      bestSeller,
      recommended,
      sort,
      limit = 100
    } = req.query;

    let products = productsCol.find({});

    if (storeId) {
      products = products.filter(p => p.storeId === storeId);
    }

    if (category) {
      products = products.filter(p =>
        (p.category && p.category.toLowerCase() === category.toLowerCase()) ||
        (p.categoryId && p.categoryId.toLowerCase() === category.toLowerCase())
      );
    }

    if (brand) {
      products = products.filter(p => p.brand && p.brand.toLowerCase() === brand.toLowerCase());
    }

    if (query) {
      const q = query.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (minPrice) {
      products = products.filter(p => p.sellingPrice >= parseFloat(minPrice));
    }

    if (maxPrice) {
      products = products.filter(p => p.sellingPrice <= parseFloat(maxPrice));
    }

    if (rating) {
      products = products.filter(p => p.rating >= parseFloat(rating));
    }

    if (popular === 'true') {
      products = products.filter(p => p.isPopular);
    }

    if (bestSeller === 'true') {
      products = products.filter(p => p.isBestSeller);
    }

    if (recommended === 'true') {
      products = products.filter(p => p.isRecommended);
    }

    // Sorting
    if (sort === 'price_asc') {
      products.sort((a, b) => a.sellingPrice - b.sellingPrice);
    } else if (sort === 'price_desc') {
      products.sort((a, b) => b.sellingPrice - a.sellingPrice);
    } else if (sort === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'discount') {
      products.sort((a, b) => b.discount - a.discount);
    }

    const total = products.length;
    const paginated = products.slice(0, parseInt(limit));

    // Enrich with store name
    const enriched = paginated.map(p => {
      const store = storesCol.findById(p.storeId);
      return {
        ...p,
        storeName: store ? store.name : 'Kirana Partner'
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      total,
      products: enriched
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = productsCol.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const store = storesCol.findById(product.storeId);

    res.json({
      success: true,
      product: {
        ...product,
        storeName: store ? store.name : 'Kirana Partner',
        store: store || null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      categoryId,
      storeId,
      image,
      description,
      weight,
      mrp,
      sellingPrice,
      stock,
      sku
    } = req.body;

    const mrpValue = parseFloat(mrp) || 100;
    const sellValue = parseFloat(sellingPrice) || mrpValue;
    const discountPct = mrpValue > sellValue ? Math.round(((mrpValue - sellValue) / mrpValue) * 100) : 0;

    const newProd = productsCol.insertOne({
      name,
      brand: brand || 'Generic',
      category: category || 'Grocery',
      categoryId: categoryId || 'cat_grocery',
      storeId: storeId || req.user.storeId || 'store_1',
      image: image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60',
      description: description || 'Fresh high-quality product',
      weight: weight || '500 g',
      mrp: mrpValue,
      sellingPrice: sellValue,
      discount: discountPct,
      stock: parseInt(stock) || 50,
      sku: sku || `PROD-${Date.now().toString(36)}`,
      rating: 4.8,
      reviewsCount: 0,
      isPopular: true,
      isBestSeller: false,
      isRecommended: true,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ success: true, message: 'Product created successfully', product: newProd });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.mrp || updates.sellingPrice) {
      const existing = productsCol.findById(id);
      const mrp = updates.mrp ? parseFloat(updates.mrp) : existing.mrp;
      const sellingPrice = updates.sellingPrice ? parseFloat(updates.sellingPrice) : existing.sellingPrice;
      updates.discount = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
    }

    const updated = productsCol.updateOne({ _id: id }, updates);
    res.json({ success: true, message: 'Product updated successfully', product: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    productsCol.deleteOne({ _id: id });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
