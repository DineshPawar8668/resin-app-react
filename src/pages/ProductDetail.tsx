import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
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
import { Heart, ShoppingCart, Plus, Minus, Star, Send, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { productService } from "../services/productService";
import { cartService } from "../services/cartService";
import { wishlistService } from "../services/wishlistService";
import { productReviewService, ProductReview } from "../services/productReviewService";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { useSnackbar } from "notistack";
import { setWishlistItems } from "../store/slices/wishlistSlice";
import { addToCart as addToCartAction } from "../store/slices/cartSlice";
import type { ProductItem } from "../types";

const PINK = { main: "#C2185B", light: "#FCE4EC", dark: "#880E4F", 50: "#FFF0F6" };

const RATING_LABELS: Record<number, string> = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent" };

interface MediaItem {
  type: "image" | "video";
  url: string;
}

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const wishlistItems = useAppSelector((s) => s.wishlist.items);

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [qty, setQty] = useState(1);
  const [sizeVariants, setSizeVariants] = useState<Array<{ id: string; size: string; price: number; discountpercent: number; offerprice: number }>>([]);
  const [suggestions, setSuggestions] = useState<ProductItem[]>([]);

  // Media gallery state
  const [activeIndex, setActiveIndex] = useState(0);
  const thumbnailStripRef = useRef<HTMLDivElement>(null);

  // Review form
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState<number>(-1);
  const [nameError, setNameError] = useState("");
  const [ratingError, setRatingError] = useState("");

  useEffect(() => {
    if (id) { setSizeVariants([]); setSuggestions([]); loadProduct(); loadReviews(); }
  }, [id]);

  const loadProduct = async () => {
    try {
      const data = await productService.getById(id!);
      setProduct(data);
      if (data.size) {
        const variants = await productService.getSizeVariants(id!);
        setSizeVariants(variants);
      }
      if (data.category_id) {
        productService.getAll({ category_id: data.category_id })
          .then((all) => setSuggestions(all.filter((p) => p.id !== id).slice(0, 8)))
          .catch(() => {});
      }
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
    } catch { /* reviews are optional */ }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated || !user) { enqueueSnackbar("Please login to add items to cart", { variant: "warning" }); navigate("/login"); return; }
    try {
      setCartLoading(true);
      const item = await cartService.addToCart(user.id, id!, qty);
      dispatch(addToCartAction(item));
      enqueueSnackbar("Added to cart!", { variant: "success" });
    } catch { enqueueSnackbar("Failed to add to cart", { variant: "error" }); }
    finally { setCartLoading(false); }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated || !user) { enqueueSnackbar("Please login to continue", { variant: "warning" }); navigate("/login"); return; }
    try {
      setCartLoading(true);
      const item = await cartService.addToCart(user.id, id!, qty);
      dispatch(addToCartAction(item));
      navigate("/cart");
    } catch { enqueueSnackbar("Failed to add to cart", { variant: "error" }); setCartLoading(false); }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated || !user) { enqueueSnackbar("Please login to add to wishlist", { variant: "warning" }); navigate("/login"); return; }
    try {
      if (isWish) {
        const item = wishlistItems.find((i) => i.product_id === id);
        if (item) { await wishlistService.removeFromWishlist(item.id); enqueueSnackbar("Removed from wishlist", { variant: "info" }); }
      } else {
        await wishlistService.addToWishlist(user.id, id!);
        enqueueSnackbar("Added to wishlist!", { variant: "success" });
      }
      dispatch(setWishlistItems(await wishlistService.getWishlist(user.id)));
    } catch { enqueueSnackbar("Failed to update wishlist", { variant: "error" }); }
  };

  const handleSubmitReview = async () => {
    let valid = true;
    if (!reviewName.trim()) { setNameError("Name is required"); valid = false; } else setNameError("");
    if (!reviewRating) { setRatingError("Please select a rating"); valid = false; } else setRatingError("");
    if (!valid) return;
    try {
      setReviewSubmitting(true);
      await productReviewService.create({ product_id: id!, name: reviewName.trim(), rating: reviewRating!, comment: reviewComment.trim() });
      enqueueSnackbar("Review submitted! Thank you.", { variant: "success" });
      setReviewName(""); setReviewRating(null); setReviewComment("");
      loadReviews();
    } catch { enqueueSnackbar("Failed to submit review", { variant: "error" }); }
    finally { setReviewSubmitting(false); }
  };

  const isWish = wishlistItems.some((i) => i.product_id === id);

  if (loading) {
    return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress sx={{ color: PINK.main }} /></Box>;
  }

  if (!product) return null;

  // Build unified media list: images first, then video
  const allMedia: MediaItem[] = [
    ...(product.images?.length ? product.images : (product.image ? [product.image] : [])).map((url) => ({ type: "image" as const, url })),
    ...(product.video ? [{ type: "video" as const, url: product.video }] : []),
  ];

  const activeMedia = allMedia[activeIndex] ?? allMedia[0];
  const price = product.discountpercent > 0 ? product.offerprice : product.price;
  const discount = product.discountpercent > 0 ? product.discountpercent : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star, count: reviews.filter((r) => r.rating === star).length,
  }));

  const scrollThumbs = (dir: "left" | "right") => {
    if (thumbnailStripRef.current) {
      thumbnailStripRef.current.scrollBy({ left: dir === "left" ? -80 : 80, behavior: "smooth" });
    }
  };

  const productImageUrl = product.images?.[0] || "https://shopizara.com/hero/r-3.jpg";
  const productUrl = `https://shopizara.com/products/${id}`;
  const finalPrice = product.discountpercent > 0 ? product.offerprice : product.price;
  const availability = "https://schema.org/InStock";

  return (
    <>
      <Helmet>
        <title>{`${product.title} – Buy Resin Art Online | ShopIzara`}</title>
        <meta name="description" content={`Buy ${product.title} online at ShopIzara. ${product.description ? product.description.slice(0, 120) + "..." : "Premium handmade resin art. Free delivery above ₹499. 100% handcrafted in India."}`} />
        <meta name="keywords" content={`${product.title}, buy resin art online, handmade resin products india, resin art shop, shopizara`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={productUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={productUrl} />
        <meta property="og:site_name" content="ShopIzara" />
        <meta property="og:title" content={`${product.title} | ShopIzara`} />
        <meta property="og:description" content={product.description ? product.description.slice(0, 200) : `Buy ${product.title} – premium handmade resin art at ShopIzara.`} />
        <meta property="og:image" content={productImageUrl} />
        <meta property="og:image:alt" content={product.title} />
        <meta property="og:locale" content="en_IN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.title} | ShopIzara`} />
        <meta name="twitter:description" content={`Buy ${product.title} online. Handmade resin art at ShopIzara.`} />
        <meta name="twitter:image" content={productImageUrl} />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": ${JSON.stringify(product.title)},
            "description": ${JSON.stringify(product.description || product.title)},
            "image": ${JSON.stringify(productImageUrl)},
            "url": ${JSON.stringify(productUrl)},
            "brand": {
              "@type": "Brand",
              "name": "ShopIzara"
            },
            "offers": {
              "@type": "Offer",
              "url": ${JSON.stringify(productUrl)},
              "priceCurrency": "INR",
              "price": ${JSON.stringify(finalPrice)},
              "availability": ${JSON.stringify(availability)},
              "seller": {
                "@type": "Organization",
                "name": "ShopIzara"
              }
            }
            ${avgRating > 0 ? `,
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": ${JSON.stringify(avgRating)},
              "reviewCount": ${JSON.stringify(totalReviews)},
              "bestRating": "5",
              "worstRating": "1"
            }` : ""}
          }
        `}</script>
      </Helmet>
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>

        {/* ══════════════════════════════════════════
             LEFT: FLIPKART-STYLE MEDIA GALLERY
        ══════════════════════════════════════════ */}
        <Grid item xs={12} md={5}>
          <Box sx={{ position: "sticky", top: 80 }}>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>

              {/* Vertical thumbnail strip — desktop only */}
              {allMedia.length > 1 && (
                <Box sx={{
                  display: { xs: "none", sm: "flex" },
                  flexDirection: "column",
                  gap: 1,
                  width: 68,
                  maxHeight: 440,
                  overflowY: "auto",
                  flexShrink: 0,
                  "&::-webkit-scrollbar": { width: 3 },
                  "&::-webkit-scrollbar-thumb": { bgcolor: "#ddd", borderRadius: 4 },
                }}>
                  {allMedia.map((item, i) => (
                    <ThumbBox
                      key={i}
                      item={item}
                      active={i === activeIndex}
                      onClick={() => setActiveIndex(i)}
                    />
                  ))}
                </Box>
              )}

              {/* Main display area */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{
                  width: "100%",
                  aspectRatio: "1",
                  borderRadius: 2.5,
                  overflow: "hidden",
                  bgcolor: "#f8f8f8",
                  border: "1px solid #efefef",
                  position: "relative",
                }}>
                  {activeMedia?.type === "video" ? (
                    <Box
                      component="video"
                      key={activeMedia.url}
                      src={activeMedia.url}
                      controls
                      autoPlay
                      sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block", bgcolor: "#000" }}
                    />
                  ) : (
                    <Box
                      component="img"
                      src={activeMedia?.url ?? ""}
                      alt={product.title}
                      sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                    />
                  )}

                  {/* Prev / Next arrows — shown when multiple media */}
                  {allMedia.length > 1 && (
                    <>
                      <IconButton
                        onClick={() => setActiveIndex((p) => (p - 1 + allMedia.length) % allMedia.length)}
                        size="small"
                        sx={{
                          position: "absolute", left: 6, top: "50%", transform: "translateY(-50%)",
                          bgcolor: "rgba(255,255,255,0.92)", boxShadow: "0 1px 6px rgba(0,0,0,0.15)",
                          "&:hover": { bgcolor: "#fff" }, p: 0.6,
                        }}
                      >
                        <ChevronLeft size={18} />
                      </IconButton>
                      <IconButton
                        onClick={() => setActiveIndex((p) => (p + 1) % allMedia.length)}
                        size="small"
                        sx={{
                          position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
                          bgcolor: "rgba(255,255,255,0.92)", boxShadow: "0 1px 6px rgba(0,0,0,0.15)",
                          "&:hover": { bgcolor: "#fff" }, p: 0.6,
                        }}
                      >
                        <ChevronRight size={18} />
                      </IconButton>
                    </>
                  )}

                  {/* Dot indicators */}
                  {allMedia.length > 1 && (
                    <Box sx={{ position: "absolute", bottom: 8, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 0.6 }}>
                      {allMedia.map((_, i) => (
                        <Box
                          key={i}
                          onClick={() => setActiveIndex(i)}
                          sx={{
                            width: i === activeIndex ? 18 : 6, height: 6, borderRadius: 3,
                            bgcolor: i === activeIndex ? PINK.main : "rgba(0,0,0,0.25)",
                            transition: "all 0.25s", cursor: "pointer",
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Mobile horizontal thumbnail strip */}
                {allMedia.length > 1 && (
                  <Box sx={{ display: { xs: "flex", sm: "none" }, alignItems: "center", mt: 1.5, gap: 0.5 }}>
                    <IconButton size="small" onClick={() => scrollThumbs("left")} sx={{ p: 0.3, flexShrink: 0 }}>
                      <ChevronLeft size={16} />
                    </IconButton>
                    <Box
                      ref={thumbnailStripRef}
                      sx={{
                        display: "flex", gap: 1, overflowX: "auto", flex: 1,
                        pb: 0.5, scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" },
                      }}
                    >
                      {allMedia.map((item, i) => (
                        <ThumbBox key={i} item={item} active={i === activeIndex} onClick={() => setActiveIndex(i)} />
                      ))}
                    </Box>
                    <IconButton size="small" onClick={() => scrollThumbs("right")} sx={{ p: 0.3, flexShrink: 0 }}>
                      <ChevronRight size={16} />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* ══════════════════════════════════════════
             RIGHT: PRODUCT DETAILS
        ══════════════════════════════════════════ */}
        <Grid item xs={12} md={7}>
          <Typography variant="h5" fontWeight={700}>{product.title}</Typography>

          {/* Avg rating badge */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, background: avgRating >= 4 ? "#2e7d32" : avgRating >= 3 ? "#f57c00" : "#c62828", color: "#fff", px: 1, py: 0.3, borderRadius: 1, fontSize: 13, fontWeight: 700 }}>
              {avgRating > 0 ? avgRating.toFixed(1) : "—"}
              <Star size={12} fill="#fff" color="#fff" />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {totalReviews > 0 ? `${totalReviews} review${totalReviews !== 1 ? "s" : ""}` : "No reviews yet"}
            </Typography>
          </Box>

          {/* Size selector */}
          {sizeVariants.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography fontSize={14} fontWeight={700} mb={1}>
                Size:{" "}
                <Typography component="span" fontWeight={500} color="text.secondary">
                  {product.size}
                </Typography>
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {sizeVariants.map((v) => {
                  const isActive = v.id === id;
                  return (
                    <Box
                      key={v.id}
                      onClick={() => !isActive && navigate(`/products/${v.id}`)}
                      sx={{
                        px: 2,
                        py: 0.8,
                        borderRadius: 2,
                        border: "2px solid",
                        borderColor: isActive ? PINK.main : "#e0e0e0",
                        cursor: isActive ? "default" : "pointer",
                        background: isActive ? PINK.light : "#fff",
                        transition: "all 0.15s",
                        minWidth: 64,
                        textAlign: "center",
                        "&:hover": !isActive ? { borderColor: PINK.main, background: "#fafafa" } : {},
                      }}
                    >
                      <Typography fontSize={13} fontWeight={isActive ? 700 : 500} color={isActive ? PINK.main : "#333"}>
                        {v.size}
                      </Typography>
                      <Typography fontSize={11} color={isActive ? PINK.dark : "text.secondary"} fontWeight={isActive ? 600 : 400}>
                        ₹{v.discountpercent > 0 ? v.offerprice : v.price}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Price */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="h4" color={PINK.main} fontWeight={700}>₹{price}</Typography>
            {discount > 0 && (
              <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 0.5 }}>
                <Typography sx={{ textDecoration: "line-through", color: "#888", fontSize: 16 }}>₹{product.price}</Typography>
                <Typography color="green" fontWeight={600}>{discount}% off</Typography>
              </Box>
            )}
          </Box>

          <Typography sx={{ mt: 2, color: "#333", lineHeight: 1.7 }}>{product.description}</Typography>

          {/* Quantity */}
          <Box sx={{ display: "flex", alignItems: "center", mt: 3, gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: 2, overflow: "hidden" }}>
              <IconButton onClick={() => setQty(Math.max(1, qty - 1))} size="small" sx={{ borderRadius: 0, px: 1.5 }}>
                <Minus size={16} />
              </IconButton>
              <Typography fontWeight={700} sx={{ px: 2, minWidth: 36, textAlign: "center" }}>{qty}</Typography>
              <IconButton onClick={() => setQty(qty + 1)} size="small" sx={{ borderRadius: 0, px: 1.5 }}>
                <Plus size={16} />
              </IconButton>
            </Box>
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button
              fullWidth variant="contained"
              startIcon={cartLoading ? <CircularProgress size={16} color="inherit" /> : <ShoppingCart />}
              disabled={cartLoading} onClick={handleAddToCart}
              sx={{ background: PINK.main, "&:hover": { background: PINK.dark }, py: 1.4, fontWeight: 700 }}
            >
              Add to Cart
            </Button>
            <Button
              fullWidth variant="outlined" disabled={cartLoading} onClick={handleBuyNow}
              sx={{ borderColor: PINK.main, color: PINK.main, py: 1.4, fontWeight: 700, "&:hover": { borderColor: PINK.dark, color: PINK.dark } }}
            >
              Buy Now
            </Button>
            <IconButton onClick={handleWishlist} sx={{ border: "1px solid #e0e0e0", borderRadius: 2, px: 1.5 }}>
              <Heart fill={isWish ? PINK.main : "none"} color={isWish ? PINK.main : "gray"} />
            </IconButton>
          </Box>
        </Grid>
      </Grid>

      {/* ════════════════ REVIEWS ════════════════ */}
      <Divider sx={{ my: 5 }} />

      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4, alignItems: "flex-start", justifyContent: "center", maxWidth: 960, mx: "auto" }}>
        {/* Rating Summary */}
        <Box sx={{ flex: "0 0 50%", width: { xs: "100%", md: "50%" } }}>
          <Box sx={{ background: PINK[50], borderRadius: 3, p: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 1, border: `1px solid ${PINK.light}` }}>
            <Typography fontSize={56} fontWeight={900} color={PINK.main} lineHeight={1}>{avgRating > 0 ? avgRating.toFixed(1) : "—"}</Typography>
            <Rating value={avgRating} precision={0.1} readOnly size="medium" sx={{ color: PINK.main }} />
            <Typography fontSize={13} color="text.secondary">Based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}</Typography>
            <Box sx={{ width: "100%", mt: 1.5, display: "flex", flexDirection: "column", gap: 0.8 }}>
              {ratingCounts.map(({ star, count }) => (
                <Box key={star} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography fontSize={12} width={8}>{star}</Typography>
                  <Star size={12} fill="#FFB300" color="#FFB300" />
                  <Box sx={{ flex: 1, height: 6, borderRadius: 3, background: "#e0e0e0", overflow: "hidden" }}>
                    <Box sx={{ height: "100%", borderRadius: 3, background: PINK.main, width: totalReviews > 0 ? `${(count / totalReviews) * 100}%` : "0%", transition: "width 0.4s ease" }} />
                  </Box>
                  <Typography fontSize={12} color="text.secondary" width={16}>{count}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Reviews List */}
        <Box sx={{ flex: "0 0 50%", width: { xs: "100%", md: "50%" } }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Customer Reviews</Typography>
          {reviews.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 5, borderRadius: 2, border: "1px dashed #e0e0e0", color: "text.secondary" }}>
              <Star size={32} color="#ddd" />
              <Typography mt={1}>No reviews yet. Be the first to review!</Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {reviews.map((r) => (
                <Box key={r._id} sx={{ p: 2.5, borderRadius: 2, border: "1px solid #f0f0f0", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                    <Avatar sx={{ width: 40, height: 40, fontSize: 16, fontWeight: 700, background: PINK.main, flexShrink: 0 }}>
                      {r.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography fontWeight={700} fontSize={14}>{r.name}</Typography>
                        <Typography fontSize={11} color="text.secondary">
                          {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </Typography>
                      </Box>
                      <Rating value={r.rating} size="small" readOnly sx={{ color: PINK.main, mt: 0.3 }} />
                      {r.comment && <Typography fontSize={13} color="#444" mt={0.8} lineHeight={1.6}>{r.comment}</Typography>}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* ════════════════ ADD REVIEW ════════════════ */}
      <Divider sx={{ my: 5 }} />

      <Box sx={{ maxWidth: 620, mx: "auto", background: "#fff", borderRadius: 3, border: "1px solid #f0f0f0", boxShadow: "0 2px 16px rgba(194,24,91,0.07)", p: { xs: 3, sm: 4 } }}>
        <Typography variant="h6" fontWeight={700} mb={0.5}>Write a Review</Typography>
        <Typography fontSize={13} color="text.secondary" mb={3}>Share your experience with this product</Typography>

        <Box mb={2.5}>
          <Typography fontSize={13} fontWeight={600} mb={1}>Your Rating *</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Box key={star} onClick={() => { setReviewRating(star); setRatingError(""); }} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(-1)} sx={{ cursor: "pointer", transition: "transform 0.1s", "&:hover": { transform: "scale(1.2)" } }}>
                <Star size={32} fill={(hoverRating !== -1 ? star <= hoverRating : star <= (reviewRating ?? 0)) ? "#FFB300" : "none"} color={(hoverRating !== -1 ? star <= hoverRating : star <= (reviewRating ?? 0)) ? "#FFB300" : "#ccc"} strokeWidth={1.5} />
              </Box>
            ))}
            {(hoverRating > 0 || reviewRating) && <Typography fontSize={13} color="text.secondary" ml={1}>{RATING_LABELS[hoverRating > 0 ? hoverRating : reviewRating!]}</Typography>}
          </Box>
          {ratingError && <Typography fontSize={12} color="error" mt={0.5}>{ratingError}</Typography>}
        </Box>

        <TextField label="Your Name *" fullWidth value={reviewName} onChange={(e) => { setReviewName(e.target.value); if (e.target.value.trim()) setNameError(""); }} error={!!nameError} helperText={nameError} size="small" sx={{ mb: 2, "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PINK.main }, "& .MuiInputLabel-root.Mui-focused": { color: PINK.main } }} />
        <TextField label="Your Review (optional)" fullWidth multiline rows={3} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} size="small" placeholder="Tell others what you think about this product…" sx={{ mb: 3, "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PINK.main }, "& .MuiInputLabel-root.Mui-focused": { color: PINK.main } }} />

        <Button fullWidth variant="contained" disabled={reviewSubmitting} onClick={handleSubmitReview} startIcon={reviewSubmitting ? <CircularProgress size={16} color="inherit" /> : <Send size={16} />} sx={{ py: 1.3, fontWeight: 700, fontSize: 15, background: `linear-gradient(135deg, ${PINK.dark} 0%, ${PINK.main} 100%)`, "&:hover": { background: `linear-gradient(135deg, ${PINK.dark} 0%, ${PINK.dark} 100%)` } }}>
          {reviewSubmitting ? "Submitting…" : "Submit Review"}
        </Button>
      </Box>
      {/* ════════════════ YOU MAY ALSO LIKE ════════════════ */}
      {suggestions.length > 0 && (
        <>
          <Divider sx={{ my: 5 }} />
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={700} mb={0.5}>You May Also Like</Typography>
            <Typography fontSize={13} color="text.secondary">More from the same collection</Typography>
          </Box>
          <Box sx={{ position: "relative" }}>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                overflowX: "auto",
                pb: 1,
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              {suggestions.map((s) => (
                <SuggestionCard key={s.id} product={s} onClick={() => navigate(`/products/${s.id}`)} />
              ))}
            </Box>
          </Box>
        </>
      )}
    </Container>
    </>
  );
};

// ── Suggestion card component ────────────────────────────────────────────────

function SuggestionCard({ product, onClick }: { product: ProductItem; onClick: () => void }) {
  const price = product.discountpercent > 0 ? product.offerprice : product.price;
  const discount = product.discountpercent > 0 ? product.discountpercent : 0;
  const imgSrc = product.images?.[0] || product.image || "";

  return (
    <Box
      onClick={onClick}
      sx={{
        width: 180,
        flexShrink: 0,
        borderRadius: 2.5,
        border: "1px solid #f0f0f0",
        overflow: "hidden",
        cursor: "pointer",
        background: "#fff",
        transition: "box-shadow 0.2s, transform 0.2s",
        "&:hover": { boxShadow: "0 6px 24px rgba(194,24,91,0.13)", transform: "translateY(-2px)" },
      }}
    >
      <Box sx={{ width: "100%", aspectRatio: "1", bgcolor: "#f8f8f8", overflow: "hidden" }}>
        <Box
          component="img"
          src={imgSrc}
          alt={product.title}
          sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </Box>
      <Box sx={{ p: 1.2 }}>
        <Typography
          fontSize={13}
          fontWeight={600}
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.4,
            mb: 0.6,
            color: "#222",
          }}
        >
          {product.title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexWrap: "wrap" }}>
          <Typography fontSize={14} fontWeight={800} color="#C2185B">₹{price}</Typography>
          {discount > 0 && (
            <Typography fontSize={11} color="text.secondary" sx={{ textDecoration: "line-through" }}>
              ₹{product.price}
            </Typography>
          )}
          {discount > 0 && (
            <Typography fontSize={10} fontWeight={700} color="green">{discount}% off</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ── Thumbnail box component ──────────────────────────────────────────────────

function ThumbBox({ item, active, onClick }: { item: MediaItem; active: boolean; onClick: () => void }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: 64, height: 64, borderRadius: 1.5, flexShrink: 0,
        border: active ? `2px solid #C2185B` : "1.5px solid #e0e0e0",
        overflow: "hidden", cursor: "pointer", position: "relative",
        bgcolor: item.type === "video" ? "#000" : "#f5f5f5",
        transition: "border-color 0.15s",
        "&:hover": { borderColor: active ? "#C2185B" : "#bdbdbd" },
      }}
    >
      {item.type === "video" ? (
        <>
          <Box component="video" src={item.url} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(0,0,0,0.42)" }}>
            <Play size={20} color="#fff" fill="#fff" />
          </Box>
        </>
      ) : (
        <Box component="img" src={item.url} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
      )}
    </Box>
  );
}
