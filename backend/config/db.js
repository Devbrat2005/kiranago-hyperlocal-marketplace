const mongoose = require('mongoose');
const models = require('../models');

// Helper to construct connection URI dynamically from environment variables
function getMongoURI() {
  let uri = process.env.MONGODB_URI;

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

// Mongoose-backed collection wrapper for unified model access
class MongooseCollectionAdapter {
  constructor(name) {
    this.name = name;
    this.model = modelMap[name] || null;
  }

  async find(query = {}) {
    if (this.model) {
      try {
        const docs = await this.model.find(query).lean();
        return docs;
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  async findOne(query = {}) {
    if (this.model) {
      try {
        return await this.model.findOne(query).lean();
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  async findById(id) {
    if (!id) return null;
    if (this.model) {
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
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  async insertOne(doc) {
    if (this.model) {
      const created = await this.model.create(doc);
      return created.toObject();
    }
    return null;
  }

  async insertMany(docs) {
    if (this.model) {
      const created = await this.model.insertMany(docs);
      return created.map(d => d.toObject());
    }
    return [];
  }

  async updateOne(query, update) {
    if (this.model) {
      try {
        const updated = await this.model.findOneAndUpdate(query, update, { new: true, upsert: true }).lean();
        return updated;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  async deleteOne(query) {
    if (this.model) {
      try {
        return await this.model.findOneAndDelete(query).lean();
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  async countDocuments(query = {}) {
    if (this.model) {
      try {
        return await this.model.countDocuments(query);
      } catch (e) {
        return 0;
      }
    }
    return 0;
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
