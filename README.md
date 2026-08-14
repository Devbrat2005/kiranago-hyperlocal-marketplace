# KiranaGo - Hyperlocal Marketplace & Quick Delivery App 🛒⚡

> **"Your Local Store, Delivered Fast."**

KiranaGo is a full-stack hyperlocal marketplace that connects customers with nearby Kirana stores, general stores, supermarkets, dairies, and daily essential shops for fast 15-minute neighborhood deliveries.

---

## 🌟 Key Features

- **🛒 Multi-Role Platform (4 User Portals)**:
  - **Customer Portal**: Store discovery, 26+ category pictures grid, real-time search, multi-store cart, Razorpay-ready checkout, live order tracking, and AI support bot.
  - **Store Owner Dashboard**: Incoming order action board (*Accept, Reject, Mark Preparing, Ready for pickup*), revenue analytics, low-stock warnings, and inventory management.
  - **Delivery Partner App**: Online/offline toggle, job assignment radar, navigation flow (*Store pickup -> Customer dropoff*), COD cash collection prompt, and daily earnings statement.
  - **Admin Platform Control Panel**: Platform analytics (*GMV, Total Stores, Orders, Products*), store onboarding approval table, delivery partner verification, and live AI support chat inspector with human takeover.

- **📍 Geolocation & Distance Matching**:
  - Browser Geolocation API with reverse geocoding into Area, City, and PIN code.
  - Haversine distance formula filtering nearby stores based on delivery radius.

- **🔍 Real-Time Global Search**:
  - Instant backend search across products, stores, categories, and brands.
  - Filters by price, rating, distance, category, and brand with sorting options.

- **🤖 Context-Aware AI Customer Support**:
  - Floating 24/7 support widget powered by Express AI backend.
  - Detects English, Hindi, and Hinglish automatically.
  - Retrieves real user order milestones, delivery ETA, and supports human admin takeover.

- **🎨 Modern Aesthetics**:
  - Full-width hero banner with dark green gradient overlay for high contrast.
  - Rounded-3xl cards with full-size product imagery and soft shadows.
  - Responsive mobile bottom navigation bar and desktop header search.

---

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Lucide Icons, Context API.
- **Backend**: Node.js, Express.js REST API, JWT Authentication, Bcrypt.js.
- **Database Engine**: KiranaDB (Local JSON persistence + MongoDB Mongoose dual storage engine).
- **Seed Data**: 30 realistic Indian stores & 300+ grocery products seeded automatically.

---

## 🚀 Quick Start Guide

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/Devbrat2005/kiranago-hyperlocal-marketplace.git
cd kiranago-hyperlocal-marketplace

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Running Locally
```bash
# Start backend Express server (Port 5000)
node backend/server.js

# Start frontend Vite server (Port 3000)
cd frontend
npm run dev
```

Open [http://localhost:3000/](http://localhost:3000/) in your browser!

---

## 📄 License
Licensed under the [MIT License](LICENSE).
