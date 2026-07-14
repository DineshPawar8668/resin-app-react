import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Box, Typography, Grid, Avatar, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Product, Category } from "../types";
import { productService } from "../services/productService";
import { Star, Truck, RefreshCw, Shield, Package, Heart, Sparkles, Crown } from "lucide-react";
import { BASE_URL } from "../constant";
import { orderReviewService, OrderReview } from "../services/orderReviewService";

/* ─── LUXURY PALETTE ─────────────────────────────── */
const L = {
  dark: "#1A0A12",
  rose: "#C2185B",
  roseLight: "#FCE4EC",
  gold: "#C9A84C",
  goldLight: "rgba(201,168,76,0.15)",
  cream: "#FFF8F2",
  warm: "#F5EDE5",
  white: "#FFFFFF",
  text: "#1A0A12",
  muted: "#7A6B65",
};

const FALLBACK_BANNERS = [
  { img: "/hero/r-3.jpg", tag: "New Collection", title: "Welcome to\nLuxury Collection", sub: "Where elegance, craftsmanship & timeless beauty define every exquisite piece you discover." },
  { img: "/hero/r-4.jpg", tag: "Trending Now", title: "Explore\nNew Arrivals", sub: "Discover freshly crafted resin pieces made with love, just for you." },
  { img: "/hero/r-1.jpg", tag: "Perfect Gifts", title: "Gift Boxes\n& Sets", sub: "Beautiful handmade resin sets for every occasion that deserves to be remembered." },
];

const BANNER_TAGS = ["New Collection", "Trending Now", "Perfect Gifts", "Editor's Pick", "Bestseller", "Exclusive"];
const BANNER_SUBS = [
  "Where elegance, craftsmanship & timeless beauty define every exquisite piece you discover.",
  "Discover freshly crafted resin pieces made with love, just for you.",
  "Beautiful handmade resin sets for every occasion that deserves to be remembered.",
  "Each piece is a masterpiece — crafted by hand, designed to last a lifetime.",
  "Premium quality resin art delivered right to your doorstep.",
  "Unique designs, vibrant colors, and impeccable craftsmanship await you.",
];

