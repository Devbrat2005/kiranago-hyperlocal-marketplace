require('dotenv').config();
const mongoose = require('mongoose');
const models = require('../models');
const { getMongoURI, sanitizeURI } = require('../config/db');

async function verifyDatabaseConnection() {
  console.log('\n======================================================');
  console.log('🔍 KIRANAGO MONGODB ATLAS CONNECTION VERIFICATION');
  console.log('======================================================\n');

  const username = process.env.MONGODB_USERNAME || 'devbrat01042005_db_user';
  const rawPassword = process.env.MONGODB_PASSWORD || '<my MongoDB password>';
  const uri = getMongoURI();

  console.log(`👤 MONGODB_USERNAME : ${username}`);
  console.log(`🔑 MONGODB_PASSWORD : ${rawPassword === '<my MongoDB password>' || rawPassword === '<db_password>' ? '[PLACEHOLDER - NOT SET YET]' : '****'}`);
  console.log(`📌 SANITIZED URI    : ${sanitizeURI(uri)}\n`);

  if (uri.includes('<db_password>') || uri.includes('<my MongoDB password>') || rawPassword === '<my MongoDB password>') {
    console.warn('⚠️  MONGODB_PASSWORD in .env currently contains the placeholder "<my MongoDB password>".');
    console.warn('👉 Action required: Open .env and replace "<my MongoDB password>" with your actual MongoDB Atlas password.');
    console.log('\n======================================================\n');
    process.exit(0);
  }

  try {
    const startTime = Date.now();
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    const pingTime = Date.now() - startTime;

    console.log(`✅ Connection Status : CONNECTED (ReadyState: ${mongoose.connection.readyState})`);
    console.log(`🌐 Cluster Host       : ${mongoose.connection.host}`);
    console.log(`📁 Database Name     : ${mongoose.connection.name}`);
    console.log(`⚡ Ping Latency      : ${pingTime} ms\n`);

    // --- Read & Write Operation Test ---
    console.log('--- Executing Read & Write Integrity Test ---');
    const testSchema = new mongoose.Schema({ testField: String, timestamp: Date }, { collection: '_health_check_test' });
    const TestModel = mongoose.models._health_check_test || mongoose.model('_health_check_test', testSchema);

    // 1. Write Test
    const testDoc = await TestModel.create({ testField: 'KiranaGo_R_W_Test', timestamp: new Date() });
    console.log(`  [WRITE TEST]  Created document ID: ${testDoc._id}`);

    // 2. Read Test
    const readDoc = await TestModel.findById(testDoc._id);
    console.log(`  [READ TEST]   Read document value: "${readDoc.testField}"`);

    // 3. Update Test
    await TestModel.findByIdAndUpdate(testDoc._id, { testField: 'KiranaGo_R_W_Updated' });
    const updatedDoc = await TestModel.findById(testDoc._id);
    console.log(`  [UPDATE TEST] Updated document value: "${updatedDoc.testField}"`);

    // 4. Delete Test
    await TestModel.findByIdAndDelete(testDoc._id);
    console.log(`  [DELETE TEST] Cleaned up test document ID: ${testDoc._id}`);
    console.log('✅ Read & Write Integrity Test Passed Successfully!\n');

    console.log('--- Collection Document Counts ---');
    for (const [modelName, Model] of Object.entries(models)) {
      try {
        const count = await Model.countDocuments();
        console.log(`  - ${modelName.padEnd(16)}: ${count} documents`);
      } catch (cntErr) {
        console.log(`  - ${modelName.padEnd(16)}: Error (${cntErr.message})`);
      }
    }

    console.log('\n🎉 MongoDB Atlas verification completed successfully!');
    console.log('======================================================\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Failed to connect to MongoDB Atlas: ${err.message}`);
    console.log('======================================================\n');
    process.exit(1);
  }
}

verifyDatabaseConnection();
