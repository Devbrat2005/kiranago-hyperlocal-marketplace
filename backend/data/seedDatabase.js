const models = require('../models');
const seedCategories = require('./seedCategories');
const seedStores = require('./seedStores');
const { storeProducts } = require('./seedProducts');

async function seedDatabaseIfEmpty() {
  try {
    const { Category, Store, Product } = models;

    // Check Categories count
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0 && Array.isArray(seedCategories) && seedCategories.length > 0) {
      console.log('🌱 MongoDB Atlas: Seeding Categories...');
      await Category.insertMany(seedCategories.map(c => ({
        id: c.id,
        name: c.name,
        icon: c.icon || '🛒',
        image: c.image || '',
        itemCount: c.itemCount || '50+ Items',
        bgGradient: c.bgGradient || 'from-amber-50 to-orange-100'
      })), { ordered: false }).catch(err => console.log('Category seed notice:', err.message));
      console.log(`✅ Seeded ${seedCategories.length} Categories into MongoDB`);
    }

    // Check Stores count
    const storeCount = await Store.countDocuments();
    if (storeCount === 0 && Array.isArray(seedStores) && seedStores.length > 0) {
      console.log('🌱 MongoDB Atlas: Seeding Kirana Stores...');
      await Store.insertMany(seedStores.map(s => ({
        ...s,
        isApproved: true
      })), { ordered: false }).catch(err => console.log('Store seed notice:', err.message));
      console.log(`✅ Seeded ${seedStores.length} Stores into MongoDB`);
    }

    // Check Products count
    const productCount = await Product.countDocuments();
    if (productCount === 0 && Array.isArray(storeProducts) && storeProducts.length > 0) {
      console.log('🌱 MongoDB Atlas: Seeding Products...');
      const mappedProducts = storeProducts.map(p => ({
        id: p.id,
        storeId: p.storeId || 'store_1',
        storeName: p.storeName || 'Kirana Partner',
        name: p.name,
        brand: p.brand || 'Generic',
        category: p.category || 'Grocery',
        categoryId: p.categoryId || 'cat_grocery',
        mrp: p.mrp || p.price || p.sellingPrice || 100,
        price: p.price || p.mrp || p.sellingPrice || 100,
        sellingPrice: p.sellingPrice || p.price || p.mrp || 90,
        discount: p.discount || '0%',
        weight: p.weight || p.unit || '500 g',
        unit: p.unit || p.weight || '500 g',
        image: p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60',
        description: p.description || '',
        rating: p.rating || 4.8,
        reviewsCount: p.reviewsCount || 12,
        isPopular: p.isPopular || false,
        isBestSeller: p.isBestSeller || false,
        isRecommended: p.isRecommended || false,
        stock: p.stock !== undefined ? p.stock : 50,
        inStock: p.inStock !== undefined ? p.inStock : true
      }));

      await Product.insertMany(mappedProducts, { ordered: false }).catch(err => console.log('Product seed notice:', err.message));
      const newCount = await Product.countDocuments();
      console.log(`✅ Seeded ${newCount} Products into MongoDB Atlas!`);
    }

  } catch (err) {
    console.error('Seeder execution error:', err.message);
  }
}

module.exports = seedDatabaseIfEmpty;
