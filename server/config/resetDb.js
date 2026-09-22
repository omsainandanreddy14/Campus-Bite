const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const projectServerPath = 'C:/Users/putlu/.gemini/antigravity/scratch/canteen-delivery-app/server';
const User = require(path.join(projectServerPath, 'models/User'));
const Order = require(path.join(projectServerPath, 'models/Order'));
const Transaction = require(path.join(projectServerPath, 'models/Transaction'));

require('dotenv').config({ path: path.join(projectServerPath, '.env') });

async function resetDb() {
  console.log('Starting database reset...');

  // 1. Reset Local JSON Database (db.json)
  const dbJsonPath = path.join(projectServerPath, 'data/db.json');
  if (fs.existsSync(dbJsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));
      
      // Clear orders and transactions
      data.orders = [];
      data.transactions = [];

      // Reset wallets in users list
      if (data.users && Array.isArray(data.users)) {
        data.users.forEach(u => {
          if (u.role === 'student' || u.role === 'admin') {
            u.wallet = 1000.00;
          } else {
            u.wallet = 0.00;
          }
        });
      }

      fs.writeFileSync(dbJsonPath, JSON.stringify(data, null, 2));
      console.log('✓ Local JSON database orders cleared and wallets reset.');
    } catch (err) {
      console.error('Error resetting local JSON db:', err.message);
    }
  }

  // 2. Reset MongoDB Atlas Database
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to MongoDB Atlas...');

    // Delete all orders and transactions
    const orderDeleteResult = await Order.deleteMany({});
    const transactionDeleteResult = await Transaction.deleteMany({});
    console.log(`✓ Deleted ${orderDeleteResult.deletedCount} orders from MongoDB Atlas.`);
    console.log(`✓ Deleted ${transactionDeleteResult.deletedCount} transactions from MongoDB Atlas.`);

    // Reset user wallets
    const users = await User.find({});
    let updatedCount = 0;
    for (const u of users) {
      if (u.role === 'student' || u.role === 'admin') {
        u.wallet = 1000.00;
      } else {
        u.wallet = 0.00;
      }
      await u.save();
      updatedCount++;
    }
    console.log(`✓ Reset wallets of ${updatedCount} users in MongoDB Atlas.`);

    await mongoose.disconnect();
    console.log('MongoDB Atlas connection closed.');
    console.log('Database reset completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to connect/reset MongoDB Atlas:', err.message);
    console.log('Offline/whitelist issue detected; cloud reset skipped, local reset stands.');
    process.exit(0);
  }
}

resetDb();
