# Resin Artistry E-Commerce Platform

A modern, fully-featured e-commerce website for selling handmade resin products built with React, TypeScript, Material UI, Redux Toolkit, and Supabase.

## Features

### Customer Features
- **Homepage**: Hero banner, featured products, category navigation, and testimonials
- **Product Catalog**: Advanced filtering, searching, and sorting capabilities
- **Product Details**: Image gallery, reviews, ratings, and add to cart
- **Shopping Cart**: Quantity management, price calculation, and free shipping threshold
- **Wishlist**: Save favorite products for later
- **Checkout**: Complete order flow with address form and payment method selection
- **Authentication**: Email/password login and registration
- **Responsive Design**: Fully optimized for mobile and desktop
- **Dark/Light Mode**: Toggle between themes

### Admin Features
- **Dashboard**: Product statistics and inventory overview
- **Product Management**: Add, edit, and delete products
- **Category Management**: Pre-configured categories
- **Order Management**: View and update order status

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Material UI (MUI) v5
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Form Handling**: Formik + Yup
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + MUI custom theme

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Header, Footer, Layout wrapper
│   ├── ProductCard.tsx # Product card component
│   └── ProtectedRoute.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── lib/               # Library configurations
│   └── supabase.ts    # Supabase client
├── pages/             # Page components
│   ├── Home.tsx
│   ├── Products.tsx
│   ├── ProductDetail.tsx
│   ├── Cart.tsx
│   ├── Wishlist.tsx
│   ├── Checkout.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── Admin.tsx
├── services/          # API service functions
│   ├── productService.ts
│   ├── cartService.ts
│   ├── wishlistService.ts
│   └── reviewService.ts
├── store/             # Redux store
│   ├── slices/       # Redux slices
│   │   ├── authSlice.ts
│   │   ├── productsSlice.ts
│   │   ├── cartSlice.ts
│   │   ├── wishlistSlice.ts
│   │   └── themeSlice.ts
│   ├── index.ts      # Store configuration
│   └── hooks.ts      # Typed hooks
├── theme/            # MUI theme configuration
│   └── theme.ts
├── types/            # TypeScript type definitions
│   └── index.ts
├── App.tsx           # Main app component with routing
└── main.tsx          # Application entry point
```

## Database Schema

The application uses Supabase with the following tables:

- **user_profiles**: User information and admin status
- **categories**: Product categories
- **products**: Product catalog with pricing, images, and stock
- **reviews**: Product reviews and ratings
- **cart_items**: Shopping cart items
- **wishlists**: User wishlist items
- **addresses**: Shipping addresses
- **orders**: Order information
- **order_items**: Order line items

All tables have Row Level Security (RLS) enabled for data protection.

## Getting Started

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Key Features Implementation

### Authentication
- Email/password authentication via Supabase
- Protected routes for authenticated users
- Admin-only routes for product management

### State Management
- Redux Toolkit for global state
- Separate slices for auth, products, cart, wishlist, and theme
- Automatic state persistence with localStorage (theme)

### Theme System
- Custom Material UI theme with pastel colors
- Glassmorphism effects on cards
- Dark/light mode toggle with persistent preference
- Gradient text and smooth transitions

### E-Commerce Features
- Real-time cart and wishlist updates
- Product reviews with rating system
- Free shipping threshold
- Stock management
- Discount pricing support

## Default Categories

1. **Jewelry** - Handcrafted resin jewelry pieces
2. **Keychains** - Unique resin keychains
3. **Home Decor** - Beautiful resin home decorations
4. **Custom Gifts** - Personalized resin gifts

## Sample Products

The database includes 8 pre-configured sample products across all categories to help you get started quickly.

## Admin Access

To create an admin user:
1. Register a new account
2. Access the Supabase dashboard
3. Update the `user_profiles` table and set `is_admin = true` for your user

## Design Philosophy

- **Modern & Minimal**: Clean interface with ample white space
- **Premium Feel**: Attention to detail with smooth animations and transitions
- **User-Centric**: Intuitive navigation and clear call-to-actions
- **Accessible**: Proper color contrast and responsive design
- **Performance**: Optimized builds and lazy loading where applicable

## Technologies Used

- React 18.3.1
- TypeScript 5.5.3
- Material UI 6.x
- Redux Toolkit 2.x
- React Router 6.x
- Supabase 2.57.4
- Formik + Yup
- Notistack (Toast notifications)
- Lucide React (Icons)
- Vite 5.4.2

## License

This project is created for educational and portfolio purposes.

## Support

For issues or questions, please create an issue in the repository.
