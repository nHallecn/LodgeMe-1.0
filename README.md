# RentCam

RentCam is a Cameroon-focused rental marketplace rebuilt from the original LodgeMe defence project. The revised version follows the RentCam architecture document: phone OTP identity, verified listings, landlord/agent dashboards, tenant inquiries, admin verification, and PostgreSQL/PostGIS storage.

## Current MVP Scope

- Phone OTP auth for tenants, landlords, and agents
- PostgreSQL schema with UUIDs, enums, listing photos, inquiries, leases, payments, reviews, and admin support tables
- Public listing search and detail pages
- Tenant inquiry flow with WhatsApp CTA
- Landlord listing submission and inquiry inbox
- Admin listing verification queue
- Legacy `/api/properties` compatibility while the frontend moves to `/api/v1/listings`

Payments, digital leases, Redis-backed OTP/session storage, R2 uploads, and mobile apps are prepared in the schema/API shape but are Phase 2 work.

## Stack

- Frontend: Vite, React, TypeScript, Tailwind CSS, shadcn/Radix UI
- Backend: Node.js, Express 5, JWT, PostgreSQL via `pg`
- Database: PostgreSQL 16 with PostGIS and `pgcrypto`
- Architecture source: `RentCam_Architecture_Document.pdf`

## Setup

### PostgreSQL

Create a database and run the schema:

```bash
createdb rentcam_db
psql "postgresql://postgres:password@localhost:5432/rentcam_db" -f backend/db/schema.sql
```

Backend environment:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/rentcam_db
JWT_SECRET=replace_me
JWT_EXPIRES_IN=15m
CORS_ORIGINS=http://localhost:5173,http://localhost:8080,http://localhost:8081
RENTCAM_DEV_OTP=123456
```

`RENTCAM_DEV_OTP` is useful for demos. In production, OTP delivery should be wired to Africa's Talking and OTP/session state moved to Redis as described in the architecture document.

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend environment:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Main Routes

- Web: `/`, `/listings`, `/listings/:id`
- Auth: `/auth/login`, `/auth/register`
- Tenant: `/tenant/dashboard`
- Landlord/Agent: `/landlord/dashboard`, `/landlord/listings/new`, `/landlord/inquiries`
- Admin: `/admin`, `/admin/listings/queue`

## API Routes

- `POST /api/v1/auth/request-otp`
- `POST /api/v1/auth/verify-otp`
- `GET /api/v1/listings`
- `POST /api/v1/listings`
- `GET /api/v1/listings/:id`
- `POST /api/v1/listings/:id/inquiries`
- `GET /api/v1/inquiries/mine`
- `GET /api/v1/inquiries/landlord`
- `GET /api/v1/admin/listings/queue`
- `PATCH /api/v1/admin/listings/:id/verify`

## Notes

The old MySQL setup file is retained only as historical LodgeMe context. Use `backend/db/schema.sql` for RentCam.
