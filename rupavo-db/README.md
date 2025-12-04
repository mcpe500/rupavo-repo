# Rupavo Database

Database management untuk project Rupavo menggunakan Supabase CLI.

## 📋 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Login ke Supabase

```bash
npx supabase login
```

### 3. Link ke Project Cloud

Dapatkan **Project Reference ID** dari URL dashboard: `app.supabase.com/project/<PROJECT_ID>`

```bash
npm run link -- --project-ref <PROJECT_ID>
```

### 4. Push Migrations ke Cloud

```bash
npm run db:push
```

### 5. Run Seeders

```bash
npm run db:seed
```

---

## 🛠 NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run db:make:migration <name>` | Buat file migration baru |
| `npm run db:make:seed <name>` | Buat file seeder baru |
| `npm run db:push` | Push migrations ke cloud |
| `npm run db:migrate` | Run migrations (local) |
| `npm run db:seed` | Run all seeders (JS) |
| `npm run db:fresh` | Reset database (⚠️ hapus semua data) |
| `npm run db:status` | Cek status migrations |
| `npm run db:diff <name>` | Generate migration dari perubahan schema |
| `npm run start` | Start local Supabase |
| `npm run stop` | Stop local Supabase |
| `npm run link` | Link ke project cloud |
| `npm run func:new <name>` | Buat Edge Function baru |
| `npm run func:deploy` | Deploy Edge Functions |
| `npm run func:serve` | Serve functions locally |
| `npm run secrets:add <KEY=value>` | Set secret di cloud |
| `npm run secrets:list` | List semua secrets |

---

## 📂 Struktur Folder

```
rupavo-db/
├── supabase/
│   ├── config.toml          # Konfigurasi Supabase
│   ├── migrations/           # SQL migration files
│   ├── functions/            # Edge Functions (Deno/TypeScript)
│   └── seed.sql              # SQL seed (optional)
├── seeds/                    # JavaScript seeders
│   ├── index.js              # Seed runner
│   └── 01-users.js           # Example seeder
├── .env                      # Environment variables (git ignored)
├── .env.example              # Template environment
└── package.json
```

---

## 🗃 Migration Workflow

### Membuat Migration Baru

```bash
npm run db:make:migration create_products_table
```

Akan membuat file: `supabase/migrations/20241204_create_products_table.sql`

### Contoh Migration

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_products_name ON public.products(name);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Anyone can read products"
    ON public.products FOR SELECT
    USING (true);
```

### Push ke Cloud

```bash
npm run db:push
```

---

## 🌱 Seeder Workflow

### Membuat Seeder Baru

```bash
npm run db:make:seed create_dummy_products
```

Akan membuat file: `seeds/20241204_create_dummy_products.js`

### Run Seeders

```bash
npm run db:seed
```

> **Note:** Seeders menggunakan `service_role` key sehingga bisa bypass RLS.

Lihat [seeds/README.md](./seeds/README.md) untuk panduan lengkap.

---

## ⚡ Edge Functions

Lihat [GUIDE_EDGE_FUNCTIONS.md](./GUIDE_EDGE_FUNCTIONS.md) untuk panduan lengkap.

### Quick Commands

```bash
# Buat function baru
npm run func:new my-function

# Test locally
npm run func:serve

# Deploy ke production
npm run func:deploy
```

---

## 🔐 Environment Variables

Salin `.env.example` ke `.env` dan isi dengan nilai yang benar:

```bash
cp .env.example .env
```

**Required variables:**

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | URL project Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (untuk seeders) |
| `ADMIN_EMAIL` | Email admin untuk seeder |
| `ADMIN_PASSWORD` | Password admin untuk seeder |

---

## 📚 Referensi

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Supabase Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Edge Functions](https://supabase.com/docs/guides/functions)
