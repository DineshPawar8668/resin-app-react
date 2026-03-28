/*
  # E-Commerce Database Schema for Resin Products

  ## Overview
  Complete database schema for a handmade resin products e-commerce platform

  ## New Tables

  ### 1. user_profiles
  - `id` (uuid, primary key, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `avatar_url` (text, nullable)
  - `is_admin` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. categories
  - `id` (uuid, primary key)
  - `name` (text, unique) - Category name
  - `description` (text) - Category description
  - `image_url` (text) - Category image
  - `created_at` (timestamptz)

  ### 3. products
  - `id` (uuid, primary key)
  - `name` (text) - Product name
  - `description` (text) - Product description
  - `price` (decimal) - Product price
  - `discount_price` (decimal, nullable) - Discounted price
  - `category_id` (uuid, foreign key) - Reference to categories
  - `images` (text[]) - Array of image URLs
  - `stock` (integer) - Available stock
  - `is_featured` (boolean) - Featured product flag
  - `rating` (decimal) - Average rating
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. reviews
  - `id` (uuid, primary key)
  - `product_id` (uuid, foreign key)
  - `user_id` (uuid, foreign key)
  - `rating` (integer) - Rating 1-5
  - `comment` (text) - Review text
  - `created_at` (timestamptz)

  ### 5. cart_items
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `product_id` (uuid, foreign key)
  - `quantity` (integer)
  - `created_at`, `updated_at` (timestamptz)

  ### 6. wishlists
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `product_id` (uuid, foreign key)
  - `created_at` (timestamptz)

  ### 7. addresses
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - Address fields (name, phone, address, city, state, postal code, country)
  - `is_default` (boolean)
  - `created_at` (timestamptz)

  ### 8. orders
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `address_id` (uuid, foreign key)
  - `total_amount` (decimal)
  - `status` (text) - Order status
  - `payment_method` (text)
  - `created_at`, `updated_at` (timestamptz)

  ### 9. order_items
  - `id` (uuid, primary key)
  - `order_id` (uuid, foreign key)
  - `product_id` (uuid, foreign key)
  - `quantity` (integer)
  - `price` (decimal) - Price at purchase time
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can manage their own data
  - Admins can manage products and categories
  - Public read access for products and categories
*/

-- Create user_profiles table first (needed for admin checks)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  avatar_url text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND is_admin = (SELECT is_admin FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL,
  discount_price decimal(10,2),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  images text[] DEFAULT '{}',
  stock integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  rating decimal(3,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, user_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlist"
  ON wishlists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist items"
  ON wishlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist items"
  ON wishlists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  address_id uuid REFERENCES addresses(id) ON DELETE SET NULL,
  total_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method text DEFAULT 'cash_on_delivery',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Create function to update product rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM reviews
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
  )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update product rating
DROP TRIGGER IF EXISTS update_product_rating_trigger ON reviews;
CREATE TRIGGER update_product_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();

-- Insert sample categories
INSERT INTO categories (name, description, image_url) VALUES
('Jewelry', 'Handcrafted resin jewelry pieces', 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg'),
('Keychains', 'Unique resin keychains', 'https://images.pexels.com/photos/5706451/pexels-photo-5706451.jpeg'),
('Home Decor', 'Beautiful resin home decorations', 'https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg'),
('Custom Gifts', 'Personalized resin gifts', 'https://images.pexels.com/photos/264869/pexels-photo-264869.jpeg')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, discount_price, category_id, images, stock, is_featured, rating)
SELECT 
  'Ocean Wave Pendant',
  'Beautiful handmade resin pendant featuring ocean wave design with blue and white swirls',
  29.99,
  24.99,
  (SELECT id FROM categories WHERE name = 'Jewelry'),
  ARRAY['https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg', 'https://images.pexels.com/photos/1458713/pexels-photo-1458713.jpeg'],
  15,
  true,
  4.5
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Ocean Wave Pendant');

INSERT INTO products (name, description, price, category_id, images, stock, is_featured, rating)
SELECT 
  'Galaxy Keychain',
  'Stunning galaxy-themed resin keychain with glitter and cosmic colors',
  12.99,
  (SELECT id FROM categories WHERE name = 'Keychains'),
  ARRAY['https://images.pexels.com/photos/5706451/pexels-photo-5706451.jpeg'],
  30,
  true,
  4.8
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Galaxy Keychain');

INSERT INTO products (name, description, price, discount_price, category_id, images, stock, is_featured, rating)
SELECT 
  'Floral Coaster Set',
  'Set of 4 resin coasters with preserved real flowers',
  34.99,
  29.99,
  (SELECT id FROM categories WHERE name = 'Home Decor'),
  ARRAY['https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg'],
  20,
  true,
  4.7
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Floral Coaster Set');

INSERT INTO products (name, description, price, category_id, images, stock, is_featured, rating)
SELECT 
  'Custom Name Bookmark',
  'Personalized resin bookmark with custom name and design',
  15.99,
  (SELECT id FROM categories WHERE name = 'Custom Gifts'),
  ARRAY['https://images.pexels.com/photos/264869/pexels-photo-264869.jpeg'],
  25,
  false,
  4.6
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Custom Name Bookmark');

INSERT INTO products (name, description, price, category_id, images, stock, is_featured, rating)
SELECT 
  'Sunset Ring',
  'Handcrafted resin ring with sunset orange and pink gradient',
  22.99,
  (SELECT id FROM categories WHERE name = 'Jewelry'),
  ARRAY['https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg'],
  12,
  false,
  4.4
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Sunset Ring');

INSERT INTO products (name, description, price, category_id, images, stock, is_featured, rating)
SELECT 
  'Crystal Resin Tray',
  'Elegant serving tray with embedded crystals and gold flakes',
  45.99,
  (SELECT id FROM categories WHERE name = 'Home Decor'),
  ARRAY['https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg'],
  8,
  true,
  4.9
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Crystal Resin Tray');

INSERT INTO products (name, description, price, discount_price, category_id, images, stock, is_featured, rating)
SELECT 
  'Botanical Earrings',
  'Delicate resin earrings with real pressed flowers',
  18.99,
  14.99,
  (SELECT id FROM categories WHERE name = 'Jewelry'),
  ARRAY['https://images.pexels.com/photos/1458713/pexels-photo-1458713.jpeg'],
  18,
  true,
  4.7
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Botanical Earrings');

INSERT INTO products (name, description, price, category_id, images, stock, is_featured, rating)
SELECT 
  'Marble Effect Keychain',
  'Modern marble effect resin keychain in pastel colors',
  10.99,
  (SELECT id FROM categories WHERE name = 'Keychains'),
  ARRAY['https://images.pexels.com/photos/5706451/pexels-photo-5706451.jpeg'],
  35,
  false,
  4.5
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Marble Effect Keychain');