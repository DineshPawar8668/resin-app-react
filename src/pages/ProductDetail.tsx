import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Rating,
  IconButton,
  Avatar,
  TextField,
  CircularProgress,
  Divider,
  Grid,
} from "@mui/material";
import { Heart, ShoppingCart, Plus, Minus, Star, Send } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { productService } from "../services/productService";
import { cartService } from "../services/cartService";
import { wishlistService } from "../services/wishlistService";
import { productReviewService, ProductReview } from "../services/productReviewService";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { useSnackbar } from "notistack";
import { setWishlistItems } from "../store/slices/wishlistSlice";

const PINK = { main: "#C2185B", light: "#FCE4EC", dark: "#880E4F", 50: "#FFF0F6" };

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const wishlistItems = useAppSelector((s) => s.wishlist.items);

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [qty, setQty] = useState(1);
  const [imgIndex, setImgIndex] = useState(0);

  // Review form state
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState<number>(-1);
  const [nameError, setNameError] = useState("");
  const [ratingError, setRatingError] = useState("");

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
    try {
      const data = await productReviewService.getByProduct(id!);
      setReviews(data.reviews);
      setAvgRating(data.avgRating);
      setTotalReviews(data.total);
    } catch {
      // silently fail – reviews are optional
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated || !user) {
      enqueueSnackbar("Please login to add items to cart", { variant: "warning" });
      navigate("/login");
      return;
    }
    try {
      setCartLoading(true);
      await cartService.addToCart(user.id, id!, qty);
      enqueueSnackbar("Added to cart!", { variant: "success" });
    } catch {
      enqueueSnackbar("Failed to add to cart", { variant: "error" });
    } finally {
      setCartLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated || !user) {
      enqueueSnackbar("Please login to continue", { variant: "warning" });
      navigate("/login");
      return;
    }
    try {
      setCartLoading(true);
      await cartService.addToCart(user.id, id!, qty);
      navigate("/cart");
    } catch {
      enqueueSnackbar("Failed to add to cart", { variant: "error" });
      setCartLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated || !user) {
      enqueueSnackbar("Please login to add to wishlist", { variant: "warning" });
      navigate("/login");
      return;
    }
    try {
      if (isWish) {
        const item = wishlistItems.find((i) => i.product_id === id);
        if (item) {
          await wishlistService.removeFromWishlist(item.id);
          enqueueSnackbar("Removed from wishlist", { variant: "info" });
        }
      } else {
        await wishlistService.addToWishlist(user.id, id!);
        enqueueSnackbar("Added to wishlist!", { variant: "success" });
      }
      dispatch(setWishlistItems(await wishlistService.getWishlist(user.id)));
    } catch {
      enqueueSnackbar("Failed to update wishlist", { variant: "error" });
    }
  };

  const handleSubmitReview = async () => {
    let valid = true;
    if (!reviewName.trim()) { setNameError("Name is required"); valid = false; }
    else setNameError("");
    if (!reviewRating) { setRatingError("Please select a rating"); valid = false; }
    else setRatingError("");
    if (!valid) return;

    try {
      setReviewSubmitting(true);
      await productReviewService.create({
        product_id: id!,
        name: reviewName.trim(),
        rating: reviewRating!,
        comment: reviewComment.trim(),
      });
      enqueueSnackbar("Review submitted! Thank you.", { variant: "success" });
      setReviewName("");
      setReviewRating(null);
      setReviewComment("");
      loadReviews();
    } catch {
      enqueueSnackbar("Failed to submit review", { variant: "error" });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const isWish = wishlistItems.some((i) => i.product_id === id);
  const price = product?.discount_price || product?.price;
  const discount =
    product?.discount_price &&
    Math.round(((product.price - product.discount_price) / product.price) * 100);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress sx={{ color: PINK.main }} />
      </Box>
    );
  }

  // ── Rating breakdown counts ─────────────────────────
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* ── LEFT: IMAGE ── */}
        <Grid item xs={12} md={5}>
          <Box sx={{ position: "sticky", top: 80 }}>
            <Box
              component="img"
              src={product.images?.[imgIndex]}
              sx={{ width: "100%", height: 400, objectFit: "cover", borderRadius: 2, mb: 2 }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              {product.images?.map((img: string, i: number) => (
                <Box
                  key={i}
                  component="img"
                  src={img}
                  onClick={() => setImgIndex(i)}
                  sx={{
                    width: 70, height: 70,
                    border: i === imgIndex ? `2px solid ${PINK.main}` : "1px solid #ddd",
                    borderRadius: 1, cursor: "pointer", objectFit: "cover",
                  }}
                />
              ))}
            </Box>
          </Box>
        </Grid>

        {/* ── RIGHT: DETAILS ── */}
        <Grid item xs={12} md={7}>
          <Typography variant="h5" fontWeight={700}>
            {product.name}
          </Typography>

          {/* Avg rating badge */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1 }}>
            <Box
              sx={{
                display: "flex", alignItems: "center", gap: 0.5,
                background: avgRating >= 4 ? "#2e7d32" : avgRating >= 3 ? "#f57c00" : "#c62828",
                color: "#fff", px: 1, py: 0.3, borderRadius: 1, fontSize: 13, fontWeight: 700,
              }}
            >
              {avgRating > 0 ? avgRating.toFixed(1) : "—"}
              <Star size={12} fill="#fff" color="#fff" />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {totalReviews > 0 ? `${totalReviews} review${totalReviews !== 1 ? "s" : ""}` : "No reviews yet"}
            </Typography>
          </Box>

          {/* Price */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="h4" color={PINK.main} fontWeight={700}>
              ₹{price}
            </Typography>
            {discount && (
              <Box sx={{ display: "flex", gap: 2 }}>
                <Typography sx={{ textDecoration: "line-through", color: "#888" }}>
                  ₹{product.price}
                </Typography>
                <Typography color="green">{discount}% off</Typography>
              </Box>
            )}
          </Box>

          <Typography sx={{ mt: 2, color: "#333" }}>{product.description}</Typography>

          {/* Quantity */}
          <Box sx={{ display: "flex", alignItems: "center", mt: 3, gap: 2 }}>
            <IconButton onClick={() => setQty(Math.max(1, qty - 1))} size="small">
              <Minus size={16} />
            </IconButton>
            <Typography fontWeight={600}>{qty}</Typography>
            <IconButton onClick={() => setQty(qty + 1)} size="small">
              <Plus size={16} />
            </IconButton>
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button
              fullWidth variant="contained"
              startIcon={cartLoading ? <CircularProgress size={16} color="inherit" /> : <ShoppingCart />}
              disabled={cartLoading} onClick={handleAddToCart}
              sx={{ background: PINK.main, "&:hover": { background: PINK.dark } }}
            >
              Add to Cart
            </Button>
            <Button
              fullWidth variant="outlined" disabled={cartLoading} onClick={handleBuyNow}
              sx={{ borderColor: PINK.main, color: PINK.main }}
            >
              Buy Now
            </Button>
            <IconButton onClick={handleWishlist}>
              <Heart fill={isWish ? PINK.main : "none"} color={isWish ? PINK.main : "gray"} />
            </IconButton>
          </Box>
        </Grid>
      </Grid>

      {/* ═══════════════════════════════════════════════
           REVIEWS SECTION
      ═══════════════════════════════════════════════ */}
      <Divider sx={{ my: 5 }} />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
          alignItems: "flex-start",
          justifyContent: "center",
          maxWidth: 960,
          mx: "auto",
        }}
      >
        {/* ── Rating Summary ── */}
        <Box sx={{ flex: "0 0 50%", width: { xs: "100%", md: "50%" } }}>
          <Box
            sx={{
              background: PINK[50], borderRadius: 3, p: 3,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
              border: `1px solid ${PINK.light}`,
            }}
          >
            <Typography fontSize={56} fontWeight={900} color={PINK.main} lineHeight={1}>
              {avgRating > 0 ? avgRating.toFixed(1) : "—"}
            </Typography>
            <Rating value={avgRating} precision={0.1} readOnly size="medium" sx={{ color: PINK.main }} />
            <Typography fontSize={13} color="text.secondary">
              Based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}
            </Typography>

            <Box sx={{ width: "100%", mt: 1.5, display: "flex", flexDirection: "column", gap: 0.8 }}>
              {ratingCounts.map(({ star, count }) => (
                <Box key={star} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography fontSize={12} width={8}>{star}</Typography>
                  <Star size={12} fill="#FFB300" color="#FFB300" />
                  <Box
                    sx={{
                      flex: 1, height: 6, borderRadius: 3,
                      background: "#e0e0e0", overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%", borderRadius: 3,
                        background: PINK.main,
                        width: totalReviews > 0 ? `${(count / totalReviews) * 100}%` : "0%",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </Box>
                  <Typography fontSize={12} color="text.secondary" width={16}>
                    {count}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* ── Reviews List ── */}
        <Box sx={{ flex: "0 0 50%", width: { xs: "100%", md: "50%" } }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Customer Reviews
          </Typography>

          {reviews.length === 0 ? (
            <Box
              sx={{
                textAlign: "center", py: 5, borderRadius: 2,
                border: "1px dashed #e0e0e0", color: "text.secondary",
              }}
            >
              <Star size={32} color="#ddd" />
              <Typography mt={1}>No reviews yet. Be the first to review!</Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {reviews.map((r) => (
                <Box
                  key={r._id}
                  sx={{
                    p: 2.5, borderRadius: 2,
                    border: "1px solid #f0f0f0",
                    background: "#fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                    <Avatar
                      sx={{
                        width: 40, height: 40, fontSize: 16, fontWeight: 700,
                        background: PINK.main, flexShrink: 0,
                      }}
                    >
                      {r.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography fontWeight={700} fontSize={14}>{r.name}</Typography>
                        <Typography fontSize={11} color="text.secondary">
                          {new Date(r.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </Typography>
                      </Box>
                      <Rating value={r.rating} size="small" readOnly sx={{ color: PINK.main, mt: 0.3 }} />
                      {r.comment && (
                        <Typography fontSize={13} color="#444" mt={0.8} lineHeight={1.6}>
                          {r.comment}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════
           ADD REVIEW FORM
      ═══════════════════════════════════════════════ */}
      <Divider sx={{ my: 5 }} />

      <Box
        sx={{
          maxWidth: 620, mx: "auto",
          background: "#fff", borderRadius: 3,
          border: "1px solid #f0f0f0",
          boxShadow: "0 2px 16px rgba(194,24,91,0.07)",
          p: { xs: 3, sm: 4 },
        }}
      >
        <Typography variant="h6" fontWeight={700} mb={0.5}>
          Write a Review
        </Typography>
        <Typography fontSize={13} color="text.secondary" mb={3}>
          Share your experience with this product
        </Typography>

        {/* Star selector */}
        <Box mb={2.5}>
          <Typography fontSize={13} fontWeight={600} mb={1}>
            Your Rating *
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Box
                key={star}
                onClick={() => { setReviewRating(star); setRatingError(""); }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(-1)}
                sx={{ cursor: "pointer", transition: "transform 0.1s", "&:hover": { transform: "scale(1.2)" } }}
              >
                <Star
                  size={32}
                  fill={(hoverRating !== -1 ? star <= hoverRating : star <= (reviewRating ?? 0)) ? "#FFB300" : "none"}
                  color={(hoverRating !== -1 ? star <= hoverRating : star <= (reviewRating ?? 0)) ? "#FFB300" : "#ccc"}
                  strokeWidth={1.5}
                />
              </Box>
            ))}
            {(hoverRating > 0 || reviewRating) && (
              <Typography fontSize={13} color="text.secondary" ml={1}>
                {RATING_LABELS[hoverRating > 0 ? hoverRating : reviewRating!]}
              </Typography>
            )}
          </Box>
          {ratingError && (
            <Typography fontSize={12} color="error" mt={0.5}>{ratingError}</Typography>
          )}
        </Box>

        {/* Name */}
        <TextField
          label="Your Name *"
          fullWidth
          value={reviewName}
          onChange={(e) => { setReviewName(e.target.value); if (e.target.value.trim()) setNameError(""); }}
          error={!!nameError}
          helperText={nameError}
          size="small"
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PINK.main },
            "& .MuiInputLabel-root.Mui-focused": { color: PINK.main },
          }}
        />

        {/* Comment */}
        <TextField
          label="Your Review (optional)"
          fullWidth multiline rows={3}
          value={reviewComment}
          onChange={(e) => setReviewComment(e.target.value)}
          size="small"
          placeholder="Tell others what you think about this product…"
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PINK.main },
            "& .MuiInputLabel-root.Mui-focused": { color: PINK.main },
          }}
        />

        <Button
          fullWidth variant="contained"
          disabled={reviewSubmitting}
          onClick={handleSubmitReview}
          startIcon={reviewSubmitting ? <CircularProgress size={16} color="inherit" /> : <Send size={16} />}
          sx={{
            py: 1.3, fontWeight: 700, fontSize: 15,
            background: `linear-gradient(135deg, ${PINK.dark} 0%, ${PINK.main} 100%)`,
            "&:hover": { background: `linear-gradient(135deg, ${PINK.dark} 0%, ${PINK.dark} 100%)` },
          }}
        >
          {reviewSubmitting ? "Submitting…" : "Submit Review"}
        </Button>
      </Box>
    </Container>
  );
};
