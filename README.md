# FutsalKhelum: Tactical Booking System

A high-performance MERN stack application for Futsal players and ground owners. This system features a "Tactical HUD" interface, real-time booking, and geospatial ground discovery.

### 🌐 [Live Preview](https://frontend-wdkl3fmsca-el.a.run.app)

---

## 🛠️ Prerequisites

- **Node.js** (v18+)
- **MongoDB** (Local instance or Atlas)
- **Google Maps API Key** (For ground discovery)
- **SMTP Service** (For OTP verification - e.g., SendGrid, Mailtrap, or Gmail)

---

## 🚀 Quick Setup

### 1. Clone & Install
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

#### Backend (`/backend/.env`)
Copy `.env.example` to `.env` and fill in:
- `MONGO_URI`: Your MongoDB connection string.
- `JWT_SECRET`: A long random string.
- `SMTP_*`: Your email service credentials.

#### Frontend (`/frontend/.env`)
Create a `.env` file in the frontend root:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run the Application

#### Local Development
```bash
# Start backend (from /backend)
npm run dev

# Start frontend (from /frontend)
npm run dev
```

#### Docker (Recommended)
```bash
docker-compose up --build
```

---

## 🛡️ Role-Based Access

1. **Customer**: Can search for grounds, view details on a tactical map, and book slots.
2. **Owner**: Can register grounds and manage bookings after admin verification.
3. **Admin**: Oversees system health and verifies new ground owners.

---

## 🎨 Design System: Kinetic Strategist
The application uses a high-contrast futuristic HUD aesthetic:
- **Primary**: Neon Green (`#CCFF00`)
- **Secondary**: Cyan (`#00D1FF`)
- **Background**: Deep Charcoal (`#0E0E0E`)
- **Typography**: Space Grotesk (Headers) & Inter (Body)
