const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const models = require('../models');

// Disable Mongoose command buffering so queries fail-fast when DB is disconnected
mongoose.set('bufferCommands', false);

// In-memory fallback data cache for offline / disconnected DB mode
const memoryStore = {};

function getFallbackData(collectionName) {
  if (!memoryStore[collectionName]) {
    const jsonPath = path.join(__dirname, '../data_store', `${collectionName}.json`);
    try {
      if (fs.existsSync(jsonPath)) {
        const raw = fs.readFileSync(jsonPath, 'utf8');
        memoryStore[collectionName] = JSON.parse(raw);
      } else {
        memoryStore[collectionName] = [];
      }
    } catch (err) {
      memoryStore[collectionName] = [];
    }
  }
  return memoryStore[collectionName];
}

// Helper to construct connection URI dynamically from environment variables
function getMongoURI() {
  let uri = process.env.MONGODB_URI;

  if (uri && !uri.includes('<db_password>') && !uri.includes('<my MongoDB password>')) {
    return uri;
  }

  const username = process.env.MONGODB_USERNAME || 'devbrat01042005_db_user';
  const password = process.env.MONGODB_PASSWORD;

  if (password && password !== '<my MongoDB password>' && password !== '<db_password>') {
    const encodedUser = encodeURIComponent(username);
    const encodedPass = encodeURIComponent(password);
    uri = `mongodb+srv://${encodedUser}:${encodedPass}@cluster0.gvvseka.mongodb.net/kiranago?retryWrites=true&w=majority&appName=Cluster0`;
  }

  return uri;
}

// Helper to sanitize database URI for logging (never expose password in logs)
function sanitizeURI(uri) {
  if (!uri) return 'NOT_CONFIGURED';
  return uri.replace(/\/\/(.*):(.*)@/, '//$1:****@');
}

// Mapping collection names to Mongoose models
const modelMap = {
  users: models.User,
  stores: models.Store,
  products: models.Product,
  categories: models.Category,
  orders: models.Order,
  carts: models.Cart,
  delivery_jobs: models.DeliveryJob,
  deliveryPartners: models.DeliveryJob,
  support_tickets: models.SupportTicket,
  coupons: models.Coupon,
  ai_conversations: models.AIConversation,
  reviews: models.Review
};

