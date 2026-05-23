import { useEffect, useState, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  InputBase,
  Badge,
  Chip,
  IconButton,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { Product, Category } from "../types";
import { productService } from "../services/productService";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  ChevronLeft,
  ChevronRight,
  Star,
  Package,
  Shield,
  Truck,
  RefreshCw,
  Zap,
  Tag,
  Grid3X3,
} from "lucide-react";
import { BASE_URL } from "../constant";

/* ─── PINK PALETTE ─────────────────────────────── */
const PINK = {
  600: "#F06292",
  500: "#FCE4EC",
  400: "#F06292",
  300: "#FCE4EC",
  100: "#FFF0F6",
  50: "#FFF0F5",
};

const NAV_H = 64;

/* ─── INLINE STYLES ─────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  /* top-nav */
  topNav: {
    position: "sticky",
    top: 0,
    zIndex: 1200,
    background: `linear-gradient(90deg, ${PINK[600]} 0%, ${PINK[500]} 100%)`,
    height: NAV_H,
    display: "flex",
    alignItems: "center",
    boxShadow: "0 2px 8px rgba(194,24,91,0.35)",
  },
  navInner: {
    width: "100%",
    maxWidth: 1280,
    margin: "0 auto",
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    gap: 24,
  },
  logo: {
    color: "#fff",
    fontFamily: '"Poppins", sans-serif',
    fontWeight: 800,
    fontSize: 26,
    letterSpacing: -0.5,
    lineHeight: 1,
    flexShrink: 0,
    cursor: "pointer",
    userSelect: "none",
  },
  logoTag: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#FFD54F",
    display: "block",
    marginTop: 3,
    fontWeight: 400,
    letterSpacing: 0.3,
  },
  searchWrap: {
    flex: 1,
    maxWidth: 580,
    background: "#fff",
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    height: 40,
  },
  searchInput: {
    flex: 1,
    padding: "0 14px",
    fontSize: 14,
    border: "none",
    outline: "none",
    fontFamily: '"Poppins", sans-serif',
    color: "#333",
  },
  searchBtn: {
    background: PINK[500],
    border: "none",
    height: 40,
    width: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: 24,
    marginLeft: "auto",
    flexShrink: 0,
  },
  navBtn: {
    color: "#fff",
    fontFamily: '"Poppins", sans-serif',
    fontWeight: 600,
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    background: "none",
    border: "none",
    padding: 0,
  },
  /* category strip */
  catStrip: {
    background: "#fff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    overflowX: "auto",
    whiteSpace: "nowrap" as const,
    padding: "10px 0",
    scrollbarWidth: "none" as const,
  },
  catItem: {
    display: "inline-flex",
    flexDirection: "column" as const,
    alignItems: "center",
    padding: "6px 20px",
    cursor: "pointer",
    minWidth: 80,
    transition: "color 0.2s",
  },
  catIcon: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    objectFit: "cover" as const,
    marginBottom: 6,
    border: `2px solid ${PINK[300]}`,
  },
  catLabel: {
    fontSize: 12,
    fontFamily: '"Poppins", sans-serif',
    fontWeight: 600,
    color: "#333",
    textAlign: "center" as const,
  },
  /* hero banner */
  bannerWrap: {
    position: "relative",
    width: "100%",
    height: 340,
    overflow: "hidden",
    background: PINK[100],
  },
  bannerSlide: {
    position: "absolute",
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    transition: "opacity 0.6s ease",
  },
  bannerArrow: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.85)",
    border: "none",
    borderRadius: "50%",
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  bannerDots: {
    position: "absolute",
    bottom: 12,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 6,
  },
  /* section heading */
  sectionHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 20px 14px",
    borderBottom: `1px solid ${PINK[100]}`,
  },
  sectionTitle: {
    fontFamily: '"Poppins", sans-serif',
    fontWeight: 700,
    fontSize: 18,
    color: "#212121",
  },
  viewAll: {
    background: PINK[500],
    color: "#fff",
    border: "none",
    borderRadius: 2,
    padding: "8px 20px",
    fontFamily: '"Poppins", sans-serif',
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },
  /* deal card */
  dealCard: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    padding: "16px 10px 10px",
    cursor: "pointer",
    borderRight: "1px solid #f0f0f0",
    transition: "box-shadow 0.2s",
    minWidth: 160,
  },
  dealImg: {
    width: 120,
    height: 120,
    objectFit: "contain" as const,
    marginBottom: 10,
  },
  dealName: {
    fontSize: 13,
    fontFamily: '"Poppins", sans-serif',
    fontWeight: 600,
    color: "#212121",
    textAlign: "center" as const,
    lineHeight: 1.3,
  },
  dealDiscount: {
    fontSize: 13,
    fontFamily: '"Poppins", sans-serif',
    fontWeight: 700,
    color: "#388E3C",
    marginTop: 4,
  },
  /* trust bar */
  trustBar: {
    display: "flex",
    justifyContent: "center",
    gap: 40,
    flexWrap: "wrap" as const,
    padding: "24px 16px",
    background: "#fff",
    borderTop: `3px solid ${PINK[400]}`,
  },
  trustItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontFamily: '"Poppins", sans-serif',
    fontSize: 13,
    fontWeight: 600,
    color: "#444",
  },
  /* footer */
  footer: {
    background: "#172337",
    color: "#fff",
    padding: "40px 16px 20px",
  },
};