export const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [deals, setDeals] = useState<Product[]>([]);
  const [bestDeals, setBestDeals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [slide, setSlide] = useState(0);
  const [reviews, setReviews] = useState<OrderReview[]>([]);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [products, cats, fetchedReviews] = await Promise.all([
          productService.getProducts(),
          productService.getCategories(),
          orderReviewService.getAll(6),
        ]);
        // one product per unique category, max 4
        const seenCats = new Set<string>();
        const popularByCat: Product[] = [];
        for (const p of products) {
          if (p.category_id && !seenCats.has(p.category_id)) {
            seenCats.add(p.category_id);
            popularByCat.push(p);
          }
          if (popularByCat.length === 4) break;
        }
        setCategories(cats);
        setDeals(popularByCat.length === 4 ? popularByCat : products.slice(0, 4));
        setBestDeals(products.filter((p) => p.discount_price).slice(0, 8));
        setFeaturedProducts(products.filter((p) => p.is_featured).slice(0, 8));
        setReviews(fetchedReviews);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const banners = categories.length > 0
    ? categories.slice(8,14).map((cat, i) => ({
      img: cat.image || cat.image_url || FALLBACK_BANNERS[i % FALLBACK_BANNERS.length].img,
      tag: BANNER_TAGS[i % BANNER_TAGS.length],
      title: cat.name,
      sub: BANNER_SUBS[i % BANNER_SUBS.length],
    }))
    : FALLBACK_BANNERS;

  /* auto-slide banner */
  useEffect(() => {
    if (isDragging) return;
    const len = banners.length;
    const t = setInterval(() => setSlide((s) => (s + 1) % len), 4500);
    return () => clearInterval(t);
  }, [banners.length, isDragging]);

  /* swipe / drag handlers */
  const SWIPE_THRESHOLD = 50;
  const handleHeroPointerDown = (e: React.PointerEvent) => {
    dragStartXRef.current = e.clientX;
    setIsDragging(true);
  };
  const handleHeroPointerMove = (e: React.PointerEvent) => {
    if (dragStartXRef.current === null) return;
    setDragX(e.clientX - dragStartXRef.current);
  };
  const handleHeroPointerEnd = () => {
    if (dragStartXRef.current === null) return;
    if (dragX <= -SWIPE_THRESHOLD) {
      setSlide((s) => (s + 1) % banners.length);
    } else if (dragX >= SWIPE_THRESHOLD) {
      setSlide((s) => (s - 1 + banners.length) % banners.length);
    }
    dragStartXRef.current = null;
    setIsDragging(false);
    setDragX(0);
  };

  return (
    <>
      <Helmet>
        <title>ShopIzara – Buy Handmade Resin Art Online India | Jewelry, Home Decor & Gifts</title>
        <meta name="description" content="Shop premium handmade resin art online in India. Buy unique resin jewelry, coasters, photo frames, home decor & gifts. 100% handcrafted. Free delivery above ₹499. Best resin products at ShopIzara." />
        <meta name="keywords" content="resin art online india, handmade resin jewelry buy online, resin home decor india, resin coasters online, resin photo frames india, buy resin products, custom resin art india, resin gifts india, handcrafted resin art, resin jewelry online shopping" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://shopizara.com/" />
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shopizara.com/" />
        <meta property="og:site_name" content="ShopIzara" />
        <meta property="og:title" content="ShopIzara – Buy Handmade Resin Art Online India" />
        <meta property="og:description" content="Shop premium handmade resin art in India. Resin jewelry, coasters, photo frames, home decor & gifts. Free delivery above ₹499." />
        <meta property="og:image" content="https://shopizara.com/hero/r-3.jpg" />
        <meta property="og:image:alt" content="ShopIzara Handmade Resin Art Collection" />
        <meta property="og:locale" content="en_IN" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ShopIzara – Buy Handmade Resin Art Online India" />
        <meta name="twitter:description" content="Shop premium handmade resin art in India. Resin jewelry, coasters, frames & home decor." />
        <meta name="twitter:image" content="https://shopizara.com/hero/r-3.jpg" />
        {/* JSON-LD: WebSite */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "ShopIzara",
            "url": "https://shopizara.com",
            "description": "Premium handmade resin art products – jewelry, coasters, frames, home decor and gifts. Crafted with love in India.",
            "inLanguage": "en-IN",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://shopizara.com/products?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }
        `}</script>
        {/* JSON-LD: Organization */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "ShopIzara",
            "url": "https://shopizara.com",
            "logo": "https://shopizara.com/hero/r-3.jpg",
            "description": "ShopIzara is an online store specializing in premium handmade resin art products including jewelry, coasters, photo frames and home decor items.",
            "foundingLocation": "India",
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "url": "https://shopizara.com/contact",
              "availableLanguage": ["Hindi", "English"]
            },
            "sameAs": []
          }
        `}</script>
        {/* JSON-LD: Store */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "OnlineStore",
            "name": "ShopIzara",
            "url": "https://shopizara.com",
            "description": "Buy handmade resin art online in India. Premium quality resin jewelry, coasters, photo frames, home decor and gifts.",
            "image": "https://shopizara.com/hero/r-3.jpg",
            "priceRange": "₹₹",
            "currenciesAccepted": "INR",
            "paymentAccepted": "Credit Card, Debit Card, UPI, Net Banking",
            "areaServed": "IN",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Handmade Resin Art Products",
              "itemListElement": [
                { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Resin Jewelry" } },
                { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Resin Coasters" } },
                { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Resin Photo Frames" } },
                { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Resin Home Decor" } },
                { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Resin Gift Sets" } }
              ]
            }
          }
        `}</script>
      </Helmet>

      <Box sx={{ background: L.cream, minHeight: "100vh", fontFamily: '"Poppins", sans-serif' }}>

        {/* ── HERO BANNER ──────────────────────────── */}
        <Box
          sx={{ position: "relative", height: { xs: "72vh", md: "85vh" }, overflow: "hidden" }}
          onPointerDown={handleHeroPointerDown}
          onPointerMove={handleHeroPointerMove}
          onPointerUp={handleHeroPointerEnd}
          onPointerCancel={handleHeroPointerEnd}
          onPointerLeave={() => isDragging && handleHeroPointerEnd()}
        >
          <Box
            sx={{
              position: "absolute", inset: 0,
              display: "flex", width: "100%", height: "100%",
              touchAction: "pan-y",
              cursor: isDragging ? "grabbing" : "grab",
              transform: `translateX(calc(-${slide * 100}% + ${dragX}px))`,
              transition: isDragging ? "none" : "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            {banners.map((b, i) => (
              <Box
                key={i}
                sx={{
                  flex: "0 0 100%",
                  height: "100%",
                  backgroundImage: `url(${b.img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            ))}
          </Box>

          {/* overlay */}
          <Box sx={{
            position: "absolute", inset: 0,
            background: "linear-gradient(120deg, rgba(26,10,18,0.82) 0%, rgba(194,24,91,0.22) 100%)",
          }} />

          {/* content */}
          <Box sx={{
            position: "relative", zIndex: 2,
            height: "100%", display: "flex", alignItems: "center",
            px: { xs: 3, sm: 6, md: 10 },
            pointerEvents: "none",
          }}>
            <Box
              key={slide}
              sx={{
                maxWidth: 580,
                pointerEvents: "auto",
                animation: "heroFadeUp 0.7s ease",
                "@keyframes heroFadeUp": {
                  "0%": { opacity: 0, transform: "translateY(28px)" },
                  "100%": { opacity: 1, transform: "translateY(0)" },
                },
              }}
            >
              <Box sx={{
                display: "inline-flex", alignItems: "center", gap: 1,
                background: L.goldLight,
                border: `1px solid rgba(201,168,76,0.45)`,
                borderRadius: 999, px: 2, py: 0.6, mb: 2.5,
              }}>
                <Crown size={13} color={L.gold} />
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: L.gold, letterSpacing: 1.2, textTransform: "uppercase" }}>
                  {banners[slide].tag}
                </Typography>
              </Box>

              <Typography sx={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontWeight: 700, fontSize: { xs: 32, sm: 44, md: 54 },
                color: "#fff", lineHeight: 1.18, mb: 2,
                whiteSpace: "pre-line",
              }}>
                {banners[slide].title}
              </Typography>

              <Typography sx={{
                color: "rgba(255,255,255,0.82)", fontSize: { xs: 13, md: 15 },
                lineHeight: 1.75, mb: 4, maxWidth: 440,
              }}>
                {banners[slide].sub}
              </Typography>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Box
                  component="button"
                  onClick={() => navigate("/products")}
                  sx={{
                    background: L.rose, color: "#fff", border: "none",
                    borderRadius: 2, px: { xs: 3, md: 4 }, py: 1.4,
                    fontSize: 14, fontWeight: 700, fontFamily: '"Poppins", sans-serif',
                    cursor: "pointer", letterSpacing: 0.5,
                    boxShadow: `0 6px 24px rgba(194,24,91,0.4)`,
                    transition: "transform 0.15s, box-shadow 0.15s",
                    "&:hover": { transform: "translateY(-2px)", boxShadow: `0 10px 28px rgba(194,24,91,0.5)` },
                  }}
                >
                  Shop Now
                </Box>
                <Box
                  component="button"
                  onClick={() => navigate("/categories")}
                  sx={{
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(8px)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.4)",
                    borderRadius: 2, px: { xs: 3, md: 4 }, py: 1.4,
                    fontSize: 14, fontWeight: 600, fontFamily: '"Poppins", sans-serif',
                    cursor: "pointer",
                    transition: "background 0.2s",
                    "&:hover": { background: "rgba(255,255,255,0.2)" },
                  }}
                >
                  View Collections
                </Box>
              </Box>
            </Box>
          </Box>

          {/* dots */}
          <Box sx={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 1, zIndex: 3 }}>
            {banners.map((_, i) => (
              <Box
                key={i}
                component="button"
                onClick={() => setSlide(i)}
                sx={{
                  width: i === slide ? 24 : 8, height: 8,
                  borderRadius: 99, border: "none",
                  background: i === slide ? L.rose : "rgba(255,255,255,0.45)",
                  cursor: "pointer",
                  transition: "width 0.3s, background 0.3s",
                  padding: 0,
                }}
              />
            ))}
          </Box>
        </Box>


        {/* ── CATEGORIES ───────────────────────────── */}
        {categories.length > 0 && (
          <Box sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, md: 4 } }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              {/* <Typography sx={{ fontSize: 11, fontWeight: 700, color: L.rose, letterSpacing: 2, textTransform: "uppercase", mb: 0.8 }}>
                Browse By
              </Typography> */}
              <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: { xs: 24, md: 30 }, fontWeight: 700, color: L.dark }}>
                Collections
              </Typography>
            </Box>
            <Box sx={{
              display: "flex", gap: { xs: 1.5, md: 3 },
              overflowX: "auto", pb: 1,
              scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" },
              px: { xs: 1, md: 2 },
            }}>
              {categories.map((cat) => (
                <Box key={cat.id} onClick={() => navigate(`/products?category=${cat.id}`)}
                  sx={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 1.5, cursor: "pointer", flexShrink: 0, minWidth: { xs: 96, md: 120 },
                    "&:hover .cat-ring": { borderColor: L.rose },
                    "&:hover .cat-label": { color: L.rose },
                  }}
                >
                  <Box className="cat-ring" sx={{
                    width: { xs: 88, md: 110 }, height: { xs: 88, md: 110 },
                    borderRadius: "50%", overflow: "hidden",
                    border: `2.5px solid ${L.gold}`, transition: "border-color 0.2s",
                  }}>
                    <Box component="img" src={cat.image || cat.image_url || "/hero/empty-category.jpg"} alt={cat.name}
                      sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </Box>
                  <Typography className="cat-label" sx={{
                    fontSize: { xs: 11, md: 13 }, fontWeight: 600, color: L.dark,
                    textAlign: "center", transition: "color 0.2s",
                    maxWidth: { xs: 96, md: 120 },
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {cat.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* ── LUXURY COLLECTIONS (featured) ──────────
        {featuredProducts.length > 0 && (
          <Box sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, md: 4 }, background: L.warm }}>
            <Box sx={{ maxWidth: 1280, mx: "auto" }}>
              <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", mb: 4 }}>
                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: L.rose, letterSpacing: 2, textTransform: "uppercase", mb: 0.8 }}>
                    Editor's Pick
                  </Typography>
                  <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: { xs: 24, md: 30 }, fontWeight: 700, color: L.dark }}>
                    Luxury Collections
                  </Typography>
                </Box>
                <Box
                  component="button"
                  onClick={() => navigate("/products")}
                  sx={{
                    background: "none", border: `1.5px solid ${L.rose}`, color: L.rose,
                    borderRadius: 2, px: 2.5, py: 1,
                    fontSize: 12, fontWeight: 700, fontFamily: '"Poppins", sans-serif',
                    cursor: "pointer", whiteSpace: "nowrap",
                    "&:hover": { background: L.rose, color: "#fff" },
                    transition: "all 0.2s",
                  }}
                >
                  See All
                </Box>
              </Box>

              <Grid container spacing={{ xs: 1.5, md: 2.5 }}>
                {featuredProducts.map((p, i) => (
                  <Grid item xs={6} sm={4} md={3} key={i}>
                    <ProductCard product={p} onClick={() => navigate(`/products/${p.id}`)} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        )} */}
        {/* ── POPULAR PRODUCTS (all/deals) ─────────── */}
        {deals.length > 0 && (
          <Box sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, md: 4 } }}>
            <Box sx={{ maxWidth: 1280, mx: "auto" }}>
              <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", mb: 4 }}>
                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: L.rose, letterSpacing: 2, textTransform: "uppercase", mb: 0.8 }}>
                    All Products
                  </Typography>
                  <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: { xs: 24, md: 30 }, fontWeight: 700, color: L.dark }}>
                    Popular Collections
                  </Typography>
                </Box>
                <Box
                  component="button"
                  onClick={() => navigate("/products")}
                  sx={{
                    background: L.dark, color: "#fff", border: "none",
                    borderRadius: 2, px: 2.5, py: 1,
                    fontSize: 12, fontWeight: 700, fontFamily: '"Poppins", sans-serif',
                    cursor: "pointer", whiteSpace: "nowrap",
                  }}
                >
                  View All
                </Box>
              </Box>

              <Box sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
                gap: { xs: 2, md: 2.5 },
              }}>
                {deals.slice(0, 4).map((p, i) => (
                  <ProductCard key={i} product={p} onClick={() => navigate(`/products/${p.id}`)} />
                ))}
              </Box>
            </Box>
          </Box>
        )}
        {/* ── PROMO SPLIT BANNER ───────────────────── */}
        <Box sx={{
          display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          minHeight: { xs: "auto", md: 300 },
        }}>
          {categories.slice(8, 14).map((cat, i) => ({
            img: cat.image || cat.image_url || FALLBACK_BANNERS[i % FALLBACK_BANNERS.length].img,
            tag: BANNER_TAGS[i % BANNER_TAGS.length],
            title: cat.name,
            sub: BANNER_SUBS[i % BANNER_SUBS.length],
            path:cat.id
          })).map((b, i) => (
            <Box
              key={i}
              onClick={() => navigate(`/products?category=${b.path}`)}
              sx={{
                position: "relative", height: { xs: 200, md: 300 },
                overflow: "hidden", cursor: "pointer",
                "&:hover img": { transform: "scale(1.06)" },
              }}
            >
              <Box
                component="img"
                src={b.img}
                sx={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease", display: "block" }}
              />
              <Box sx={{
                position: "absolute", inset: 0,
                background: "linear-gradient(0deg, rgba(26,10,18,0.75) 0%, rgba(26,10,18,0.1) 60%)",
                display: "flex", flexDirection: "column", justifyContent: "flex-end",
                p: { xs: 2.5, md: 3.5 },
              }}>
                <Chip label={b.tag} size="small" sx={{ background: L.rose, color: "#fff", fontWeight: 700, fontSize: 10, width: "fit-content", mb: 1 }} />
              </Box>
            </Box>
          ))}
        </Box>



        {/* ── BEST DEALS ───────────────────────────── */}
        {bestDeals.length > 0 && (
          <Box sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, md: 4 }, background: L.dark }}>
            <Box sx={{ maxWidth: 1280, mx: "auto" }}>
              {/* heading */}
              <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", mb: 4 }}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.8 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: L.gold, animation: "pulse 1.5s infinite" }} />
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: L.gold, letterSpacing: 2, textTransform: "uppercase" }}>
                      Limited Time
                    </Typography>
                  </Box>
                  <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: { xs: 24, md: 30 }, fontWeight: 700, color: "#fff" }}>
                    Best Deals
                  </Typography>
                </Box>
                <Box
                  component="button"
                  onClick={() => navigate("/products")}
                  sx={{
                    background: L.rose, color: "#fff", border: "none",
                    borderRadius: 2, px: 2.5, py: 1,
                    fontSize: 12, fontWeight: 700, fontFamily: '"Poppins", sans-serif',
                    cursor: "pointer", whiteSpace: "nowrap",
                  }}
                >
                  View All
                </Box>
              </Box>

              {/* horizontal scroll row */}
              <Box sx={{
                display: "flex",
                gap: 2,
                overflowX: "auto",
                pb: 1,
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}>
                {bestDeals.map((p, i) => {
                  const discountPct = p.discount_price
                    ? Math.round(((p.price - p.discount_price) / p.price) * 100)
                    : 0;
                  return (
                    <Box
                      key={i}
                      onClick={() => navigate(`/products/${p.id}`)}
                      sx={{
                        minWidth: { xs: 160, md: 200 },
                        maxWidth: { xs: 160, md: 200 },
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 3,
                        overflow: "hidden",
                        cursor: "pointer",
                        flexShrink: 0,
                        transition: "transform 0.2s, border-color 0.2s",
                        "&:hover": { transform: "translateY(-4px)", borderColor: L.gold },
                      }}
                    >
                      {/* image */}
                      <Box sx={{ position: "relative", aspectRatio: "1/1", overflow: "hidden" }}>
                        <Box
                          component="img"
                          src={`${BASE_URL}${p.images?.[0]}`}
                          alt={p.name}
                          sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                        {/* discount badge */}
                        <Box sx={{
                          position: "absolute", top: 8, left: 8,
                          background: L.rose, color: "#fff",
                          fontSize: 11, fontWeight: 800,
                          px: 1, py: 0.3, borderRadius: 1,
                        }}>
                          -{discountPct}%
                        </Box>
                      </Box>

                      {/* info */}
                      <Box sx={{ p: 1.5 }}>
                        <Typography sx={{
                          fontSize: 12, fontWeight: 600, color: "#fff",
                          lineHeight: 1.35, mb: 1,
                          display: "-webkit-box", WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}>
                          {p.name}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                          <Typography sx={{ fontSize: 15, fontWeight: 800, color: L.gold }}>
                            ₹{p.discount_price}
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "line-through" }}>
                            ₹{p.price}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        )}


        {/* ── CUSTOMER REVIEWS ─────────────────────── */}
        <Box sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, md: 4 }, background: L.warm }}>
          <Box sx={{ maxWidth: 1280, mx: "auto" }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: L.rose, letterSpacing: 2, textTransform: "uppercase", mb: 0.8 }}>
                Happy Customers
              </Typography>
              <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: { xs: 24, md: 30 }, fontWeight: 700, color: L.dark }}>
                What They Say
              </Typography>
            </Box>

            {reviews.length === 0 ? (
              <Typography sx={{ textAlign: "center", color: L.muted, py: 4 }}>
                No reviews yet. Be the first to review!
              </Typography>
            ) : (
              <Box sx={{
                display: "flex",
                gap: { xs: 1.5, md: 2.5 },
                overflowX: "auto",
                pb: 1,
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}>
                {reviews.map((r) => (
                  <Box key={r._id} sx={{
                    background: L.white, borderRadius: 3, p: 3,
                    boxShadow: "0 2px 16px rgba(26,10,18,0.07)",
                    minWidth: { xs: 260, md: 320 },
                    maxWidth: { xs: 260, md: 320 },
                    flexShrink: 0,
                    "&:hover": { boxShadow: "0 6px 24px rgba(26,10,18,0.13)" },
                    transition: "box-shadow 0.2s",
                  }}>
                    {/* stars */}
                    <Box sx={{ display: "flex", gap: 0.3, mb: 1.5 }}>
                      {Array.from({ length: r.ratings }).map((_, j) => (
                        <Star key={j} size={14} fill="#FFD700" color="#FFD700" />
                      ))}
                    </Box>
                    <Typography sx={{ fontSize: 13, color: "#333", fontStyle: "italic", lineHeight: 1.65, mb: 2 }}>
                      "{r.description || "Great product!"}"
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ width: 38, height: 38, background: L.rose, fontSize: 14, fontWeight: 700 }}>
                        {r.Customername?.[0]?.toUpperCase() ?? "?"}
                      </Avatar>
                      <Typography sx={{ fontWeight: 700, fontSize: 13, color: L.dark }}>
                        {r.Customername}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>

      </Box>
    </>
  );
};

/* ─── PRODUCT CARD ───────────────────────────────── */
const ProductCard = ({ product, onClick }: { product: Product; onClick: () => void }) => {
  const [wishlisted, setWishlisted] = useState(false);
  const imgSrc = `${BASE_URL}${product.images?.[0] ?? ""}`;

  const discountPct = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : null;

  return (
    <Box
      onClick={onClick}
      sx={{
        background: "#fff", borderRadius: 3, overflow: "hidden",
        cursor: "pointer", position: "relative",
        boxShadow: "0 2px 12px rgba(26,10,18,0.07)",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 28px rgba(26,10,18,0.14)",
        },
      }}
    >
      {/* image */}
      <Box sx={{ position: "relative", aspectRatio: "1 / 1", overflow: "hidden" }}>
        <Box
          component="img"
          src={imgSrc}
          alt={product.name}
          sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s", ".MuiBox-root:hover &": { transform: "scale(1.06)" } }}
        />

        {/* discount badge */}
        {discountPct && (
          <Box sx={{
            position: "absolute", top: 10, left: 10,
            background: L.rose, color: "#fff",
            fontSize: 10, fontWeight: 700,
            px: 1, py: 0.3, borderRadius: 1,
          }}>
            {discountPct}% OFF
          </Box>
        )}

        {/* wishlist */}
        <Box
          component="button"
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); setWishlisted((w) => !w); }}
          sx={{
            position: "absolute", top: 8, right: 8,
            background: "#fff", border: "none",
            borderRadius: "50%", width: 30, height: 30,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", boxShadow: "0 1px 6px rgba(0,0,0,0.12)",
            color: wishlisted ? L.rose : "#aaa",
            "&:hover": { color: L.rose },
          }}
        >
          <Heart size={14} fill={wishlisted ? L.rose : "none"} />
        </Box>
      </Box>

      {/* info */}
      <Box sx={{ p: { xs: 1.2, md: 1.8 } }}>
        {/* rating */}
        {product.rating > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.6 }}>
            <Star size={11} fill="#FFD700" color="#FFD700" />
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: L.dark }}>
              {product.rating.toFixed(1)}
            </Typography>
            {product.totalReviews != null && (
              <Typography sx={{ fontSize: 10, color: L.muted }}>({product.totalReviews})</Typography>
            )}
          </Box>
        )}

        <Typography sx={{
          fontSize: { xs: 12, md: 13 }, fontWeight: 600, color: L.dark,
          lineHeight: 1.35,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
          mb: 0.8,
        }}>
          {product.name}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.8 }}>
          <Typography sx={{ fontSize: { xs: 14, md: 16 }, fontWeight: 800, color: L.dark }}>
            ₹{product.discount_price ?? product.price}
          </Typography>
          {product.discount_price && (
            <Typography sx={{ fontSize: 11, color: L.muted, textDecoration: "line-through" }}>
              ₹{product.price}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};
