const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

async function clearData() {
  console.log('--- Clearing Database Data ---');

  // 1. Clear Mock JSON DB if exists
  const dbPath = path.join(__dirname, 'data/db.json');
  if (fs.existsSync(dbPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      data.orders = [];
      data.transactions = [];
      data.reviews = [];
      
      // Reset user ratings
      if (data.users) {
        data.users.forEach(u => {
          u.riderRating = 0;
          u.riderRatingCount = 0;
        });
      };
      if (data.foods) {
        data.foods.forEach(f => {
          f.rating = 0;
          f.ratingCount = 0;
        });
      }

      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
      console.log('Cleared mock json db at:', dbPath);
    } catch (err) {
      console.error('Failed to clear mock json database:', err.message);
    }
  }

  // 2. Clear MongoDB Collections
  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('Connected to MongoDB database');

      // Clear orders
      const orderCount = await mongoose.connection.db.collection('orders').deleteMany({});
      console.log(`Deleted ${orderCount.deletedCount} orders from MongoDB`);

      // Clear transactions
      const txCount = await mongoose.connection.db.collection('transactions').deleteMany({});
      console.log(`Deleted ${txCount.deletedCount} transactions from MongoDB`);

      // Clear reviews
      const reviewCount = await mongoose.connection.db.collection('reviews').deleteMany({});
      console.log(`Deleted ${reviewCount.deletedCount} reviews from MongoDB`);

      // Reset rider ratings on users
      const userUpdateResult = await mongoose.connection.db.collection('users').updateMany(
        {},
        {
          $set: {
            riderRating: 0,
            riderRatingCount: 0
          }
        }
      );
      console.log(`Reset rider ratings on ${userUpdateResult.modifiedCount} user documents`);

      // Reset food ratings on foods
      const foodUpdateResult = await mongoose.connection.db.collection('foods').updateMany(
        {},
        {
          $set: {
            rating: 0,
            ratingCount: 0
          }
        }
      );
      console.log(`Reset food ratings on ${foodUpdateResult.modifiedCount} food documents`);

      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    } catch (err) {
      console.error('Failed to clear MongoDB collections:', err.message);
    }
  } else {
    console.log('No MONGO_URI found in server env file.');
  }

  console.log('--- Database Clear Complete ---');
}

clearData();
