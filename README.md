# Lodgeme

**Lodgeme** is a full-stack property rental and booking management platform designed to connect **tenants and landlords**.
It allows users to search for rental properties, book rooms, manage payments, and handle property operations through a modern web interface.

The project is built with a **Node.js + TypeScript backend** and a **React + TypeScript frontend**.

---

# Features

## Tenant Features

* User registration and authentication
* Property search and filtering
* Room booking
* Payment processing
* Booking history
* Property reviews
* Visit requests

## Landlord Features

* Property management
* Room management
* Booking management
* Maintenance ticket management
* Payment tracking
* Tenant communication

## System Features

* Secure authentication
* Notification system
* Invoice generation
* Messaging between tenants and landlords
* Transaction tracking

---

# Tech Stack

## Backend

* Node.js
* Express.js
* TypeScript
* SQL Database (MySQL / PostgreSQL)
* REST API architecture

## Frontend

* React
* TypeScript
* Vite
* CSS

## Dev Tools

* Git
* Docker (optional)
* ESLint
* Prettier

---

# Project Structure

```
lodgeme
│
├── backend
│   ├── src
│   │   ├── config
│   │   ├── database
│   │   ├── models
│   │   ├── routes
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── utils
│   │   └── types
│   │
│   ├── server.ts
│   └── package.json
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   ├── hooks
│   │   ├── context
│   │   ├── styles
│   │   └── utils
│   │
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

# Installation

## 1. Clone the Repository

```
git clone https://github.com/yourusername/lodgeme.git
cd lodgeme
```

---

# Backend Setup

### Install Dependencies

```
cd backend
npm install
```

### Configure Environment Variables

Create a `.env` file in the backend folder.

Example:

```
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
```

### Run Backend Server

```
npm run dev
```

Server will run on:

```
http://localhost:5000
```

---

# Frontend Setup

### Install Dependencies

```
cd frontend
npm install
```

### Configure Environment Variables

Create `.env` file in frontend.

Example:

```
VITE_API_URL=http://localhost:5000
```

### Run Frontend

```
npm run dev
```

Frontend will run on:

```
http://localhost:5173
```

---

# API Architecture

The backend follows a **layered architecture**:

```
Routes → Controllers → Models → Database
```

Example flow:

```
POST /api/bookings
      ↓
booking.routes.ts
      ↓
bookingController.ts
      ↓
Booking.ts (model)
      ↓
Database
```

---

# Database

Database schema is located in:

```
backend/src/database/schema.sql
```

Tables include:

* Users
* Properties
* Rooms
* Bookings
* Payments
* Invoices
* Reviews
* Maintenance Tickets
* Notifications
* Messages
* Transactions

---

# Scripts

## Backend

```
npm run dev
npm run build
npm start
```

## Frontend

```
npm run dev
npm run build
npm run preview
```

---

# Future Improvements

* Mobile application
* Real payment gateway integration
* Map integration for property location
* Real-time messaging (WebSocket)
* AI-based property recommendations

---

# Contributing

1. Fork the repository
2. Create a new branch

```
git checkout -b feature/new-feature
```

3. Commit your changes

```
git commit -m "Add new feature"
```

4. Push to your branch

```
git push origin feature/new-feature
```

5. Create a Pull Request

---

# License

This project is licensed under the **MIT License**.

---

# Author

Developed by **Nji Halle Cho Nkwenti**