const VIDEO_FOLDER = '/hero/';
const buildSrc = (filename: string) => `${VIDEO_FOLDER}${filename}`;

/* ─── BANNER SLIDES ──────────────────────────────── */
const BANNERS = [
  {
    bg: `linear-gradient(120deg, ${PINK[600]} 0%, ${PINK[300]} 100%)`,
    label: "Big Pink Sale",
    sub: "Up to 80% off on handcrafted resin art",
    cta: "Shop Now",
    img: "r-3.jpg",
  },
  {
    bg: `linear-gradient(120deg, #880E4F 0%, ${PINK[500]} 100%)`,
    label: "New Arrivals",
    sub: "Explore the freshest resin collections",
    cta: "Discover",
    img: "r-4.jpg",
  },
  {
    bg: `linear-gradient(120deg, ${PINK[400]} 0%, #FFB3C6 100%)`,
    label: "Gift Sets",
    sub: "Beautiful handmade pieces for every occasion",
    cta: "Gift Now",
    img: "r-1.jpg",
  },
];

const CAT_ICONS = [
  {
    label: "Jewellery",
    img: "https://images.pexels.com/photos/1458329/pexels-photo-1458329.jpeg?auto=compress&w=80",
  },
  {
    label: "Home Decor",
    img: "https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg?auto=compress&w=80",
  },
  {
    label: "Coasters",
    img: "https://images.pexels.com/photos/5591663/pexels-photo-5591663.jpeg?auto=compress&w=80",
  },
  {
    label: "Keychains",
    img: "https://images.pexels.com/photos/1070534/pexels-photo-1070534.jpeg?auto=compress&w=80",
  },
  {
    label: "Wall Art",
    img: "https://images.pexels.com/photos/3094799/pexels-photo-3094799.jpeg?auto=compress&w=80",
  },
  {
    label: "Trays",
    img: "https://images.pexels.com/photos/1148957/pexels-photo-1148957.jpeg?auto=compress&w=80",
  },
  {
    label: "Clocks",
    img: "https://images.pexels.com/photos/280250/pexels-photo-280250.jpeg?auto=compress&w=80",
  },
  {
    label: "Gift Boxes",
    img: "https://images.pexels.com/photos/1793035/pexels-photo-1793035.jpeg?auto=compress&w=80",
  },
];

