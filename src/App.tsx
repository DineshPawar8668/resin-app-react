import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { createAppTheme } from "./theme/theme";
import { useAppSelector } from "./store/hooks";
import { Layout } from "./components/Layout/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Home } from "./pages/Home";
import Products from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import { Wishlist } from "./pages/Wishlist";
import { Checkout } from "./pages/Checkout";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Admin } from "./pages/Admin";
import { useEffect } from "react";
import { cartService } from "./services/cartService";
import { wishlistService } from "./services/wishlistService";
import { productService } from "./services/productService";
import { setCartItems } from "./store/slices/cartSlice";
import { setWishlistItems } from "./store/slices/wishlistSlice";
import { setProducts, setCategories } from "./store/slices/productsSlice";
import { useAppDispatch } from "./store/hooks";

function App() {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state) => state.theme.mode);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const theme = createAppTheme(themeMode);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    }
  }, [isAuthenticated, user]);

  const loadInitialData = async () => {
    try {
      const [products, categories] = await Promise.all([
        productService.getProducts(),
        productService.getCategories(),
      ]);
      dispatch(setProducts(products));
      dispatch(setCategories(categories));
    } catch (error) {
      console.error("Failed to load initial data:", error);
    }
  };

  const loadUserData = async () => {
    if (!user) return;

    try {
      const [cartItems, wishlistItems] = await Promise.all([
        cartService.getCartItems(user.id),
        wishlistService.getWishlist(user.id),
      ]);
      dispatch(setCartItems(cartItems));
      dispatch(setWishlistItems(wishlistItems));
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        autoHideDuration={3000}
      >
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute>
                    <Wishlist />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <Admin />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
