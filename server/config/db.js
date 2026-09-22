const mongoose = require('mongoose');
const dns = require('dns');

// Force Node.js to use Google/Cloudflare public DNS to bypass ISP SRV lookup blocks
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (err) {
  console.log('DNS setServers notice:', err.message);
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // 5 seconds connection timeout
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    console.log(`⚠️ Falling back to Local JSON database (server/data/db.json) for offline testing...`);
    global.useMockDb = true;
    const { initDb } = require('./mockDbHelper');
    initDb();
  }
};

module.exports = connectDB;
