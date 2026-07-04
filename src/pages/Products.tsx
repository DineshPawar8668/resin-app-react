import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import {
  Box,
  Typography,
  useMediaQuery,
  MenuItem,
  Select,
  CircularProgress,
  Tooltip,
  Pagination,
} from "@mui/material";
import {
  ShoppingCart,
  Star,
  ChevronDown,
} from "lucide-react";

import { useTheme } from "@mui/material/styles";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { productService, ProductPagination } from "../services/productService";
import { cartService } from "../services/cartService";
import { useAppSelector } from "../store/hooks";
import { getImageUrl } from "../lib/imageUrl";

const PINK = { 600: "#C2185B", 500: "#D81B60", 50: "#FFF0F6", 100: "#FCE4EC" };

const SORT_OPTIONS = [
  { value: "default", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A–Z" },
  { value: "discount", label: "Best Discount" },
];

function throttle<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let lastCall = 0;
  return ((...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  }) as T;
}

const defaultPagination: ProductPagination = {
  total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPrevPage: false,
};

const Products = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  // ── STATE ──────────────────────────────────────────
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<ProductPagination>(defaultPagination);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [cartLoadingId, setCartLoadingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [selectedCats, setSelectedCats] = useState<string[]>(
    () => { const c = searchParams.get("category"); return c ? [c] : []; }
  );
  const [sortBy, setSortBy] = useState("default");

  // ── REFS ───────────────────────────────────────────
  const appendModeRef = useRef(false);
  const isMobileRef = useRef(isMobile);
  const loadingRef = useRef(loading);
  const loadingMoreRef = useRef(loadingMore);
  const paginationRef = useRef(pagination);

  useEffect(() => { isMobileRef.current = isMobile; }, [isMobile]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { loadingMoreRef.current = loadingMore; }, [loadingMore]);
  useEffect(() => { paginationRef.current = pagination; }, [pagination]);

  // ── LOAD CATEGORIES ────────────────────────────────
  useEffect(() => {
    productService.getCategories().then(setCategories).catch(() => {});
  }, []);

  // ── WATCH URL PARAMS ──
  const isFirstSearchParamRender = useRef(true);
  useEffect(() => {
    if (isFirstSearchParamRender.current) {
      isFirstSearchParamRender.current = false;
      return;
    }
    const cat = searchParams.get("category");
    appendModeRef.current = false;
    setSelectedCats(cat ? [cat] : []);
    setPage(1);
  }, [searchParams]);

  // ── MAIN FETCH ──
  useEffect(() => {
    let cancelled = false;
    const isAppend = appendModeRef.current;
    appendModeRef.current = false;

    if (!isAppend) setLoading(true);
    else setLoadingMore(true);

    const params: Record<string, string | number | boolean> = { page, limit: 10 };
    if (selectedCats.length > 0) params.category_id = selectedCats.join(",");
    if (sortBy !== "default") params.sort = sortBy;

    productService
      .getProductsPaginated(params)
      .then((result) => {
        if (!cancelled) {
          if (isAppend) setProducts((prev) => [...prev, ...result.products]);
          else setProducts(result.products);
          setPagination(result.pagination);
        }
      })
      .catch(() => {
        if (!cancelled) enqueueSnackbar("Failed to load products", { variant: "error" });
      })
      .finally(() => {
        if (!cancelled) { setLoading(false); setLoadingMore(false); }
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedCats, sortBy]);

  // ── DESKTOP PAGE CHANGE ────────────────────────────
  const handleDesktopPageChange = (_: React.ChangeEvent<unknown>, pg: number) => {
    appendModeRef.current = false;
    setPage(pg);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── MOBILE SCROLL ──
  const handleScrollLoadMore = useRef(
    throttle(() => {
      if (!isMobileRef.current) return;
      if (loadingMoreRef.current || loadingRef.current) return;
      if (!paginationRef.current.hasNextPage) return;
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 400) {
        appendModeRef.current = true;
        setPage((p) => p + 1);
      }
    }, 500)
  ).current;

  useEffect(() => {
    window.addEventListener("scroll", handleScrollLoadMore);
    return () => window.removeEventListener("scroll", handleScrollLoadMore);
  }, [handleScrollLoadMore]);

  const handleAddToCart = async (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    if (!isAuthenticated || !user) {
      enqueueSnackbar("Please login to add to cart", { variant: "warning" });
      navigate("/login");
      return;
    }
    try {
      setCartLoadingId(product.id);
      await cartService.addToCart(user.id, product.id);
      enqueueSnackbar("Added to cart!", { variant: "success" });
    } catch {
      enqueueSnackbar("Failed to add to cart", { variant: "error" });
    } finally {
      setCartLoadingId(null);
    }
  };

  /* ─── PRODUCT CARD ─────────────────────────────── */
  const ProductCard = ({ product }: { product: any }) => {
    const discountPct =
      product.discount_price && product.price
        ? Math.round(
            ((product.price - product.discount_price) / product.price) * 100
          )
        : 0;
    const displayPrice = product.discount_price || product.price;

    return (
      <Box
        onClick={() => navigate(`/products/${product.id}`)}
        sx={{
          borderRadius: "16px",
          overflow: "hidden",
          background: "#fff",
          cursor: "pointer",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          border: "1px solid #f0f0f0",
          transition: "transform 0.25s, box-shadow 0.25s",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: "0 16px 40px rgba(194,24,91,0.15)",
          },
          "&:hover .quick-actions": { opacity: 1, transform: "translateY(0)" },
          "&:hover .product-img": { transform: "scale(1.06)" },
        }}
      >
        {/* Image */}
        <Box sx={{ position: "relative", overflow: "hidden", height: 200 }}>
          <Box
            component="img"
            className="product-img"
            src={
              getImageUrl(product.images?.[0]) ||
              "https://placehold.co/400x300/f8f8f8/ccc?text=No+Image"
            }
            alt={product.name}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s ease",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 60%)",
            }}
          />
          {discountPct > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: 10,
                left: 10,
                background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
                color: "#fff",
                fontSize: 11,
                fontWeight: 800,
                px: 1,
                py: 0.3,
                borderRadius: 1,
              }}
            >
              -{discountPct}%
            </Box>
          )}
          <Box
            className="quick-actions"
            sx={{
              position: "absolute",
              bottom: 10,
              right: 10,
              display: "flex",
              flexDirection: "column",
              gap: 0.8,
              opacity: 0,
              transform: "translateY(8px)",
              transition: "opacity 0.2s, transform 0.2s",
            }}
          >
            <Tooltip title="Add to Cart" placement="left">
              <Box
                onClick={(e) => handleAddToCart(e, product)}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background:
                    cartLoadingId === product.id
                      ? PINK[100]
                      : `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(194,24,91,0.3)",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
              >
                {cartLoadingId === product.id ? (
                  <CircularProgress size={14} sx={{ color: PINK[600] }} />
                ) : (
                  <ShoppingCart size={16} color="#fff" />
                )}
              </Box>
            </Tooltip>
          </Box>
        </Box>

        {/* Info */}
        <Box
          sx={{ p: 1.5, flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}
        >
          <Typography
            fontSize={14}
            fontWeight={700}
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.4,
              color: "#1a1a1a",
            }}
          >
            {product.name}
          </Typography>
          {product.rating > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  fill={i < Math.round(product.rating) ? "#FFB300" : "none"}
                  color={i < Math.round(product.rating) ? "#FFB300" : "#ddd"}
                />
              ))}
              <Typography fontSize={11} color="text.secondary" sx={{ lineHeight: 1 }}>
                {product.rating.toFixed(1)}
                {product.totalReviews ? ` (${product.totalReviews})` : ""}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: "auto", pt: 0.5 }}>
            <Typography fontWeight={800} fontSize={16} sx={{ color: PINK[600] }}>
              ₹{displayPrice?.toFixed ? displayPrice.toFixed(0) : displayPrice}
            </Typography>
            {discountPct > 0 && (
              <Typography fontSize={12} sx={{ textDecoration: "line-through", color: "#aaa" }}>
                ₹{product.price?.toFixed ? product.price.toFixed(0) : product.price}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  /* ─── RENDER ────────────────────────────────────── */
  return (
    <>
      <Helmet>
        <title>Buy Handmade Resin Art Online India – Jewelry, Coasters, Frames | ShopIzara</title>
        <meta name="description" content="Browse all handmade resin art products online in India. Shop resin jewelry, coasters, photo frames, home decor, gift sets and more. Best prices. Free delivery above ₹499. ShopIzara." />
        <meta name="keywords" content="buy resin art online india, handmade resin jewelry, resin coasters buy online, resin photo frames india, resin home decor, resin gift sets india, resin products shop, best resin art india" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://shopizara.com/products" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shopizara.com/products" />
        <meta property="og:site_name" content="ShopIzara" />
        <meta property="og:title" content="Buy Handmade Resin Art Online India | ShopIzara" />
        <meta property="og:description" content="Browse all handmade resin art products. Shop resin jewelry, coasters, frames, home decor & gifts. Free delivery above ₹499." />
        <meta property="og:image" content="https://shopizara.com/hero/r-4.jpg" />
        <meta property="og:locale" content="en_IN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Buy Handmade Resin Art Online India | ShopIzara" />
        <meta name="twitter:description" content="Browse all handmade resin art products. Shop resin jewelry, coasters, frames & home decor." />
        <meta name="twitter:image" content="https://shopizara.com/hero/r-4.jpg" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Handmade Resin Art Products – ShopIzara",
            "url": "https://shopizara.com/products",
            "description": "Complete collection of handmade resin art products available online in India including jewelry, coasters, photo frames and home decor.",
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://shopizara.com" },
                { "@type": "ListItem", "position": 2, "name": "All Products", "item": "https://shopizara.com/products" }
              ]
            }
          }
        `}</script>
      </Helmet>
    <Box sx={{ background: "#f7f7fa", minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 1.5, sm: 2, md: 3 }, py: 3 }}>
        {/* Top bar */}
        <Box
          sx={{
            background: "#fff",
            borderRadius: "12px",
            px: 2,
            py: 1.5,
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <Typography fontSize={13} color="text.secondary">
            {loading
              ? "Loading..."
              : `${pagination.total} product${pagination.total !== 1 ? "s" : ""} found`}
          </Typography>

          {/* Sort */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              fontSize={13}
              color="text.secondary"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              Sort:
            </Typography>
            <Select
              value={sortBy}
              onChange={(e) => { appendModeRef.current = false; setPage(1); setSortBy(e.target.value); }}
              size="small"
              IconComponent={ChevronDown}
              sx={{
                fontSize: 13,
                fontWeight: 600,
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e0e0e0" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: PINK[500] },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PINK[500] },
                borderRadius: 2,
                minWidth: 150,
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value} sx={{ fontSize: 13 }}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>

        {/* Product Grid */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 300,
            }}
          >
            <CircularProgress sx={{ color: PINK[500] }} />
          </Box>
        ) : products.length === 0 ? (
          <Box
            sx={{
              background: "#fff",
              borderRadius: "16px",
              py: 8,
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <Box sx={{ fontSize: 48, mb: 1 }}>🔍</Box>
            <Typography variant="h6" fontWeight={700} mb={1}>
              No products found
            </Typography>
            <Typography fontSize={14} color="text.secondary">
              Try browsing a different category
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(4, 1fr)",
                },
                gap: { xs: 1.5, sm: 2 },
              }}
            >
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </Box>

            {/* Mobile: loading more spinner */}
            {isMobile && loadingMore && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={28} sx={{ color: PINK[500] }} />
              </Box>
            )}

            {/* Mobile: end of list message */}
            {isMobile && !loadingMore && !pagination.hasNextPage && (
              <Typography
                textAlign="center"
                color="text.secondary"
                fontSize={13}
                py={3}
              >
                You've seen all {pagination.total} products
              </Typography>
            )}

            {/* Desktop: Pagination */}
            {!isMobile && pagination.totalPages > 1 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 4,
                  mb: 2,
                }}
              >
                <Pagination
                  count={pagination.totalPages}
                  page={page}
                  onChange={handleDesktopPageChange}
                  shape="rounded"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      fontSize: 13,
                      fontWeight: 600,
                    },
                    "& .MuiPaginationItem-root.Mui-selected": {
                      background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
                      color: "#fff",
                      "&:hover": {
                        background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
    </>
  );
};

export default Products;
