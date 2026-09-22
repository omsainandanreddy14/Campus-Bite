const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../data/db.json');

class MockQueryChain {
  constructor(promise) {
    this.promise = promise;
  }
  select() { return this; }
  sort() { return this; }
  populate() { return this; }
  then(onFulfilled, onRejected) {
    return this.promise.then(onFulfilled, onRejected);
  }
  catch(onRejected) {
    return this.promise.catch(onRejected);
  }
}

function initDb() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(dbPath)) {
    const salt = bcrypt.genSaltSync(10);
    const defaultPasswordHash = bcrypt.hashSync('password123', salt);

    const defaultUsers = [
      { _id: 'u1', name: 'Om Sai', email: 'omsainandanreddy@gmail.com', password: defaultPasswordHash, role: 'admin', status: 'Active', wallet: 1000.00, kitchenStatus: 'Open', announcement: '', riderRating: 5.00, riderRatingCount: 0 },
      { _id: 'u2', name: 'Nani', email: 'nani@gmail.com', password: defaultPasswordHash, role: 'student', status: 'Active', wallet: 1000.00, kitchenStatus: 'Open', announcement: '', riderRating: 5.00, riderRatingCount: 0 },
      { _id: 'u3', name: 'Canteen', email: 'canteen@gmail.com', password: defaultPasswordHash, role: 'canteen', status: 'Active', wallet: 0.00, kitchenStatus: 'Open', announcement: '', riderRating: 5.00, riderRatingCount: 0 },
      { _id: 'u4', name: 'Canteen2', email: 'canteen2@gmail.com', password: defaultPasswordHash, role: 'canteen', status: 'Active', wallet: 0.00, kitchenStatus: 'Open', announcement: '', riderRating: 5.00, riderRatingCount: 0 },
      { _id: 'u5', name: 'Delivery1', email: 'delivery1@gmail.com', password: defaultPasswordHash, role: 'delivery', status: 'Active', wallet: 0.00, kitchenStatus: 'Open', announcement: '', riderRating: 5.00, riderRatingCount: 0 },
      { _id: 'u6', name: 'canteen3', email: 'canteen3@gmail.com', password: defaultPasswordHash, role: 'canteen', status: 'Active', wallet: 0.00, kitchenStatus: 'Open', announcement: '', riderRating: 5.00, riderRatingCount: 0 },
      { _id: 'u7', name: 'student2', email: 'student2@gmail.com', password: defaultPasswordHash, role: 'student', status: 'Active', wallet: 1000.00, kitchenStatus: 'Open', announcement: '', riderRating: 5.00, riderRatingCount: 0 }
    ];

    const defaultFoods = [
      { _id: 'f1', name: 'Paneer Biryani', price: 150, category: 'Biryani', isVeg: true, canteen: 'Canteen', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500', rating: 5.00, ratingCount: 0 },
      { _id: 'f2', name: 'Chicken Biryani', price: 180, category: 'Biryani', isVeg: false, canteen: 'Canteen', img: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500', rating: 5.00, ratingCount: 0 },
      { _id: 'f3', name: 'Veg Cheese Burger', price: 90, category: 'Burgers', isVeg: true, canteen: 'Canteen', img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500', rating: 5.00, ratingCount: 0 },
      { _id: 'f4', name: 'Chicken Spicy Burger', price: 120, category: 'Burgers', isVeg: false, canteen: 'Canteen', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', rating: 5.00, ratingCount: 0 },
      { _id: 'f5', name: 'Margherita Pizza', price: 200, category: 'Pizza', isVeg: true, canteen: 'Canteen', img: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500', rating: 5.00, ratingCount: 0 },
      { _id: 'f6', name: 'Paneer Butter Masala Biryani', price: 160, category: 'Biryani', isVeg: true, canteen: 'Canteen2', img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500', rating: 5.00, ratingCount: 0 },
      { _id: 'f7', name: 'Chicken Masala Biryani', price: 190, category: 'Biryani', isVeg: false, canteen: 'Canteen2', img: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500', rating: 5.00, ratingCount: 0 },
      { _id: 'f8', name: 'Veg Double Cheese Pizza', price: 220, category: 'Pizza', isVeg: true, canteen: 'Canteen2', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500', rating: 5.00, ratingCount: 0 },
      { _id: 'f9', name: 'Paneer Tikka Roll', price: 110, category: 'Rolls', isVeg: true, canteen: 'Canteen2', img: 'https://images.unsplash.com/photo-1626776878856-11f81df98d7f?w=500', rating: 5.00, ratingCount: 0 },
      { _id: 'f10', name: 'Chicken Shawarma Roll', price: 130, category: 'Rolls', isVeg: false, canteen: 'Canteen2', img: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=500', rating: 5.00, ratingCount: 0 },
      { _id: 'f11', name: 'Paneer Pulao Special', price: 140, category: 'Biryani', isVeg: true, canteen: 'canteen3', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500', rating: 5.00, ratingCount: 0 },
      { _id: 'f12', name: 'Egg Fried Rice', price: 130, category: 'Biryani', isVeg: false, canteen: 'canteen3', img: 'https://images.unsplash.com/photo-1603133872878-696803c170ff?w=500', rating: 5.00, ratingCount: 0 },
      { _id: 'f13', name: 'Veg Noodles Spicy', price: 100, category: 'Noodles', isVeg: true, canteen: 'canteen3', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500', rating: 5.00, ratingCount: 0 },
      { _id: 'f14', name: 'Chicken Schezwan Noodles', price: 140, category: 'Noodles', isVeg: false, canteen: 'canteen3', img: 'https://images.unsplash.com/photo-1612966608967-312ba599102e?w=500', rating: 5.00, ratingCount: 0 },
      { _id: 'f15', name: 'Veg Hakka Noodles', price: 110, category: 'Noodles', isVeg: true, canteen: 'canteen3', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500', rating: 5.00, ratingCount: 0 }
    ];

    fs.writeFileSync(dbPath, JSON.stringify({ users: defaultUsers, foods: defaultFoods, orders: [], transactions: [], reviews: [] }, null, 2));
  }
}

function readDb() {
  initDb();
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  if (!data.vouchers) {
    data.vouchers = [];
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  }
  return data;
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function wrapDocument(collectionName, obj) {
  if (!obj) return null;
  const doc = { ...obj };

  doc.save = async function() {
    const data = readDb();
    const index = data[collectionName].findIndex(item => item._id === doc._id || (doc.id && item.id === doc.id));
    if (index !== -1) {
      data[collectionName][index] = { ...doc };
      writeDb(data);
    }
    return doc;
  };

  if (collectionName === 'users') {
    if (!doc.specialDishes) doc.specialDishes = [];
    if (!doc.announcement) doc.announcement = '';
    if (!doc.specialDishId) doc.specialDishId = '';
    if (!doc.specialDishPrice) doc.specialDishPrice = 0;
    if (!doc.customSpecialDishName) doc.customSpecialDishName = '';
    if (!doc.customSpecialDishPrice) doc.customSpecialDishPrice = 0;
    doc.matchPassword = async function(enteredPassword) {
      return bcrypt.compareSync(enteredPassword, doc.password);
    };
  }

  if (collectionName === 'vouchers') {
    if (!doc.excludedCanteens) doc.excludedCanteens = [];
  }

  return doc;
}

const mockDbHelper = {
  find(collectionName, query = {}) {
    const p = new Promise((resolve) => {
      const data = readDb();
      let results = data[collectionName] || [];

      results = results.filter(item => {
        if (query.$or && Array.isArray(query.$or)) {
          const matchOr = query.$or.some(clause => {
            for (const key in clause) {
              const val = clause[key];
              if (item[key] !== val) return false;
            }
            return true;
          });
          if (!matchOr) return false;
        }

        for (const key in query) {
          if (key === '$or') continue;
          const val = query[key];
          if (val instanceof RegExp) {
            if (!val.test(item[key])) return false;
          } else if (typeof val === 'object' && val !== null && val.$regex) {
            const regex = new RegExp(val.$regex, val.$options || '');
            if (!regex.test(item[key])) return false;
          } else {
            if (item[key] !== val) return false;
          }
        }
        return true;
      });

      resolve(results.map(item => wrapDocument(collectionName, item)));
    });
    return new MockQueryChain(p);
  },

  findOne(collectionName, query = {}) {
    const p = new Promise((resolve) => {
      const data = readDb();
      const results = data[collectionName] || [];
      const item = results.find(item => {
        for (const key in query) {
          const val = query[key];
          if (val instanceof RegExp) {
            if (!val.test(item[key])) return false;
          } else if (typeof val === 'object' && val !== null && val.$regex) {
            const regex = new RegExp(val.$regex, val.$options || '');
            if (!regex.test(item[key])) return false;
          } else {
            if (item[key] !== val) return false;
          }
        }
        return true;
      });
      resolve(wrapDocument(collectionName, item));
    });
    return new MockQueryChain(p);
  },

  findById(collectionName, id) {
    const p = new Promise((resolve) => {
      const data = readDb();
      const results = data[collectionName] || [];
      const item = results.find(item => item._id === id || item.id === id);
      resolve(wrapDocument(collectionName, item));
    });
    return new MockQueryChain(p);
  },

  create(collectionName, docData) {
    const data = readDb();
    const newDoc = {
      _id: 'mock_' + Math.random().toString(36).substr(2, 9),
      ...docData
    };

    if (collectionName === 'users' && docData.password) {
      const salt = bcrypt.genSaltSync(10);
      newDoc.password = bcrypt.hashSync(docData.password, salt);
    }

    data[collectionName].push(newDoc);
    writeDb(data);

    return Promise.resolve(wrapDocument(collectionName, newDoc));
  },

  findByIdAndDelete(collectionName, id) {
    const data = readDb();
    const index = data[collectionName].findIndex(item => item._id === id || item.id === id);
    if (index !== -1) {
      data[collectionName].splice(index, 1);
      writeDb(data);
    }
    return Promise.resolve({ success: true });
  }
};

module.exports = { mockDbHelper, initDb };
