const path = require('path');
const fs = require('fs');
const models = require('../models');

async function seedDatabaseIfEmpty() {
  try {
    const { Category, Store, Product } = models;

    // 1. Categories
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      const categoriesPath = path.join(__dirname, '../data_store/categories.json');
      if (fs.existsSync(categoriesPath)) {
        const rawCat = fs.readFileSync(categoriesPath, 'utf8');
        const categoriesData = JSON.parse(rawCat);
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          console.log(`🌱 Auto Seeding ${categoriesData.length} Categories...`);
          const ops = categoriesData.map(c => {
            const id = c.id || c._id;
            return {
              updateOne: {
                filter: { id },
                update: { $set: { id, name: c.name, icon: c.icon || '🛒', image: c.image || '', itemCount: c.itemCount || '50+ Items', bgGradient: c.bgGradient || 'from-amber-50 to-orange-100' } },
                upsert: true
              }
            };
          });
          await Category.bulkWrite(ops);
        }
      }
    }

    // 2. Stores
    const storeCount = await Store.countDocuments();
    if (storeCount === 0) {
      const storesPath = path.join(__dirname, '../data_store/stores.json');
      if (fs.existsSync(storesPath)) {
        const rawStores = fs.readFileSync(storesPath, 'utf8');
        const storesData = JSON.parse(rawStores);
        if (Array.isArray(storesData) && storesData.length > 0) {
          console.log(`🌱 Auto Seeding ${storesData.length} Stores...`);
          const ops = storesData.map(s => {
            const id = s.id || s._id;
            const doc = { ...s, id, isApproved: true };
            delete doc._id;
            return {
              updateOne: {
                filter: { id },
                update: { $set: doc },
                upsert: true
              }
            };
          });
          await Store.bulkWrite(ops);
        }
      }
    }

    // 3. Products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const productsPath = path.join(__dirname, '../data_store/products.json');
      if (fs.existsSync(productsPath)) {
        const rawProds = fs.readFileSync(productsPath, 'utf8');
        const productsData = JSON.parse(rawProds);
        if (Array.isArray(productsData) && productsData.length > 0) {
          console.log(`🌱 Auto Seeding ${productsData.length} Products into MongoDB...`);
          const ops = productsData.map(p => {
            const id = p.id || p._id;
            const mrpVal = parseFloat(p.mrp) || parseFloat(p.price) || parseFloat(p.sellingPrice) || 100;
            const sellingPriceVal = parseFloat(p.sellingPrice) || parseFloat(p.price) || mrpVal || 90;
            const doc = {
              id,
              storeId: p.storeId || 'store_1',
              storeName: p.storeName || 'Kirana Partner',
              name: p.name,
              brand: p.brand || 'Generic',
              category: p.category || 'Grocery',
              categoryId: p.categoryId || 'cat_grocery',
              mrp: mrpVal,
              price: mrpVal,
              sellingPrice: sellingPriceVal,
              discount: p.discount || '0%',
              unit: p.weight || p.unit || '500 g',
              weight: p.weight || p.unit || '500 g',
              image: p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60',
              description: p.description || '',
              rating: parseFloat(p.rating) || 4.8,
              reviewsCount: parseInt(p.reviewsCount, 10) || 12,
              isPopular: Boolean(p.isPopular),
              isBestSeller: Boolean(p.isBestSeller),
              isRecommended: Boolean(p.isRecommended),
              stock: p.stock !== undefined ? parseInt(p.stock, 10) : 50,
              inStock: p.inStock !== undefined ? Boolean(p.inStock) : true
            };
            return {
              updateOne: {
                filter: { id },
                update: { $set: doc },
                upsert: true
              }
            };
          });
          await Product.bulkWrite(ops);
          const finalCount = await Product.countDocuments();
          console.log(`✅ Auto-Seeded ${finalCount} Products into MongoDB Atlas!`);
        }
      }
    }

  } catch (err) {
    console.error('Seeder execution error:', err.message);
  }
}

module.exports = seedDatabaseIfEmpty;
