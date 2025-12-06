# Rupavo Principal - Admin Dashboard

This is the admin dashboard for the Rupavo platform, built with Refine, React, and Ant Design.

## Database Schema

The application now uses the following database tables from the Rupavo schema:

### Core Tables
- **shops** - Store/merchant shops with owner information
- **products** - Products belonging to shops
- **orders** - Orders placed (manual or from storefront)
- **order_items** - Line items for each order
- **ai_reports** - AI-generated analytics reports
- **profiles** - User profile information
- **storefront_layouts** - AI-generated storefront designs
- **ai_conversations** - Chat history with AI assistant

## Features

### Shops Management
- Create, view, edit, and delete shops
- Manage shop details (name, slug, tagline, description)
- Toggle storefront publication status
- Track shop creation and updates

### Products Management
- Create, view, edit, and delete products
- Associate products with shops
- Set pricing and cost information
- Manage product images and descriptions
- Control product visibility (active/inactive)
- Sort order customization

### Orders Management
- Create, view, edit, and delete orders
- Track order source (manual or storefront)
- Manage order status (draft, completed, cancelled)
- Record buyer information
- Support multiple currencies (default: IDR)
- Add notes to orders

### AI Reports
- View AI-generated analytics reports
- Browse reports by shop and time period
- View detailed metrics in JSON format
- Read AI-generated narratives and insights
- Filter by granularity (daily, weekly, monthly, custom)

## Environment Setup

1. Copy `.env.example` to `.env`
2. Configure your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_KEY=your-anon-key
   ```

## Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Authentication

The application uses Supabase authentication with Row Level Security (RLS) policies:
- Users can only manage shops they own
- Products, orders, and reports are filtered by shop ownership
- Public can view published storefronts

## Technology Stack

- **Refine** - React framework for admin panels
- **React** - UI library
- **Ant Design** - Component library
- **Supabase** - Backend and database
- **TypeScript** - Type safety
- **Vite** - Build tool

## Project Structure

```
src/
├── pages/
│   ├── shops/          # Shop CRUD pages
│   ├── products/       # Product CRUD pages
│   ├── orders/         # Order CRUD pages
│   └── ai-reports/     # AI report viewing pages
├── components/
│   ├── header/         # App header
│   └── title/          # App title
├── contexts/           # React contexts
├── utility/            # Utility functions & Supabase client
├── App.tsx             # Main app component
└── authProvider.ts     # Authentication provider
```

## Notes

- All monetary values use Indonesian Rupiah (IDR) by default
- The AI Reports section is read-only (no create/edit)
- Products and Orders require a shop to be created first
- Slugs for shops must be unique and URL-friendly (lowercase, numbers, hyphens only)