// const deals = [
//   {
//     name: "Resin Coaster Set",
//     discount: "70% off",
//     price: "299",
//     originalPrice: "999",
//     boughtCount: "400+",
//     img: "https://images.pexels.com/photos/5591663/pexels-photo-5591663.jpeg?auto=compress&w=300",
//   },
//   {
//     name: "Ocean Wave Resin Art",
//     discount: "65% off",
//     price: "699",
//     originalPrice: "1,999",
//     boughtCount: "1K+",
//     img: "https://images.pexels.com/photos/3094799/pexels-photo-3094799.jpeg?auto=compress&w=300",
//   },
//   {
//     name: "Floral Keychain",
//     discount: "55% off",
//     price: "185",
//     originalPrice: "499",
//     boughtCount: "700+",
//     img: "https://images.pexels.com/photos/1070534/pexels-photo-1070534.jpeg?auto=compress&w=300",
//   },
//   {
//     name: "Geode Resin Tray",
//     discount: "60% off",
//     price: "900",
//     originalPrice: "2,249",
//     boughtCount: "700+",
//     img: "https://images.pexels.com/photos/1148957/pexels-photo-1148957.jpeg?auto=compress&w=300",
//   },
//   {
//     name: "Galaxy Resin Clock",
//     discount: "50% off",
//     price: "584",
//     originalPrice: "1,168",
//     boughtCount: "100+",
//     img: "https://images.pexels.com/photos/280250/pexels-photo-280250.jpeg?auto=compress&w=300",
//   },
//   {
//     name: "Pearl Drop Earrings",
//     discount: "45% off",
//     price: "854",
//     originalPrice: "1,553",
//     boughtCount: "200+",
//     img: "https://images.pexels.com/photos/1458329/pexels-photo-1458329.jpeg?auto=compress&w=300",
//   },
//   {
//     name: "Resin Coaster Set",
//     discount: "70% off",
//     price: "299",
//     originalPrice: "999",
//     boughtCount: "400+",
//     img: "https://images.pexels.com/photos/5591663/pexels-photo-5591663.jpeg?auto=compress&w=300",
//   },
//   {
//     name: "Ocean Wave Resin Art",
//     discount: "65% off",
//     price: "699",
//     originalPrice: "1,999",
//     boughtCount: "1K+",
//     img: "https://images.pexels.com/photos/3094799/pexels-photo-3094799.jpeg?auto=compress&w=300",
//   },
//   {
//     name: "Floral Keychain",
//     discount: "55% off",
//     price: "185",
//     originalPrice: "499",
//     boughtCount: "700+",
//     img: "https://images.pexels.com/photos/1070534/pexels-photo-1070534.jpeg?auto=compress&w=300",
//   },
//   {
//     name: "Geode Resin Tray",
//     discount: "60% off",
//     price: "900",
//     originalPrice: "2,249",
//     boughtCount: "700+",
//     img: "https://images.pexels.com/photos/1148957/pexels-photo-1148957.jpeg?auto=compress&w=300",
//   },
//   {
//     name: "Galaxy Resin Clock",
//     discount: "50% off",
//     price: "584",
//     originalPrice: "1,168",
//     boughtCount: "100+",
//     img: "https://images.pexels.com/photos/280250/pexels-photo-280250.jpeg?auto=compress&w=300",
//   },
//   {
//     name: "Pearl Drop Earrings",
//     discount: "45% off",
//     price: "854",
//     originalPrice: "1,553",
//     boughtCount: "200+",
//     img: "https://images.pexels.com/photos/1458329/pexels-photo-1458329.jpeg?auto=compress&w=300",
//   },
// ];

const TESTIMONIALS = [
  {
    name: "Sarah Johnson",
    avatar: "https://i.pravatar.cc/150?img=1",
    rating: 5,
    comment:
      "Absolutely stunning pieces! The quality is exceptional and shipping was fast.",
  },
  {
    name: "Michael Chen",
    avatar: "https://i.pravatar.cc/150?img=2",
    rating: 5,
    comment: "These resin products are works of art. Perfect for gifts!",
  },
  {
    name: "Emma Williams",
    avatar: "https://i.pravatar.cc/150?img=3",
    rating: 5,
    comment:
      "I love the attention to detail. Every piece is unique and beautiful.",
  },
];

