-- RentCam PostgreSQL schema
-- Run with: psql "$DATABASE_URL" -f backend/db/schema.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('tenant', 'landlord', 'agent', 'admin', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE property_type_enum AS ENUM ('chambre', 'studio', 'apartment', 'villa', 'commercial', 'land');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE listing_status AS ENUM ('pending_review', 'available', 'rented', 'reserved', 'hidden', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE furnished_enum AS ENUM ('furnished', 'semi_furnished', 'unfurnished');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE inquiry_status AS ENUM ('sent', 'read', 'replied', 'viewing_scheduled', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE lease_status AS ENUM ('draft', 'pending_tenant_sign', 'pending_landlord_sign', 'active', 'expired', 'terminated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE caution_status AS ENUM ('pending', 'held', 'released', 'disputed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_type_enum AS ENUM ('advance_rent', 'caution', 'monthly_rent', 'platform_fee', 'refund');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('mtn_momo', 'orange_money', 'cash', 'bank_transfer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE review_direction AS ENUM ('tenant_to_landlord', 'landlord_to_tenant', 'tenant_to_agent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS users (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone            VARCHAR(20) UNIQUE NOT NULL,
  full_name        VARCHAR(200),
  email            VARCHAR(255) UNIQUE,
  role             user_role NOT NULL DEFAULT 'tenant',
  avatar_url       TEXT,
  bio              TEXT,
  city             VARCHAR(100),
  id_document_url  TEXT,
  is_verified      BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at      TIMESTAMPTZ,
  is_banned        BOOLEAN NOT NULL DEFAULT FALSE,
  ban_reason       TEXT,
  trust_score      SMALLINT DEFAULT 50 CHECK (trust_score BETWEEN 0 AND 100),
  preferred_lang   CHAR(2) NOT NULL DEFAULT 'fr' CHECK (preferred_lang IN ('fr', 'en')),
  last_seen_at     TIMESTAMPTZ,
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS properties (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id        UUID NOT NULL REFERENCES users(id),
  agent_id           UUID REFERENCES users(id),
  title              VARCHAR(300) NOT NULL,
  description        TEXT,
  property_type      property_type_enum NOT NULL,
  status             listing_status NOT NULL DEFAULT 'pending_review',
  bedrooms           SMALLINT,
  bathrooms          SMALLINT,
  area_sqm           NUMERIC(8,2),
  floor              SMALLINT,
  total_floors       SMALLINT,
  furnished          furnished_enum NOT NULL DEFAULT 'unfurnished',
  monthly_rent       INTEGER NOT NULL CHECK (monthly_rent >= 0),
  advance_months     SMALLINT NOT NULL DEFAULT 3,
  caution_months     SMALLINT NOT NULL DEFAULT 1,
  agency_fee_months  SMALLINT DEFAULT 1,
  utilities          TEXT[] DEFAULT '{}',
  address_raw        TEXT NOT NULL,
  city               VARCHAR(100) NOT NULL,
  neighbourhood      VARCHAR(200),
  location           GEOGRAPHY(POINT, 4326),
  amenities          TEXT[] DEFAULT '{}',
  rules              TEXT[] DEFAULT '{}',
  available_from     DATE,
  virtual_tour_url   TEXT,
  metadata           JSONB DEFAULT '{}',
  search_vector      TSVECTOR,
  is_featured        BOOLEAN DEFAULT FALSE,
  featured_until     TIMESTAMPTZ,
  view_count         INTEGER NOT NULL DEFAULT 0,
  inquiry_count      INTEGER NOT NULL DEFAULT 0,
  rejection_reason   TEXT,
  reviewed_by        UUID REFERENCES users(id),
  reviewed_at        TIMESTAMPTZ,
  expires_at         TIMESTAMPTZ DEFAULT NOW() + INTERVAL '90 days',
  deleted_at         TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_location ON properties USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_properties_search ON properties USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_rent ON properties(monthly_rent);
CREATE INDEX IF NOT EXISTS idx_properties_landlord ON properties(landlord_id);

CREATE TABLE IF NOT EXISTS listing_photos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  thumbnail_url TEXT,
  position      SMALLINT NOT NULL DEFAULT 0,
  is_cover      BOOLEAN NOT NULL DEFAULT FALSE,
  width         INTEGER,
  height        INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photos_property ON listing_photos(property_id);

CREATE TABLE IF NOT EXISTS inquiries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id      UUID NOT NULL REFERENCES properties(id),
  tenant_id        UUID NOT NULL REFERENCES users(id),
  message          TEXT,
  desired_move_in  DATE,
  duration_months  SMALLINT,
  status           inquiry_status NOT NULL DEFAULT 'sent',
  viewing_date     TIMESTAMPTZ,
  landlord_reply   TEXT,
  replied_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_property ON inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_tenant ON inquiries(tenant_id);

CREATE TABLE IF NOT EXISTS leases (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id        UUID NOT NULL REFERENCES properties(id),
  tenant_id          UUID NOT NULL REFERENCES users(id),
  landlord_id        UUID NOT NULL REFERENCES users(id),
  inquiry_id         UUID REFERENCES inquiries(id),
  lease_number       VARCHAR(50) UNIQUE,
  status             lease_status NOT NULL DEFAULT 'draft',
  start_date         DATE NOT NULL,
  end_date           DATE,
  duration_months    SMALLINT,
  monthly_rent       INTEGER NOT NULL,
  advance_months     SMALLINT NOT NULL,
  advance_amount     INTEGER NOT NULL,
  caution_amount     INTEGER NOT NULL,
  caution_status     caution_status DEFAULT 'pending',
  tenant_signed_at   TIMESTAMPTZ,
  landlord_signed_at TIMESTAMPTZ,
  tenant_sign_otp    VARCHAR(10),
  landlord_sign_otp  VARCHAR(10),
  pdf_url            TEXT,
  template_id        VARCHAR(50),
  lease_data         JSONB,
  terminated_at      TIMESTAMPTZ,
  termination_reason TEXT,
  terminated_by      UUID REFERENCES users(id),
  deleted_at         TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leases_property ON leases(property_id);
CREATE INDEX IF NOT EXISTS idx_leases_tenant ON leases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leases_landlord ON leases(landlord_id);
CREATE INDEX IF NOT EXISTS idx_leases_status ON leases(status);

CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lease_id        UUID REFERENCES leases(id),
  payer_id        UUID NOT NULL REFERENCES users(id),
  payee_id        UUID NOT NULL REFERENCES users(id),
  amount          INTEGER NOT NULL,
  platform_fee    INTEGER NOT NULL DEFAULT 0,
  net_amount      INTEGER NOT NULL,
  payment_type    payment_type_enum NOT NULL,
  method          payment_method NOT NULL,
  status          payment_status NOT NULL DEFAULT 'pending',
  provider_ref    VARCHAR(100),
  provider_status VARCHAR(50),
  payer_phone     VARCHAR(20),
  receipt_url     TEXT,
  notes           TEXT,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_lease ON payments(lease_id);
CREATE INDEX IF NOT EXISTS idx_payments_payer ON payments(payer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  reviewee_id UUID NOT NULL REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  lease_id    UUID REFERENCES leases(id),
  direction   review_direction NOT NULL,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  is_public   BOOLEAN NOT NULL DEFAULT TRUE,
  is_flagged  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_once_per_lease
  ON reviews(reviewer_id, lease_id, direction);

CREATE TABLE IF NOT EXISTS saved_listings (
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, property_id)
);

CREATE TABLE IF NOT EXISTS saved_searches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filters         JSONB NOT NULL DEFAULT '{}',
  alert_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
  last_alerted_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listing_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id),
  property_id UUID NOT NULL REFERENCES properties(id),
  reason      VARCHAR(100) NOT NULL,
  details     TEXT,
  status      VARCHAR(50) NOT NULL DEFAULT 'open',
  resolved_by UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(100) NOT NULL,
  title      VARCHAR(200) NOT NULL,
  body       TEXT,
  channel    VARCHAR(20) NOT NULL DEFAULT 'in_app',
  read_at    TIMESTAMPTZ,
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES users(id),
  action      VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id   UUID,
  changes     JSONB DEFAULT '{}',
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promotions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  type        VARCHAR(50) NOT NULL,
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ NOT NULL,
  payment_id  UUID REFERENCES payments(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS neighbourhoods (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city        VARCHAR(100) NOT NULL,
  name        VARCHAR(200) NOT NULL,
  slug        VARCHAR(220) UNIQUE NOT NULL,
  lat         NUMERIC(10, 7),
  lng         NUMERIC(10, 7),
  avg_rent_1br INTEGER,
  avg_rent_2br INTEGER,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION rentcam_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION rentcam_properties_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.city, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.neighbourhood, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION rentcam_touch_updated_at();

DROP TRIGGER IF EXISTS trg_properties_updated_at ON properties;
CREATE TRIGGER trg_properties_updated_at
BEFORE UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION rentcam_touch_updated_at();

DROP TRIGGER IF EXISTS trg_properties_search_vector ON properties;
CREATE TRIGGER trg_properties_search_vector
BEFORE INSERT OR UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION rentcam_properties_search_vector();

DROP TRIGGER IF EXISTS trg_inquiries_updated_at ON inquiries;
CREATE TRIGGER trg_inquiries_updated_at
BEFORE UPDATE ON inquiries
FOR EACH ROW EXECUTE FUNCTION rentcam_touch_updated_at();

DROP TRIGGER IF EXISTS trg_leases_updated_at ON leases;
CREATE TRIGGER trg_leases_updated_at
BEFORE UPDATE ON leases
FOR EACH ROW EXECUTE FUNCTION rentcam_touch_updated_at();

DROP TRIGGER IF EXISTS trg_payments_updated_at ON payments;
CREATE TRIGGER trg_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION rentcam_touch_updated_at();
