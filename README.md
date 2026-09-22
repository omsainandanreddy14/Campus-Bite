# 🍔 CampusBite - Campus Meal Ordering & Delivery Portal

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/omsainandanreddy14/Campus-Bite)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/frontend-React%20%7C%20Vite-orange)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/backend-Node.js%20%7C%20Express-green)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/database-MongoDB%20Atlas-emerald)](https://www.mongodb.com/)

**CampusBite** is a full-stack, real-time campus meal ordering, canteen stall management, and campus delivery platform. It seamlessly connects **Students**, **Canteen Owners**, **Delivery Partners**, and **Campus Admins** into a unified ecosystem.

---

## ✨ Features

### 🎓 Student Portal
* **Interactive Menu & Canteen Filtering**: Browse campus food stalls with search, food categories, and real-time availability.
* **Smart Cart & Targeted Food Category Vouchers**: Apply promo coupons targeting specific food items (e.g. *Pizzas 🍕*, *Burgers 🍔*, *Biryani 🍲*, *Snacks 🥪*, *Beverages 🥤*, *All Food*) with itemized savings calculations.
* **Order Status Tracking & Live Chat**: Track order progress (*Pending* ➔ *Preparing* ➔ *Out for Delivery* ➔ *Delivered*) and chat directly with delivery partners.
* **Automated PDF Invoices & Wallet**: Download official itemized PDF receipt invoices and manage campus wallet balances.

### 🍳 Canteen Owner Dashboard
* **Real-Time Order Pipeline**: Manage incoming student orders, accept/reject, and trigger kitchen status updates (*Preparing* / *Ready for Pickup*).
* **1-Step Today's Specials Publisher**: Instant dish promotion board allowing canteen owners to promote menu items or custom specials with live price overrides.
* **Stall Discount Vouchers Console**: Issue stall-specific promo codes targeting custom food categories with minimum cart requirements.
* **Analytics & Dish Ratings Summary**: 7-day revenue performance breakdown chart, top-selling dishes rankings, and aggregated customer ratings.

### 🛵 Delivery Partner Dashboard
* **Assigned Pickups & Delivery Routes**: 1-click pickup acceptance, live route tracking to student hostels, and integrated Delivery Chat.
* **100% Accurate Payout Breakdown**: 7-day income chart calculating exact base pay (`₹20/drop`) + student tips directly from completed delivery logs.
* **Synchronized Delivery Rating**: Dynamically derived average rider rating synchronized across performance cards and the campus Delivery Leaderboard.

### 🛡️ Campus Admin Console
* **Canteen Stall Management**: Onboard new canteens, toggle stall active status, and issue global food discount vouchers.
* **User Oversight & Status Control**: Monitor registered students, canteen owners, and delivery partners with suspension/activation controls.
* **Platform Analytics**: Total platform revenue, order volume trends, and transaction history.

---

## 🛠️ Tech Stack

* **Frontend**: React (Vite), Tailwind CSS, Lucide React Icons, Axios, HTML2Canvas / JSPDF
* **Backend**: Node.js, Express.js, JSON Web Tokens (JWT), Mongoose
* **Database**: MongoDB Atlas Cloud (*with automatic local JSON database fallback `server/data/db.json` for offline testing*)
* **Security**: Case-insensitive duplicate registration checks, bcrypt password hashing, JWT role-based route middleware

---

## 📁 Repository Structure

```text
Campus-Bite/
├── client/                   # Frontend React (Vite) Application
│   ├── public/               # Public assets & SVG icons
│   ├── src/
│   │   ├── assets/           # UI media & hero images
│   │   ├── components/       # OrderChat, RatingModal, ProfileModal, WalletModal
│   │   ├── context/          # AppContext (global state) & AuthContext (auth state)
│   │   ├── layouts/          # Student, Canteen, Delivery & Admin Layouts
│   │   ├── pages/            # Role-specific dashboard & portal pages
│   │   ├── routes/           # ProtectedRoute guards & AppRoutes
│   │   └── services/         # Axios API endpoints & invoice generator
│   ├── package.json
│   └── vite.config.js
│
├── server/                   # Backend Express API Server
│   ├── config/               # Database connection (db.js) & Mock DB Helper
│   ├── data/                 # db.json (offline database fallback)
│   ├── middleware/           # auth.js (JWT validation middleware)
│   ├── models/               # User, Food, Order, Review, Voucher, Transaction
│   ├── routes/               # auth, foods, orders, vouchers API routes
│   ├── package.json
│   └── server.js             # Express app entry point
│
└── README.md
```

---

## ⚡ Quick Start & Local Setup

### 1. Prerequisites
* **Node.js** (v16.x or higher)
* **npm** or **yarn**

### 2. Clone the Repository
```bash
git clone https://github.com/omsainandanreddy14/Campus-Bite.git
cd Campus-Bite
```

### 3. Start the Backend API Server
```bash
cd server
npm install
npm run dev
```
> Server runs on `http://localhost:5000`

### 4. Start the Frontend Client
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```
> Client runs on `http://localhost:5173`

---

## 🌐 Deployment Instructions

### Frontend (Vercel)
1. Import `omsainandanreddy14/Campus-Bite` on [Vercel](https://vercel.com).
2. Set **Root Directory** to `client`.
3. Set **Build Command** to `npm run build` and **Output Directory** to `dist`.
4. Deploy!

### Backend (Render / Railway)
1. Create a Web Service for `omsainandanreddy14/Campus-Bite` on [Render](https://render.com) or [Railway](https://railway.app).
2. Set **Root Directory** to `server`.
3. Set **Environment Variables**:
   * `PORT`: `5000`
   * `JWT_SECRET`: `your_jwt_secret_key`
   * `MONGO_URI`: `mongodb+srv://<username>:<password>@cluster.mongodb.net/campusbite`
4. Deploy!

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/omsainandanreddy14/Campus-Bite/issues).

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