const FALLBACK_PRODUCTS = [
  {
    name: "Resin Coaster Set of 4",
    img: "https://images.pexels.com/photos/5591663/pexels-photo-5591663.jpeg?auto=compress&w=300",
    price: "299",
    original_price: "999",
    discount_percent: 70,
    rating: 4.2,
    review_count: 328,
    badge: null,
  },
  {
    name: "Pearl Drop Resin Earrings",
    img: "https://images.pexels.com/photos/1458329/pexels-photo-1458329.jpeg?auto=compress&w=300",
    price: "854",
    original_price: "1,499",
    discount_percent: 43,
    rating: 4.8,
    review_count: 512,
    badge: "Best Seller",
    is_sponsored: true,
  },
  {
    name: "Ocean Wave Resin Wall Art",
    img: "https://images.pexels.com/photos/3094799/pexels-photo-3094799.jpeg?auto=compress&w=300",
    price: "1,299",
    original_price: "2,499",
    discount_percent: 48,
    rating: 4.5,
    review_count: 189,
    badge: null,
  },
  {
    name: "Geode Resin Serving Tray",
    img: "https://images.pexels.com/photos/1148957/pexels-photo-1148957.jpeg?auto=compress&w=300",
    price: "900",
    original_price: "2,249",
    discount_percent: 60,
    rating: 4.3,
    review_count: 94,
    badge: "New",
    is_sponsored: true,
  },
  {
    name: "Galaxy Resin Wall Clock",
    img: "https://images.pexels.com/photos/280250/pexels-photo-280250.jpeg?auto=compress&w=300",
    price: "584",
    original_price: "1,168",
    discount_percent: 50,
    rating: 4.7,
    review_count: 276,
    badge: null,
  },
  {
    name: "Floral Pressed Resin Keychain",
    img: "https://images.pexels.com/photos/1070534/pexels-photo-1070534.jpeg?auto=compress&w=300",
    price: "185",
    original_price: "499",
    discount_percent: 63,
    rating: 4.4,
    review_count: 441,
    badge: "Best Seller",
    is_sponsored: true,
  },
];

