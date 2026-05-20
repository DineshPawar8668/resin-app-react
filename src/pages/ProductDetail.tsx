import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Rating,
  Chip,
  IconButton,
  Card,
  CardContent,
  Avatar,
  TextField,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Heart, ShoppingCart, Plus, Minus } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { productService } from "../services/productService";
import { cartService } from "../services/cartService";
import { wishlistService } from "../services/wishlistService";
import { reviewService } from "../services/reviewService";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { useSnackbar } from "notistack";
import { setWishlistItems } from "../store/slices/wishlistSlice";

/* 🔥 PINK THEME */
const PINK = {
  main: "#E91E63",
  light: "#F8BBD0",
  dark: "#C2185B",
};

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const wishlistItems = useAppSelector((s) => s.wishlist.items);

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [qty, setQty] = useState(1);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    if (id) {
      loadProduct();
      loadReviews();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const data = await productService.getProductById(id!);
      setProduct(data);
    } catch {
      enqueueSnackbar("Error loading product", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    const data = await reviewService.getProductReviews(id!);
    setReviews(data);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated || !user) {
      enqueueSnackbar('Please login to add items to cart', { variant: 'warning' });
      navigate('/login');
      return;
    }
    try {
      setCartLoading(true);
      await cartService.addToCart(user.id, id!, qty);
      enqueueSnackbar('Added to cart!', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to add to cart', { variant: 'error' });
    } finally {
      setCartLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated || !user) {
      enqueueSnackbar('Please login to continue', { variant: 'warning' });
      navigate('/login');
      return;
    }
    try {
      setCartLoading(true);
      await cartService.addToCart(user.id, id!, qty);
      navigate('/cart');
    } catch {
      enqueueSnackbar('Failed to add to cart', { variant: 'error' });
      setCartLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated || !user) {
      enqueueSnackbar('Please login to add to wishlist', { variant: 'warning' });
      navigate('/login');
      return;
    }
    try {
      if (isWish) {
        const item = wishlistItems.find((i) => i.product_id === id);
        if (item) {
          await wishlistService.removeFromWishlist(item.id);
          enqueueSnackbar('Removed from wishlist', { variant: 'info' });
        }
      } else {
        await wishlistService.addToWishlist(user.id, id!);
        enqueueSnackbar('Added to wishlist!', { variant: 'success' });
      }
      const updated = await wishlistService.getWishlist(user.id);
      dispatch(setWishlistItems(updated));
    } catch {
      enqueueSnackbar('Failed to update wishlist', { variant: 'error' });
    }
  };

  const isWish = wishlistItems.some((i) => i.product_id === id);

  const price = product?.discount_price || product?.price;
  const discount =
    product?.discount_price &&
    Math.round(
      ((product.price - product.discount_price) / product.price) * 100
    );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* LEFT IMAGE */}
        <Grid item xs={12} md={5}>
          <Box sx={{ position: "sticky", top: 80 }}>
            <Box
              component="img"
              src={product.images?.[imgIndex]}
              sx={{
                width: "100%",
                height: 400,
                objectFit: "cover",
                borderRadius: 2,
                mb: 2,
              }}
            />

            <Box sx={{ display: "flex", gap: 1 }}>
              {product.images?.map((img: string, i: number) => (
                <Box
                  key={i}
                  component="img"
                  src={img}
                  onClick={() => setImgIndex(i)}
                  sx={{
                    width: 70,
                    height: 70,
                    border:
                      i === imgIndex
                        ? `2px solid ${PINK.main}`
                        : "1px solid #ddd",
                    borderRadius: 1,
                    cursor: "pointer",
                  }}
                />
              ))}
            </Box>
          </Box>
        </Grid>

        {/* RIGHT DETAILS */}
        <Grid item xs={12} md={7}>
          <Typography variant="h5" fontWeight={700}>
            {product.name}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
            <Rating value={product.rating} readOnly size="small" />
            <Typography variant="body2">({reviews.length})</Typography>
          </Box>

          {/* PRICE */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="h4" color={PINK.main} fontWeight={700}>
              ₹{price}
            </Typography>

            {discount && (
              <Box sx={{ display: "flex", gap: 2 }}>
                <Typography
                  sx={{ textDecoration: "line-through", color: "#888" }}
                >
                  ₹{product.price}
                </Typography>
                <Typography color="green">{discount}% off</Typography>
              </Box>
            )}
          </Box>

          {/* DESC */}
          <Typography sx={{ mt: 2, color: "#555" }}>
            {product.description}
          </Typography>

          {/* QUANTITY */}
          <Box sx={{ display: "flex", alignItems: "center", mt: 3, gap: 2 }}>
            <IconButton onClick={() => setQty(Math.max(1, qty - 1))}>
              <Minus size={16} />
            </IconButton>
            <Typography>{qty}</Typography>
            <IconButton onClick={() => setQty(qty + 1)}>
              <Plus size={16} />
            </IconButton>
          </Box>

          {/* BUTTONS */}
          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={cartLoading ? <CircularProgress size={16} color="inherit" /> : <ShoppingCart />}
              disabled={cartLoading}
              onClick={handleAddToCart}
              sx={{
                background: PINK.main,
                "&:hover": { background: PINK.dark },
              }}
            >
              Add to Cart
            </Button>

            <Button
              fullWidth
              variant="outlined"
              disabled={cartLoading}
              onClick={handleBuyNow}
              sx={{
                borderColor: PINK.main,
                color: PINK.main,
              }}
            >
              Buy Now
            </Button>

            <IconButton onClick={handleWishlist}>
              <Heart
                fill={isWish ? PINK.main : "none"}
                color={isWish ? PINK.main : "gray"}
              />
            </IconButton>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* REVIEWS */}
          <Typography variant="h6" fontWeight={600}>
            Reviews
          </Typography>

          {reviews.map((r) => (
            <Card key={r.id} sx={{ mt: 2 }}>
              <CardContent>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Avatar>{r.user_profile?.full_name?.[0]}</Avatar>
                  <Box>
                    <Typography fontWeight={600}>
                      {r.user_profile?.full_name}
                    </Typography>
                    <Rating value={r.rating} size="small" readOnly />
                    <Typography variant="body2">{r.comment}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Grid>
    </Container>
  );
};