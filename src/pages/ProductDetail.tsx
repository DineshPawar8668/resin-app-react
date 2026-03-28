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
import { useAppSelector } from "../store/hooks";
import { useSnackbar } from "notistack";

/* 🔥 PINK THEME */
const PINK = {
  main: "#E91E63",
  light: "#F8BBD0",
  dark: "#C2185B",
};

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const wishlistItems = useAppSelector((s) => s.wishlist.items);

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
              startIcon={<ShoppingCart />}
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
              sx={{
                borderColor: PINK.main,
                color: PINK.main,
              }}
            >
              Buy Now
            </Button>

            <IconButton>
              <Heart color={isWish ? PINK.main : "gray"} />
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