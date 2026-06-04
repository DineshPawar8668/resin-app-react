import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Slider,
  Drawer,
  useMediaQuery,
  Chip,
  Badge,
  Divider,
  MenuItem,
  Select,
  CircularProgress,
  Tooltip,
  Pagination,
} from "@mui/material";
import {
  SlidersHorizontal,
  X,
  ShoppingCart,
  Star,
  Tag,
  ChevronDown,
  Search,
  Sparkles,
} from "lucide-react";

import { useTheme } from "@mui/material/styles";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { productService, ProductPagination } from "../services/productService";
import { cartService } from "../services/cartService";
import { wishlistService } from "../services/wishlistService";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setWishlistItems } from "../store/slices/wishlistSlice";
import { getImageUrl } from "../lib/imageUrl";

const PINK = { 600: "#C2185B", 500: "#D81B60", 50: "#FFF0F6", 100: "#FCE4EC" };
const MAX_PRICE = 10000;

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
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const wishlistItems = useAppSelector((s) => s.wishlist.items);

  // ── STATE ──────────────────────────────────────────
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<ProductPagination>(defaultPagination);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartLoadingId, setCartLoadingId] = useState<string | null>(null);
  const [page, setPage] = useState(1); // unified page for desktop+mobile

  // ── FILTERS ────────────────────────────────────────
  const [selectedCats, setSelectedCats] = useState<string[]>(
    () => { const c = searchParams.get("category"); return c ? [c] : []; }
  );
  // sliderValue updates on every drag (visual only); priceRange updates on commit (triggers API)
  const [sliderValue, setSliderValue] = useState<number[]>([0, MAX_PRICE]);
  const [priceRange, setPriceRange] = useState<number[]>([0, MAX_PRICE]);
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ── REFS ───────────────────────────────────────────
  const appendModeRef = useRef(false);
  const searchTimerRef = useRef<any>(null);
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

  // ── WATCH URL PARAMS (when navigating from Home) ──
  // Skip the very first render (state already initialised from searchParams above)
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

  // ── DEBOUNCE SEARCH ────────────────────────────────
  useEffect(() => {
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      // React 18 batches both into a single render → single fetch
      setDebouncedSearch(search);
      setPage(1);
      appendModeRef.current = false;
    }, 400);
    return () => clearTimeout(searchTimerRef.current);
  }, [search]);

  // ── MAIN FETCH (single effect, all deps, no stale closure) ──
  useEffect(() => {
    let cancelled = false;
    const isAppend = appendModeRef.current;
    appendModeRef.current = false; // reset after reading

    if (!isAppend) setLoading(true);
    else setLoadingMore(true);

    const params: Record<string, string | number | boolean> = { page, limit: 10 };
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (selectedCats.length > 0) params.category_id = selectedCats.join(",");
    if (priceRange[0] > 0) params.min_price = priceRange[0];
    if (priceRange[1] < MAX_PRICE) params.max_price = priceRange[1];
    if (onlyDiscount) params.only_discount = "1";
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
  }, [page, debouncedSearch, selectedCats, priceRange, onlyDiscount, sortBy]);

  // ── DESKTOP PAGE CHANGE ────────────────────────────
  const handleDesktopPageChange = (_: React.ChangeEvent<unknown>, pg: number) => {
    appendModeRef.current = false;
    setPage(pg);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── MOBILE SCROLL (throttled, uses refs → no stale closure) ──
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

  // ── FILTER HELPERS (each resets page + appendMode) ──
  const toggleCategory = (id: string) => {
    appendModeRef.current = false;
    setPage(1);
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    appendModeRef.current = false;
    setPage(1);
    setSelectedCats([]);
    setSliderValue([0, MAX_PRICE]);
    setPriceRange([0, MAX_PRICE]);
    setOnlyDiscount(false);
    setSearch("");
    setSortBy("default");
  };

  const activeFilterCount =
    selectedCats.length +
    (onlyDiscount ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < MAX_PRICE ? 1 : 0);

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

  const handleWishlist = async (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    if (!isAuthenticated || !user) {
      enqueueSnackbar("Please login to add to wishlist", { variant: "warning" });
      navigate("/login");
      return;
    }
    const inWish = wishlistItems.some((i) => i.product_id === product.id);
    try {
      if (inWish) {
        const item = wishlistItems.find((i) => i.product_id === product.id);
        if (item) await wishlistService.removeFromWishlist(item.id);
      } else {
        await wishlistService.addToWishlist(user.id, product.id);
      }
      dispatch(setWishlistItems(await wishlistService.getWishlist(user.id)));
    } catch {
      enqueueSnackbar("Failed to update wishlist", { variant: "error" });
    }
  };

  /* ─── FILTER PANEL ─────────────────────────────── */
  const FilterPanel = ({ inDrawer = false }: { inDrawer?: boolean }) => (
    <Box
      sx={{
        width: inDrawer ? 300 : "100%",
        height: inDrawer ? "100%" : "auto",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        overflowY: inDrawer ? "auto" : "visible",
      }}
    >
      {/* Panel header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
          p: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: inDrawer ? 0 : "16px 16px 0 0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SlidersHorizontal size={18} color="#fff" />
          <Typography fontWeight={800} fontSize={16} color="#fff">
            Filters
          </Typography>
          {activeFilterCount > 0 && (
            <Box
              sx={{
                background: "#fff",
                color: PINK[600],
                borderRadius: "50%",
                width: 22,
                height: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              {activeFilterCount}
            </Box>
          )}
        </Box>
        {activeFilterCount > 0 && (
          <Box
            onClick={clearFilters}
            sx={{
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              opacity: 0.88,
              "&:hover": { opacity: 1 },
            }}
          >
            Clear All
          </Box>
        )}
      </Box>

      <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Search */}
        <Box>
          <Typography
            fontSize={13}
            fontWeight={700}
            color="#333"
            mb={1.5}
            sx={{ display: "flex", alignItems: "center", gap: 0.8 }}
          >
            <Search size={14} color={PINK[600]} /> Search
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              border: `1.5px solid #eee`,
              borderRadius: 2,
              px: 1.5,
              py: 0.8,
              gap: 1,
              "&:focus-within": { borderColor: PINK[500] },
              transition: "border-color 0.2s",
            }}
          >
            <Search size={14} color="#bbb" />
            <Box
              component="input"
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              placeholder="Search products..."
              sx={{
                border: "none",
                outline: "none",
                flex: 1,
                fontSize: 13,
                background: "transparent",
              }}
            />
            {search && (
              <X
                size={14}
                color="#bbb"
                style={{ cursor: "pointer" }}
                onClick={() => setSearch("")}
              />
            )}
          </Box>
        </Box>

        <Divider sx={{ borderColor: "#f5f5f5" }} />

        {/* Categories */}
        <Box>
          <Typography
            fontSize={13}
            fontWeight={700}
            color="#333"
            mb={1.5}
            sx={{ display: "flex", alignItems: "center", gap: 0.8 }}
          >
            <Tag size={14} color={PINK[600]} /> Categories
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
            {categories.map((cat) => {
              const active = selectedCats.includes(cat.id);
              return (
                <Box
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: "8px 12px",
                    borderRadius: 2,
                    cursor: "pointer",
                    background: active ? PINK[50] : "transparent",
                    border: `1.5px solid ${active ? PINK[500] : "transparent"}`,
                    transition: "all 0.15s",
                    "&:hover": { background: PINK[50] },
                  }}
                >
                  {cat.image ? (
                    <Box
                      component="img"
                      src={cat.image}
                      sx={{ width: 28, height: 28, borderRadius: 1, objectFit: "cover" }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 1,
                        background: active ? PINK[100] : "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Tag size={13} color={active ? PINK[600] : "#bbb"} />
                    </Box>
                  )}
                  <Typography
                    fontSize={13}
                    fontWeight={active ? 700 : 500}
                    color={active ? PINK[600] : "#444"}
                    sx={{ flex: 1 }}
                  >
                    {cat.name}
                  </Typography>
                  {active && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: PINK[500],
                        flexShrink: 0,
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>

        <Divider sx={{ borderColor: "#f5f5f5" }} />

        {/* Price Range */}
        <Box>
          <Typography
            fontSize={13}
            fontWeight={700}
            color="#333"
            mb={2}
            sx={{ display: "flex", alignItems: "center", gap: 0.8 }}
          >
            <span style={{ color: PINK[600], fontWeight: 800 }}>₹</span> Price Range
          </Typography>
          <Box sx={{ px: 1 }}>
            <Slider
              value={sliderValue}
              onChange={(_e, val) => setSliderValue(val as number[])}
              onChangeCommitted={(_e, val) => {
                const v = val as number[];
                setPriceRange(v);
                setPage(1);
                appendModeRef.current = false;
              }}
              min={0}
              max={MAX_PRICE}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `₹${v}`}
              sx={{
                color: PINK[500],
                "& .MuiSlider-thumb": {
                  width: 18,
                  height: 18,
                  "&:hover": { boxShadow: `0 0 0 8px ${PINK[50]}` },
                },
                "& .MuiSlider-track": { height: 4 },
                "& .MuiSlider-rail": { height: 4, opacity: 0.2 },
              }}
            />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Chip
              label={`₹${sliderValue[0]}`}
              size="small"
              sx={{
                fontSize: 12,
                fontWeight: 700,
                background: PINK[50],
                color: PINK[600],
                border: `1px solid ${PINK[100]}`,
              }}
            />
            <Chip
              label={`₹${sliderValue[1]}`}
              size="small"
              sx={{
                fontSize: 12,
                fontWeight: 700,
                background: PINK[50],
                color: PINK[600],
                border: `1px solid ${PINK[100]}`,
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ borderColor: "#f5f5f5" }} />

        {/* Offers */}
        <Box>
          <Typography
            fontSize={13}
            fontWeight={700}
            color="#333"
            mb={1.5}
            sx={{ display: "flex", alignItems: "center", gap: 0.8 }}
          >
            <Sparkles size={14} color={PINK[600]} /> Offers
          </Typography>
          <Box
            onClick={() => { appendModeRef.current = false; setPage(1); setOnlyDiscount((v) => !v); }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: "8px 12px",
              borderRadius: 2,
              cursor: "pointer",
              background: onlyDiscount ? PINK[50] : "transparent",
              border: `1.5px solid ${onlyDiscount ? PINK[500] : "#eee"}`,
              transition: "all 0.15s",
              "&:hover": { background: PINK[50] },
            }}
          >
            <Box
              sx={{
                width: 18,
                height: 18,
                borderRadius: 0.5,
                border: `2px solid ${onlyDiscount ? PINK[500] : "#ccc"}`,
                background: onlyDiscount ? PINK[500] : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.15s",
              }}
            >
              {onlyDiscount && <X size={11} color="#fff" strokeWidth={3} />}
            </Box>
            <Typography
              fontSize={13}
              fontWeight={onlyDiscount ? 700 : 500}
              color={onlyDiscount ? PINK[600] : "#444"}
            >
              Discounted Items Only
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  /* ─── PRODUCT CARD ─────────────────────────────── */
  const ProductCard = ({ product }: { product: any }) => {
    const inWish = wishlistItems.some((i) => i.product_id === product.id);
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

  /* ─── ACTIVE FILTER CHIPS ───────────────────────── */
  const ActiveChips = () => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
      {selectedCats.map((id) => {
        const cat = categories.find((c) => c.id === id);
        return (
          <Chip
            key={id}
            label={cat?.name ?? id}
            size="small"
            onDelete={() => toggleCategory(id)}
            sx={{
              background: PINK[50],
              color: PINK[600],
              fontWeight: 600,
              fontSize: 12,
              border: `1px solid ${PINK[100]}`,
              "& .MuiChip-deleteIcon": { color: PINK[600] },
            }}
          />
        );
      })}
      {onlyDiscount && (
        <Chip
          label="Discounted Only"
          size="small"
          onDelete={() => setOnlyDiscount(false)}
          sx={{
            background: PINK[50],
            color: PINK[600],
            fontWeight: 600,
            fontSize: 12,
            border: `1px solid ${PINK[100]}`,
            "& .MuiChip-deleteIcon": { color: PINK[600] },
          }}
        />
      )}
      {(priceRange[0] > 0 || priceRange[1] < MAX_PRICE) && (
        <Chip
          label={`₹${priceRange[0]} – ₹${priceRange[1]}`}
          size="small"
          onDelete={() => setPriceRange([0, MAX_PRICE])}
          sx={{
            background: PINK[50],
            color: PINK[600],
            fontWeight: 600,
            fontSize: 12,
            border: `1px solid ${PINK[100]}`,
            "& .MuiChip-deleteIcon": { color: PINK[600] },
          }}
        />
      )}
    </Box>
  );

  /* ─── RENDER ────────────────────────────────────── */
  return (
    <Box sx={{ background: "#f7f7fa", minHeight: "100vh" }}>
      {/* Hero Banner */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${PINK[600]} 0%, ${PINK[500]} 60%, #FF80AB 100%)`,
          py: { xs: 3, md: 4 },
          px: { xs: 2, md: 4 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {[
          { size: 220, top: -80, right: -60, opacity: 0.08 },
          { size: 140, top: 20, right: 120, opacity: 0.06 },
          { size: 100, bottom: -40, left: 60, opacity: 0.07 },
        ].map((c, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: c.size,
              height: c.size,
              borderRadius: "50%",
              background: "#fff",
              opacity: c.opacity,
              top: c.top,
              right: c.right,
              bottom: c.bottom,
              left: c.left,
            }}
          />
        ))}
        <Box sx={{ maxWidth: 1400, mx: "auto", position: "relative" }}>
          <Typography
            variant="h4"
            fontWeight={900}
            color="#fff"
            sx={{ letterSpacing: -0.5, mb: 0.5 }}
          >
            {selectedCats.length === 1
              ? categories.find((c) => c.id === selectedCats[0])?.name ?? "Products"
              : "All Products"}
          </Typography>
          <Typography fontSize={14} sx={{ color: "rgba(255,255,255,0.8)" }}>
            {loading
              ? "Loading..."
              : `${pagination.total} product${pagination.total !== 1 ? "s" : ""} found`}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 1.5, sm: 2, md: 3 }, py: 3 }}>
        <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
          {/* ── DESKTOP FILTER SIDEBAR ── */}
          {!isMobile && (
            <Box
              sx={{
                width: 270,
                flexShrink: 0,
                background: "#fff",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                position: "sticky",
                top: 80,
                maxHeight: "calc(100vh - 100px)",
                overflowY: "auto",
                "&::-webkit-scrollbar": { width: 4 },
                "&::-webkit-scrollbar-thumb": { background: PINK[100], borderRadius: 2 },
              }}
            >
              <FilterPanel />
            </Box>
          )}

          {/* ── PRODUCT AREA ── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
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
                flexWrap: "wrap",
                gap: 1.5,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {/* Mobile filter button */}
              {isMobile && (
                <Box
                  onClick={() => setDrawerOpen(true)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    px: 1.5,
                    py: 0.7,
                    borderRadius: 2,
                    border: `1.5px solid ${activeFilterCount > 0 ? PINK[500] : "#e0e0e0"}`,
                    cursor: "pointer",
                    background: activeFilterCount > 0 ? PINK[50] : "transparent",
                    flexShrink: 0,
                  }}
                >
                  <Badge
                    badgeContent={activeFilterCount}
                    color="error"
                    sx={{ "& .MuiBadge-badge": { fontSize: 10, minWidth: 16, height: 16 } }}
                  >
                    <SlidersHorizontal
                      size={15}
                      color={activeFilterCount > 0 ? PINK[600] : "#555"}
                    />
                  </Badge>
                  <Typography
                    fontSize={13}
                    fontWeight={600}
                    color={activeFilterCount > 0 ? PINK[600] : "#555"}
                  >
                    Filters
                  </Typography>
                </Box>
              )}

              <Box sx={{ flex: 1 }}>
                {activeFilterCount > 0 ? (
                  <ActiveChips />
                ) : (
                  <Typography fontSize={13} color="text.secondary">
                    {loading
                      ? "Loading..."
                      : `${pagination.total} product${pagination.total !== 1 ? "s" : ""} found`}
                  </Typography>
                )}
              </Box>

              {/* Sort */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
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
                <Typography fontSize={14} color="text.secondary" mb={2}>
                  Try adjusting your filters or search term
                </Typography>
                <Box
                  onClick={clearFilters}
                  sx={{
                    display: "inline-block",
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Clear Filters
                </Box>
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
      </Box>

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: "0 20px 20px 0", maxWidth: 300 } } }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <FilterPanel inDrawer />
          <Box
            sx={{ p: 2, borderTop: "1px solid #f0f0f0", display: "flex", gap: 1 }}
          >
            <Box
              onClick={clearFilters}
              sx={{
                flex: 1,
                py: 1.2,
                borderRadius: 2,
                border: `1.5px solid ${PINK[500]}`,
                color: PINK[600],
                fontWeight: 700,
                fontSize: 14,
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              Clear
            </Box>
            <Box
              onClick={() => setDrawerOpen(false)}
              sx={{
                flex: 2,
                py: 1.2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              Show {pagination.total} Results
            </Box>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Products;
