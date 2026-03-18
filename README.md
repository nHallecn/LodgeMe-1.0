# LodgeMe - Rental Marketplace Platform for Cameroon

LodgeMe is a modern, high-end rental marketplace designed specifically for the Cameroonian market. It addresses key challenges like "fake agent" scams and manual bookkeeping, providing a transparent and efficient platform for both landlords and tenants.

## 🌟 Key Features

### For Tenants

* **Advanced Property Search:** Find rentals by city, neighborhood, price range, and room type.
* **Interactive Map View:** Visually locate available rentals using Leaflet.js and OpenStreetMap.
* **Schedule Physical Visits:** Request and manage physical property viewings directly through the platform.
* **Secure Bookings:** Book rooms and track your rental status seamlessly.
* **Maintenance Tracking:** Report and monitor maintenance issues in your rented space.
* **Digital Payments:** View payment history and receive digital receipts.

### For Landlords

* **Property Management:** Easily list and manage multiple properties and "minicités".
* **Room Management:** Add, edit, and track the status of individual rooms within your properties.
* **Automated Invoicing:** Generate and manage invoices for your tenants.
* **Payment Tracking:** Record offline payments and track pending balances.
* **Maintenance Management:** Receive and manage maintenance requests from tenants.
* **Dashboard Analytics:** Get a high-level overview of your property performance and financials.

## 🛠️ Tech Stack

* **Frontend:** [Next.js](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/), [Leaflet.js](https://leafletjs.com/), [React Icons](https://react-icons.github.io/react-icons/)
* **Backend:** [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [MySQL](https://www.mysql.com/)
* **Authentication:** JSON Web Tokens (JWT)
* **Database:** MySQL with `mysql2` driver

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or higher)
* npm or pnpm
* MySQL Server

### 1\. Clone the Repository

```bash
git clone https://github.com/your-username/lodgeme-project.git
cd lodgeme-project
```

### 2\. Database Setup

1. Create a MySQL database named `lodgeme\_db`.
2. Run the provided SQL script (`backend/LodgeMe\_Complete\_Database\_Setup.sql`) to create the necessary tables and structure.

### 3\. Backend Setup

1. Navigate to the backend directory:

```bash
   cd backend
   ```

2. Install dependencies:

```bash
   npm install
   ```

3. Create a `.env` file and configure your environment variables:

```env
   PORT=5000
   DB\_HOST=localhost
   DB\_USER=your\_mysql\_user
   DB\_PASSWORD=your\_mysql\_password
   DB\_NAME=lodgeme\_db
   JWT\_SECRET=your\_very\_strong\_jwt\_secret
   ```

4. Start the backend server:

```bash
   npm start
   ```

### 4\. Frontend Setup

1. Navigate to the frontend directory:

```bash
   cd ../frontend
   ```

2. Install dependencies:

```bash
   npm install
   ```

3. Create a `.env.local` file and configure your environment variables:

```env
   NEXT\_PUBLIC\_API\_BASE\_URL=http://localhost:5000/api
   ```

4. Place your static assets (images, icons) in the `public/` directory as described in the project documentation.
5. Start the frontend development server:

```bash
   npm run dev
   ```

## 📂 Project Structure

```
lodgeme-project/
├── backend/                # Node.js/Express API
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── controllers/    # API request handlers
│   │   ├── middleware/     # Auth and error handling
│   │   ├── models/         # Database models
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   └── server.js           # Entry point
└── frontend/               # Next.js Application
    ├── public/             # Static assets (images, icons)
    ├── src/
    │   ├── app/            # Next.js App Router (pages, layouts)
    │   ├── components/     # Reusable UI components
    │   ├── context/        # Global state (AuthContext)
    │   ├── lib/            # API client (Axios)
    │   └── styles/         # Global CSS and Tailwind config
    └── next.config.js      # Next.js configuration
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

