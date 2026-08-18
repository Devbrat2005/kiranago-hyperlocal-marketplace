const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load env from backend/.env if available
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { connectDB, getMongoURI, sanitizeURI } = require('../config/db');
const models = require('../models');

async function seedMongoAtlas() {
  console.log('\n==================================================');
  console.log('🌱 KiranaGo MongoDB Atlas Bulk Database Seeder');
  console.log('==================================================\n');

  const uri = getMongoURI();
  console.log(`Connecting to database: ${sanitizeURI(uri)}`);

  const connected = await connectDB();
  if (!connected) {
    console.error('❌ Could not connect to MongoDB Atlas. Ensure MONGODB_URI is set and 0.0.0.0/0 is whitelisted in Atlas Network Access.');
    process.exit(1);
  }

  const dbName = mongoose.connection.name;
  console.log(`✅ Connected to MongoDB Database: "${dbName}"`);

  const { Category, Store, Product } = models;

  // 1. Seed Categories (26 Categories)
  const categoriesPath = path.join(__dirname, '../data_store/categories.json');
  if (fs.existsSync(categoriesPath)) {
    const rawCat = fs.readFileSync(categoriesPath, 'utf8');
    const categoriesData = JSON.parse(rawCat);
    if (Array.isArray(categoriesData) && categoriesData.length > 0) {
      console.log(`\n📦 Processing ${categoriesData.length} Categories...`);
      const catOps = categoriesData.map(c => {
        const id = c.id || c._id;
        const doc = {
          id,
          name: c.name,
          icon: c.icon || '🛒',
          image: c.image || '',
          itemCount: c.itemCount || '50+ Items',
          bgGradient: c.bgGradient || 'from-amber-50 to-orange-100'
        };
        return {
          updateOne: {
            filter: { id },
            update: { $set: doc },
            upsert: true
          }
        };
      });
      await Category.bulkWrite(catOps);
      const totalCat = await Category.countDocuments();
      console.log(`✅ Categories in MongoDB: ${totalCat}`);
    }
  }

  // 2. Seed Stores (30 Stores)
  const storesPath = path.join(__dirname, '../data_store/stores.json');
  if (fs.existsSync(storesPath)) {
    const rawStores = fs.readFileSync(storesPath, 'utf8');
    const storesData = JSON.parse(rawStores);
    if (Array.isArray(storesData) && storesData.length > 0) {
      console.log(`\n🏪 Processing ${storesData.length} Stores...`);
      const storeOps = storesData.map(s => {
        const id = s.id || s._id;
        const doc = {
          ...s,
          id,
          isApproved: true
        };
        delete doc._id; // avoid immutable _id type conflicts during upsert
        return {
          updateOne: {
            filter: { id },
            update: { $set: doc },
            upsert: true
          }
        };
      });
      await Store.bulkWrite(storeOps);
      const totalStores = await Store.countDocuments();
      console.log(`✅ Stores in MongoDB: ${totalStores}`);
    }
  }

  // 3. Seed Products (876 Products)
  const productsPath = path.join(__dirname, '../data_store/products.json');
  if (fs.existsSync(productsPath)) {
    const rawProds = fs.readFileSync(productsPath, 'utf8');
    const productsData = JSON.parse(rawProds);
    if (Array.isArray(productsData) && productsData.length > 0) {
      console.log(`\n🛒 Processing ${productsData.length} Products...`);
      const prodOps = productsData.map(p => {
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
      await Product.bulkWrite(prodOps);
      const totalProds = await Product.countDocuments();
      console.log(`✅ Products in MongoDB Atlas Collection "products": ${totalProds}`);
    }
  }

  console.log('\n==================================================');
  console.log('🎉 MongoDB Atlas Seeding Completed Successfully!');
  console.log('==================================================\n');

  process.exit(0);
}

seedMongoAtlas().catch(err => {
  console.error('❌ Seed Script Error:', err);
  process.exit(1);
});