/* ─── COMPONENT ──────────────────────────────────── */
export const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [deals, setDeals] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([]);
  const [slide, setSlide] = useState(0);
  const [cartCount] = useState(2);

  const loadData = async () => {
    try {
      const [products, cats] = await Promise.all([
        productService.getProducts(),
        productService.getCategories(),
      ]);
      // console.log(products, cats)
      setDeals(products);
      setFeaturedProducts(products.filter((p) => p.is_featured).slice(0, 8));
      setCategories(cats);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  console.log("products", featuredProducts)
  console.log("cats", categories)

  const prevSlide = () =>
    setSlide((s) => (s - 1 + BANNERS.length) % BANNERS.length);
  const nextSlide = () => setSlide((s) => (s + 1) % BANNERS.length);

  useEffect(() => {
    loadData()
  }, [])

  return (
    <Box
      sx={{
        background: "#f1f3f6",
        minHeight: "100vh",
        fontFamily: '"Poppins", sans-serif',
      }}
    >
      {/* ── CATEGORY STRIP ───────────────────────── */}
      <div style={styles.catStrip}>
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 16px",
            display: "flex",
            gap: 4,
          }}
        >
          {categories?.length > 0 && categories.map((c) => ({ label: c.name, img: c.image }))
            .map((c, i) => (
              <div
                key={i}
                style={styles.catItem}
                onClick={() => navigate(`/products?category=${i + 1}`)}
                onMouseEnter={(e) => (e.currentTarget.style.color = PINK[500])}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
              >
                <img src={c.img} alt={c.label} style={styles.catIcon} />
                <span style={styles.catLabel}>{c.label}</span>
              </div>
            ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────── */}
      <Box
        sx={{
          maxWidth: 1280,
          mx: "auto",
          px: { xs: 1, md: 2 },
          py: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* ── HERO BANNER ──────────────────────── */}
        <Box
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            position: "relative",
            height: { xs: 200, sm: 280, md: 340 },
          }}
        >
          {BANNERS.map((b, i) => (
            <Box
              key={i}
              sx={{
                position: "absolute",
                inset: 0,
                background: b.bg,
                opacity: i === slide ? 1 : 0,
                transition: "opacity 0.6s ease",
                display: "flex",
                alignItems: "center",
                px: { xs: 3, md: 6 },
                gap: 4,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 800,
                    fontSize: { xs: "1.6rem", md: "2.6rem" },
                    color: "#fff",
                    lineHeight: 1.15,
                    mb: 1,
                  }}
                >
                  {b.label}
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.85)",
                    fontSize: { xs: 13, md: 16 },
                    mb: 3,
                  }}
                >
                  {b.sub}
                </Typography>
                <button
                  style={{
                    background: "#fff",
                    color: PINK[600],
                    border: "none",
                    borderRadius: 3,
                    padding: "10px 28px",
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                  }}
                  onClick={() => navigate("/products")}
                >
                  {b.cta} →
                </button>
              </Box>
              <Box
                component="img"
                src={buildSrc(b.img)}
                alt={b.label}
                sx={{
                  width: { xs: 120, sm: 200, md: 280 },
                  height: { xs: 120, sm: 200, md: 280 },
                  objectFit: "cover",
                  borderRadius: 3,
                  flexShrink: 0,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                }}
              />
            </Box>
          ))}

          {/* Arrows */}
          <button
            style={{ ...styles.bannerArrow, left: 12 }}
            onClick={prevSlide}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            style={{ ...styles.bannerArrow, right: 12 }}
            onClick={nextSlide}
          >
            <ChevronRight size={18} />
          </button>

          {/* Dots */}
          <div style={styles.bannerDots}>
            {BANNERS.map((_, i) => (
              <Box
                key={i}
                onClick={() => setSlide(i)}
                sx={{
                  width: i === slide ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === slide ? "#fff" : "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
              />
            ))}
          </div>
        </Box>

        {/* ── DEALS OF THE DAY ─────────────────── */}
        <Box
          sx={{
            background: "#fff",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          {/* Header - same as before */}
          <div style={styles.sectionHead}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Tag size={20} color={PINK[500]} />
              <span style={styles.sectionTitle}>Deal of the Day</span>
              {/* <Chip
                label="Ends in 08:24:15"
                size="small"
                sx={{
                  background: PINK[100],
                  color: PINK[600],
                  fontWeight: 700,
                  fontSize: 11,
                }}
              /> */}
            </div>
            <button
              style={styles.viewAll}
              onClick={() => navigate("/products/")}
            >
              VIEW ALL
            </button>
          </div>

          {/* Deal Cards */}
          <Box
            sx={{
              display: "flex",
              overflowX: "auto",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {deals.map((d, i) => (
              <Box
                key={i}
                onClick={() => navigate(`/products/${d?.id}`)}
                sx={{
                  minWidth: 180,
                  maxWidth: 180,
                  flexShrink: 0,
                  padding: "14px 10px",
                  borderRight:
                    i < deals.length - 1 ? "1px solid #f5f5f5" : "none",
                  cursor: "pointer",
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: `inset 0 -3px 0 ${PINK[400]}` },
                }}
              >
                {/* Image - fixed equal size */}
                <Box
                  sx={{
                    width: "100%",
                    height: 160,
                    borderRadius: "6px",
                    overflow: "hidden",
                    background: "#fafafa",
                    mb: 1.2,
                  }}
                >
                  <Box
                    component="img"
                    src={`${BASE_URL}${d.images[0]}`}
                    alt={d.name}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>

                {/* Badges row */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mb: 0.8,
                    flexWrap: "wrap",
                  }}
                >
                  <Box
                    sx={{
                      background: "#C0392B",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      px: "7px",
                      py: "2px",
                      borderRadius: "3px",
                      fontFamily: '"Poppins", sans-serif',
                    }}
                  >
                    {d.discount}
                  </Box>
                  <Box
                    sx={{
                      background: "#f5f5f5",
                      color: "#555",
                      fontSize: 10,
                      fontWeight: 600,
                      px: "7px",
                      py: "2px",
                      borderRadius: "3px",
                      fontFamily: '"Poppins", sans-serif',
                    }}
                  >
                    Limited time deal
                  </Box>
                </Box>

                {/* Product name */}
                <Typography
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 600,
                    fontSize: 13,
                    color: "#212121",
                    lineHeight: 1.35,
                    height: 36,
                    overflow: "hidden",
                    mb: 0.8,
                  }}
                >
                  {d.name}
                </Typography>

                {/* Prices */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 0.8,
                    mb: 0.4,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#0F1111",
                      fontFamily: '"Poppins", sans-serif',
                    }}
                  >
                    ₹{d.price}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#888",
                      textDecoration: "line-through",
                      fontFamily: '"Poppins", sans-serif',
                    }}
                  >
                    ₹{d.originalPrice}
                  </Typography>
                </Box>

                {/* Bought count */}
                <Typography
                  sx={{
                    fontSize: 10,
                    color: "#555",
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  {d.boughtCount} bought in past month
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── FEATURED PRODUCTS ────────────────── */}
        <Box
          sx={{
            background: "#fff",
            borderRadius: 2,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <div style={styles.sectionHead}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Zap size={20} color={PINK[500]} />
              <span style={styles.sectionTitle}>Featured Products</span>
            </div>
            <button
              style={styles.viewAll}
              onClick={() => navigate("/products")}
            >
              VIEW ALL
            </button>
          </div>

          <Box
            sx={{
              display: "flex",
              overflowX: "auto",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {featuredProducts.length > 0 && featuredProducts
              .map((product: any, i: number) => {
                // ✅ FIX: Proper image handling
                const BASE_URL = import.meta.env.VITE_APP_BASE_URL || "";
                const imageSrc = `${BASE_URL}${product.images[0]}`;
                return (
                  <Box
                    key={i}
                    onClick={() =>
                      navigate(
                        product?.id ? `/products/${product.id}` : "/products",
                      )
                    }
                    sx={{
                      minWidth: 190,
                      maxWidth: 190,
                      flexShrink: 0,
                      padding: "12px 10px 14px",
                      borderRight:
                        i <
                          (featuredProducts.length || FALLBACK_PRODUCTS.length) - 1
                          ? "1px solid #f5f5f5"
                          : "none",
                      cursor: "pointer",
                      position: "relative",
                      transition: "box-shadow 0.2s",
                      "&:hover": { boxShadow: `inset 0 -3px 0 ${PINK[400]}` },
                    }}
                  >
                    {/* Badge */}
                    {product?.badge && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 16,
                          left: 10,
                          zIndex: 2,
                          background:
                            product.badge === "New" ? PINK[500] : "#C0392B",
                          color: "#fff",
                          fontSize: 9,
                          fontWeight: 700,
                          px: "6px",
                          py: "2px",
                          borderRadius: "3px",
                        }}
                      >
                        {product.badge}
                      </Box>
                    )}

                    {/* Wishlist */}
                    <Box
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 10,
                        zIndex: 2,
                        background: "rgba(255,255,255,0.9)",
                        borderRadius: "50%",
                        width: 28,
                        height: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                        cursor: "pointer",
                        fontSize: 15,
                        color: PINK[400],
                        "&:hover": { color: PINK[600] },
                      }}
                    >
                      ♡
                    </Box>

                    {/* ✅ Image FIXED */}
                    <Box
                      sx={{
                        width: "100%",
                        height: 170,
                        borderRadius: "6px",
                        overflow: "hidden",
                        background: "#fafafa",
                        mb: 1.2,
                      }}
                    >
                      <Box
                        component="img"
                        src={imageSrc}
                        alt={product?.name || "product"}
                        onError={(e: any) => {
                          // e.target.src = "https://via.placeholder.com/200"; // fallback if broken
                        }}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>

                    {/* बाकी same */}
                    <Typography sx={{ fontSize: 9, color: "#888", mb: 0.4 }}>
                      {product?.is_sponsored ? "Sponsored" : ""}
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: "#0F1111",
                        height: 36,
                        overflow: "hidden",
                        mb: 0.8,
                      }}
                    >
                      {product?.name}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 0.8,
                      }}
                    >
                      <Box sx={{ color: PINK[500], fontSize: 12 }}>
                        {"★".repeat(Math.round(product?.rating || 4))}
                        {"☆".repeat(5 - Math.round(product?.rating || 4))}
                      </Box>
                      <Typography sx={{ fontSize: 11 }}>
                        {product?.rating || "4.2"}
                      </Typography>
                      <Typography sx={{ fontSize: 10 }}>
                        ({product?.review_count || "0"})
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 0.8, mb: 0.4 }}>
                      <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
                        ₹{product?.price || product?.sale_price}
                      </Typography>

                      {product?.original_price && (
                        <Typography
                          sx={{ fontSize: 11, textDecoration: "line-through" }}
                        >
                          ₹{product.original_price}
                        </Typography>
                      )}
                    </Box>

                    <Typography sx={{ fontSize: 10 }}>
                      FREE Delivery <strong>Tomorrow</strong>
                    </Typography>
                  </Box>
                );
              })}
          </Box>
        </Box>

        {/* ── TESTIMONIALS ─────────────────────── */}
        <Box
          sx={{
            background: "#fff",
            borderRadius: 2,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <div style={styles.sectionHead}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Star size={20} color={PINK[500]} fill={PINK[500]} />
              <span style={styles.sectionTitle}>Customer Reviews</span>
            </div>
          </div>
          <Grid container spacing={2} sx={{ p: 2 }}>
            {TESTIMONIALS.map((t, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Box
                  sx={{
                    border: `1px solid ${PINK[100]}`,
                    borderRadius: 2,
                    p: 2.5,
                    "&:hover": {
                      borderColor: PINK[300],
                      boxShadow: `0 4px 16px ${PINK[100]}`,
                    },
                    transition: "all 0.2s",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 1.5,
                    }}
                  >
                    <Avatar
                      src={t.avatar}
                      sx={{
                        width: 48,
                        height: 48,
                        border: `2px solid ${PINK[300]}`,
                      }}
                    />
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: '"Poppins", sans-serif',
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {t.name}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.3 }}>
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <Star
                            key={j}
                            size={13}
                            fill="#FFD700"
                            color="#FFD700"
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: 13,
                      color: "#555",
                      fontStyle: "italic",
                      lineHeight: 1.6,
                    }}
                  >
                    "{t.comment}"
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* ── TRUST BAR ────────────────────────────── */}
      {/* <div style={styles.trustBar}>
        {[
          {
            icon: <Truck size={22} color={PINK[500]} />,
            label: "Free Delivery",
            sub: "On orders above ₹499",
          },
          {
            icon: <RefreshCw size={22} color={PINK[500]} />,
            label: "10-Day Returns",
            sub: "Easy return policy",
          },
          {
            icon: <Shield size={22} color={PINK[500]} />,
            label: "100% Authentic",
            sub: "Handcrafted guarantee",
          },
          {
            icon: <Package size={22} color={PINK[500]} />,
            label: "Secure Packaging",
            sub: "Safe delivery assured",
          },
        ].map((item, i) => (
          <div key={i} style={styles.trustItem}>
            {item.icon}
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{item.label}</div>
              <div style={{ fontWeight: 400, fontSize: 11, color: "#888" }}>
                {item.sub}
              </div>
            </div>
          </div>
        ))}
      </div> */}

      {/* ── FOOTER ───────────────────────────────── */}
      {/* <div style={styles.footer}>
        <Box
          sx={{
            maxWidth: 1280,
            mx: "auto",
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            mb: 4,
          }}
        >
          {[
            {
              heading: "ABOUT",
              links: ["About Us", "Careers", "Press", "Corporate Info"],
            },
            {
              heading: "HELP",
              links: ["Payments", "Shipping", "Cancellation & Returns", "FAQ"],
            },
            {
              heading: "POLICY",
              links: ["Return Policy", "Terms of Use", "Privacy", "Sitemap"],
            },
            {
              heading: "SOCIAL",
              links: ["Facebook", "Instagram", "Pinterest", "YouTube"],
            },
          ].map((col, i) => (
            <Box key={i} sx={{ flex: "1 1 160px" }}>
              <Typography
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 700,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.5)",
                  mb: 1.5,
                  letterSpacing: 1,
                }}
              >
                {col.heading}
              </Typography>
              {col.links.map((l) => (
                <Typography
                  key={l}
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: 13,
                    color: "rgba(255,255,255,0.75)",
                    mb: 0.75,
                    cursor: "pointer",
                    "&:hover": { color: PINK[300] },
                    transition: "color 0.2s",
                  }}
                >
                  {l}
                </Typography>
              ))}
            </Box>
          ))}
          <Box sx={{ flex: "1 1 200px" }}>
            <Typography
              sx={{
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 700,
                fontSize: 12,
                color: "rgba(255,255,255,0.5)",
                mb: 1.5,
                letterSpacing: 1,
              }}
            >
              GET THE APP
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {["App Store", "Google Play"].map((s) => (
                <Box
                  key={s}
                  sx={{
                    border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 1,
                    px: 1.5,
                    py: 0.75,
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: 12,
                    color: "#fff",
                    cursor: "pointer",
                    "&:hover": { borderColor: PINK[300] },
                    transition: "border-color 0.2s",
                  }}
                >
                  {s}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            pt: 2,
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: '"Poppins", sans-serif',
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
            }}
          >
            © 2025 ResinArt. All rights reserved. Made with ♥ in India.
          </Typography>
        </Box>
      </div> */}
    </Box>
  );
};
