# Rupavo Principal - Admin Panel

Admin panel for managing the Rupavo marketplace platform built with [Refine](https://refine.dev), Ant Design, and Supabase.

## Features

### Shop Management
- Create, edit, and view shops
- Manage shop settings and storefronts
- Configure shop payment settings

### Product Management
- Add and manage products for each shop
- Set pricing, descriptions, and images
- Track product inventory

### Order Management
- View all orders across all shops
- Monitor order status (draft, confirmed, completed, cancelled)
- Track payment status (pending, paid, failed, expired, refunded)
- Support for multiple order types (manual, online, preorder)
- View customer details and delivery information

### Payment System
- **Transactions**: View all payment transactions with Midtrans integration
  - Real-time payment status updates
  - Platform fee and merchant amount breakdown
  - Payment method tracking (QRIS, GoPay, Bank Transfer, etc.)
  
- **Payouts**: Process merchant withdrawal requests
  - Review payout requests from shop owners
  - Process payouts with status tracking (pending → processing → completed)
  - Add admin notes for each payout
  - Bank account verification

- **Payment Settings**: Configure shop payment acceptance
  - Enable/disable online orders
  - Enable/disable preorders
  - Set minimum order amounts
  - Configure delivery options and fees
  - Manage bank account details

### AI Reports
- View AI-generated business reports
- Insights and analytics for shops

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account with database configured
- Environment variables configured

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173)

### Building for Production

```bash
npm run build
npm run preview  # Preview production build
```

## Payment Management Workflows

### Processing Payouts (Admin)

1. Navigate to **Payouts** menu
2. View pending payout requests from merchants
3. Click **Show** to view payout details
4. Verify bank account information
5. Click **Start Processing** to mark as processing
6. Transfer funds to merchant's bank account
7. Add admin notes with transfer receipt number
8. Click **Mark as Completed**

### Monitoring Transactions

1. Navigate to **Transactions** menu
2. View all payment transactions
3. Filter by status, shop, or date
4. Click **Show** to view detailed transaction info
5. Review Midtrans response data for debugging

### Configuring Shop Payment Settings

1. Navigate to **Payment Settings** menu
2. Click **Edit** on a shop's payment settings
3. Configure:
   - Bank account details (required for payouts)
   - Accept online orders toggle
   - Accept preorders toggle
   - Minimum order amount
   - Delivery availability and fees
4. Save changes

## Database Tables

The admin panel manages these main tables:
- `shops` - Shop/store information
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Items in each order
- `transactions` - Payment transactions
- `payouts` - Merchant withdrawal requests
- `shop_payment_settings` - Shop payment configuration
- `ai_reports` - AI-generated reports

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Ant Design + Refine
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Payment**: Midtrans Integration
- **Routing**: React Router v7

## Features by Resource

### Shops
- List, create, edit, show, delete
- Storefront publishing
- Payment settings configuration

### Products
- Full CRUD operations
- Product images and descriptions
- Price management

### Orders
- List with filtering and sorting
- View order details
- Track payment and delivery status
- Support manual, online, and preorder types

### Transactions
- View payment history
- Midtrans integration details
- Platform fee tracking
- Settlement monitoring

### Payouts
- Admin workflow for processing withdrawals
- Bank account management
- Status tracking with admin notes

### Payment Settings
- Per-shop payment configuration
- Online order acceptance
- Delivery options
- Bank account setup

## Development

### Project Structure
```
src/
├── pages/
│   ├── shops/           # Shop management
│   ├── products/        # Product management
│   ├── orders/          # Order management
│   ├── transactions/    # Payment transactions
│   ├── payouts/         # Merchant payouts
│   ├── shop-payment-settings/  # Payment configuration
│   └── ai-reports/      # AI reports
├── components/
│   ├── header/          # App header
│   └── title/           # App title
├── contexts/
│   └── color-mode/      # Dark/light mode
├── utility/
│   └── supabaseClient.ts  # Supabase client
├── App.tsx              # Main app with routing
├── authProvider.ts      # Authentication provider
└── theme.ts             # Ant Design theme

```

### Adding New Features

1. Create new page components in `src/pages/[resource]/`
2. Register resource in `App.tsx` resources array
3. Add routes in the Routes configuration
4. Import and use Refine hooks (useTable, useForm, useShow, etc.)

## Authentication

The admin panel uses Supabase authentication:
- Email/password login
- Role-based access (admin only)
- Session management

## Learn More

- **Refine Documentation**: [https://refine.dev/docs](https://refine.dev/docs)
- **Supabase Data Provider**: [https://refine.dev/docs/data/packages/supabase](https://refine.dev/docs/data/packages/supabase)
- **Ant Design**: [https://ant.design/](https://ant.design/)
- **React Router**: [https://reactrouter.com/](https://reactrouter.com/)

## Support

For payment system setup, see [PAYMENT_SETUP.md](../rupavo-db/PAYMENT_SETUP.md) in the rupavo-db folder.

## License

MIT
