const fs = require('fs');
const path = require('path');

class MemoryCollection {
  constructor(name, dataDir) {
    this.name = name;
    this.filePath = path.join(dataDir, `${name}.json`);
    this.data = [];
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf8');
        this.data = JSON.parse(content);
      } else {
        this.data = [];
        this.save();
      }
    } catch (err) {
      console.error(`Error loading database collection ${this.name}:`, err.message);
      this.data = [];
    }
  }

  save() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error(`Error saving database collection ${this.name}:`, err.message);
    }
  }

  find(query = {}) {
    if (Object.keys(query).length === 0) return [...this.data];
    return this.data.filter(item => {
      for (const key in query) {
        if (query[key] && typeof query[key] === 'object' && query[key].$regex) {
          const regex = new RegExp(query[key].$regex, query[key].$options || 'i');
          if (!regex.test(item[key] || '')) return false;
        } else if (query[key] && typeof query[key] === 'object' && query[key].$in) {
          if (!query[key].$in.includes(item[key])) return false;
        } else if (query[key] && typeof query[key] === 'object' && query[key].$gte) {
          if (Number(item[key]) < Number(query[key].$gte)) return false;
        } else if (query[key] && typeof query[key] === 'object' && query[key].$lte) {
          if (Number(item[key]) > Number(query[key].$lte)) return false;
        } else if (item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  findOne(query = {}) {
    const results = this.find(query);
    return results.length > 0 ? { ...results[0] } : null;
  }

  findById(id) {
    return this.findOne({ _id: id }) || this.findOne({ id: id });
  }

  insertOne(doc) {
    const _id = doc._id || doc.id || 'id_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const newDoc = { _id, ...doc, createdAt: doc.createdAt || new Date().toISOString() };
    this.data.push(newDoc);
    this.save();
    return newDoc;
  }

  insertMany(docs) {
    const inserted = docs.map(doc => {
      const _id = doc._id || doc.id || 'id_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      return { _id, ...doc, createdAt: doc.createdAt || new Date().toISOString() };
    });
    this.data.push(...inserted);
    this.save();
    return inserted;
  }

  updateOne(query, update) {
    const index = this.data.findIndex(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });

    if (index !== -1) {
      const target = this.data[index];
      const updatedFields = update.$set ? update.$set : update;
      this.data[index] = { ...target, ...updatedFields, updatedAt: new Date().toISOString() };
      this.save();
      return this.data[index];
    }
    return null;
  }

  deleteOne(query) {
    const index = this.data.findIndex(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });

    if (index !== -1) {
      const removed = this.data.splice(index, 1);
      this.save();
      return removed[0];
    }
    return null;
  }

  countDocuments(query = {}) {
    return this.find(query).length;
  }
}

class KiranaDB {
  constructor() {
    this.dataDir = path.join(__dirname, '..', 'data_store');
    this.collections = {};
  }

  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = new MemoryCollection(name, this.dataDir);
    }
    return this.collections[name];
  }
}

const db = new KiranaDB();

module.exports = {
  db,
  connectDB: () => {
    console.log('⚡ KiranaDB Storage Engine Initialized (Persisted local JSON store)');
  }
};