// Database Connection function
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }
  if (mongoose.connection.readyState === 2) {
    return true;
  }

  const uri = getMongoURI();

  if (!uri) {
    console.warn('⚠️ MONGODB_URI is not set in environment variables.');
    return false;
  }

  if (uri.includes('<db_password>') || uri.includes('<my MongoDB password>')) {
    console.warn('\n' + '='.repeat(70));
    console.warn('⚠️  MONGODB ATLAS CONNECTION NOTICE');
    console.warn(`   Connecting string: ${sanitizeURI(uri)}`);
    console.warn('   Please replace "<my MongoDB password>" in .env with your actual password.');
    console.warn('='.repeat(70) + '\n');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'kiranago',
      serverSelectionTimeoutMS: 5000
    });
    console.log(`🚀 MongoDB Atlas Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
    
    // Auto Seed DB if connected
    const seedDatabaseIfEmpty = require('../data/seedDatabase');
    await seedDatabaseIfEmpty();

    return true;
  } catch (err) {
    console.error(`❌ MongoDB Atlas Connection Error: ${err.message}`);
    return false;
  }
};

// Unified collection wrapper with Mongoose + JSON fallback
class MongooseCollectionAdapter {
  constructor(name) {
    this.name = name;
    this.model = modelMap[name] || null;
  }

  isDbConnected() {
    return mongoose.connection.readyState === 1;
  }

  async find(query = {}) {
    if (this.isDbConnected() && this.model) {
      try {
        const results = await this.model.find(query).lean();
        if (Array.isArray(results) && results.length > 0) {
          return results;
        }
      } catch (e) {}
    }
    // Offline / empty DB collection fallback
    const items = getFallbackData(this.name);
    if (!query || Object.keys(query).length === 0) return [...items];
    return items.filter(item => {
      return Object.entries(query).every(([k, v]) => item[k] === v);
    });
  }

  async findOne(query = {}) {
    if (this.isDbConnected() && this.model) {
      try {
        return await this.model.findOne(query).lean();
      } catch (e) {}
    }
    const items = getFallbackData(this.name);
    return items.find(item => Object.entries(query).every(([k, v]) => item[k] === v)) || null;
  }

  async findById(id) {
    if (!id) return null;
    if (this.isDbConnected() && this.model) {
      const isValidObjId = mongoose.Types.ObjectId.isValid(id) && String(id).length === 24;
      if (isValidObjId) {
        try {
          const doc = await this.model.findById(id).lean();
          if (doc) return doc;
        } catch (e) {}
      }
      try {
        const orConditions = [{ id: String(id) }, { storeId: String(id) }, { orderId: String(id) }, { jobId: String(id) }, { ticketId: String(id) }];
        if (isValidObjId) {
          orConditions.push({ _id: id });
        }
        return await this.model.findOne({ $or: orConditions }).lean();
      } catch (e) {}
    }
    const items = getFallbackData(this.name);
    return items.find(item => item._id === id || item.id === String(id) || item.storeId === String(id) || item.orderId === String(id)) || null;
  }

  async insertOne(doc) {
    if (this.isDbConnected() && this.model) {
      try {
        const created = await this.model.create(doc);
        return created.toObject();
      } catch (e) {}
    }
    const items = getFallbackData(this.name);
    const newDoc = { id: `id_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, ...doc };
    items.push(newDoc);
    return newDoc;
  }

  async insertMany(docs) {
    if (this.isDbConnected() && this.model) {
      try {
        const created = await this.model.insertMany(docs);
        return created.map(d => d.toObject());
      } catch (e) {}
    }
    const items = getFallbackData(this.name);
    items.push(...docs);
    return docs;
  }

  async updateOne(query, update) {
    if (this.isDbConnected() && this.model) {
      try {
        const updated = await this.model.findOneAndUpdate(query, update, { new: true, upsert: true }).lean();
        return updated;
      } catch (e) {}
    }
    const items = getFallbackData(this.name);
    const item = items.find(i => Object.entries(query).every(([k, v]) => i[k] === v));
    if (item) {
      Object.assign(item, update);
      return item;
    }
    return null;
  }

  async deleteOne(query) {
    if (this.isDbConnected() && this.model) {
      try {
        return await this.model.findOneAndDelete(query).lean();
      } catch (e) {}
    }
    const items = getFallbackData(this.name);
    const idx = items.findIndex(i => Object.entries(query).every(([k, v]) => i[k] === v));
    if (idx !== -1) {
      return items.splice(idx, 1)[0];
    }
    return null;
  }

  async countDocuments(query = {}) {
    if (this.isDbConnected() && this.model) {
      try {
        return await this.model.countDocuments(query);
      } catch (e) {}
    }
    const items = getFallbackData(this.name);
    if (!query || Object.keys(query).length === 0) return items.length;
    return items.filter(i => Object.entries(query).every(([k, v]) => i[k] === v)).length;
  }
}

class KiranaDBAdapter {
  collection(name) {
    return new MongooseCollectionAdapter(name);
  }
}

const db = new KiranaDBAdapter();

const getDbStatus = () => {
  const states = {
    0: 'DISCONNECTED',
    1: 'CONNECTED',
    2: 'CONNECTING',
    3: 'DISCONNECTING'
  };
  const stateCode = mongoose.connection.readyState;
  return {
    stateCode,
    status: states[stateCode] || 'UNKNOWN',
    host: mongoose.connection.host || null,
    dbName: mongoose.connection.name || null
  };
};

module.exports = {
  connectDB,
  getMongoURI,
  sanitizeURI,
  db,
  getDbStatus,
  models
};

