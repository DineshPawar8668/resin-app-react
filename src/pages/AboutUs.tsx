import { Box, Typography, Divider } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft, Sparkles, Heart, Gem, Palette, Truck, Shield,
  CheckCircle2, TrendingUp, Layers, Gift,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PINK = { 600: '#C2185B', 500: '#D81B60', 50: '#FFF0F6', 100: '#FCE4EC' };

/* ── small reusable pieces ── */
const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: 1 }}>
    <Icon size={17} color={PINK[600]} />
    <Typography fontWeight={800} fontSize={15}>{title}</Typography>
  </Box>
);

const FeatureCard = ({
  icon: Icon, title, desc, color, bg,
}: { icon: any; title: string; desc: string; color: string; bg: string }) => (
  <Box sx={{
    display: 'flex', gap: 1.5, alignItems: 'flex-start',
    p: 2, borderRadius: '14px', background: bg,
    border: `1px solid ${color}22`,
    flex: '1 1 240px',
  }}>
    <Box sx={{
      width: 38, height: 38, borderRadius: '10px', background: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      boxShadow: `0 2px 8px ${color}33`,
    }}>
      <Icon size={18} color={color} />
    </Box>
    <Box>
      <Typography fontWeight={800} fontSize={14} mb={0.4}>{title}</Typography>
      <Typography fontSize={12.5} color="text.secondary" lineHeight={1.5}>{desc}</Typography>
    </Box>
  </Box>
);

const StatBadge = ({ value, label }: { value: string; label: string }) => (
  <Box sx={{ textAlign: 'center', flex: 1 }}>
    <Typography fontWeight={900} fontSize={26} sx={{
      background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    }}>{value}</Typography>
    <Typography fontSize={12} color="text.secondary" fontWeight={600}>{label}</Typography>
  </Box>
);

const StepItem = ({ num, title, desc }: { num: number; title: string; desc: string }) => (
  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
    <Box sx={{
      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Typography fontSize={13} fontWeight={900} color="#fff">{num}</Typography>
    </Box>
    <Box sx={{ pt: 0.3 }}>
      <Typography fontWeight={800} fontSize={14}>{title}</Typography>
      <Typography fontSize={12.5} color="text.secondary" lineHeight={1.5}>{desc}</Typography>
    </Box>
  </Box>
);

/* ── main page ── */
export const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>About ShopIzara – India's Premier Handmade Resin Art Store</title>
        <meta name="description" content="Learn about ShopIzara – India's trusted online store for handmade resin art. Our story, mission and passion for creating unique resin jewelry, home decor and gifts." />
        <meta name="keywords" content="about shopizara, handmade resin art india, resin art brand india, resin jewelry brand" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://shopizara.com/about-us" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shopizara.com/about-us" />
        <meta property="og:site_name" content="ShopIzara" />
        <meta property="og:title" content="About ShopIzara – India's Premier Handmade Resin Art Store" />
        <meta property="og:description" content="Learn about ShopIzara – India's trusted handmade resin art store. Unique resin jewelry, home decor and gifts, crafted with love." />
        <meta property="og:image" content="https://shopizara.com/hero/r-1.jpg" />
        <meta property="og:locale" content="en_IN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About ShopIzara – India's Premier Handmade Resin Art Store" />
        <meta name="twitter:image" content="https://shopizara.com/hero/r-1.jpg" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About ShopIzara",
            "url": "https://shopizara.com/about-us",
            "description": "ShopIzara is India's premier online store for handmade resin art products including jewelry, coasters, photo frames and home decor.",
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://shopizara.com" },
                { "@type": "ListItem", "position": 2, "name": "About Us", "item": "https://shopizara.com/about-us" }
              ]
            }
          }
        `}</script>
      </Helmet>
    <Box sx={{ background: '#f7f7fa', minHeight: '100vh' }}>

      {/* Breadcrumb bar */}
      <Box sx={{
        background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
        px: { xs: 2, md: 4 }, py: 1.5,
        display: 'flex', alignItems: 'center', gap: 1,
      }}>
        <Box onClick={() => navigate(-1)} sx={{
          display: 'flex', alignItems: 'center', gap: 0.8,
          color: 'rgba(255,255,255,0.85)', cursor: 'pointer',
          '&:hover': { color: '#fff' },
        }}>
          <ArrowLeft size={16} />
          <Typography fontSize={13} fontWeight={600}>Back</Typography>
        </Box>
        <Typography fontSize={13} sx={{ color: 'rgba(255,255,255,0.5)', mx: 0.5 }}>/</Typography>
        <Typography fontSize={13} fontWeight={700} color="#fff">About Us</Typography>
      </Box>

      <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 1.5, sm: 2, md: 3 }, py: 3 }}>

        {/* ── Hero card ── */}
        <Box sx={{
          background: '#fff', borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.07)', mb: 3,
        }}>
          <Box sx={{
            background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
            px: { xs: 2.5, sm: 4 }, py: { xs: 3.5, sm: 5 },
            position: 'relative', overflow: 'hidden',
          }}>
            {/* decorative circles */}
            {[160, 260, 360].map((size, i) => (
              <Box key={i} sx={{
                position: 'absolute', right: -size / 3, top: -size / 3,
                width: size, height: size, borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                pointerEvents: 'none',
              }} />
            ))}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{
                width: 52, height: 52, borderRadius: '14px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(10px)',
              }}>
                <Gem size={26} color="#fff" />
              </Box>
              <Box>
                <Typography fontWeight={900} fontSize={{ xs: 20, sm: 26 }} color="#fff" lineHeight={1.1}>
                  ShopIzara
                </Typography>
                <Typography fontSize={12} sx={{ color: 'rgba(255,255,255,0.75)' }}>
                  Handmade Resin Art Store
                </Typography>
              </Box>
            </Box>
            <Typography
              fontSize={{ xs: 13, sm: 15 }}
              sx={{ color: 'rgba(255,255,255,0.9)', maxWidth: 520, lineHeight: 1.7 }}
            >
              We craft one-of-a-kind resin jewelry, home decor and gifting pieces by hand —
              turning liquid resin, pigments and botanicals into wearable art and keepsakes
              you won't find anywhere else.
            </Typography>
          </Box>

          {/* Stats row */}
          <Box sx={{
            display: 'flex', alignItems: 'center',
            px: { xs: 2, sm: 4 }, py: 2.5,
            borderBottom: '1px solid #f5f5f5',
          }}>
            <StatBadge value="5K+" label="Pieces Crafted" />
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <StatBadge value="10K+" label="Happy Customers" />
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <StatBadge value="100%" label="Handmade" />
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <StatBadge value="4.8★" label="Avg Rating" />
          </Box>

          {/* Mission */}
          <Box sx={{ px: { xs: 2.5, sm: 4 }, py: 3 }}>
            <Typography fontWeight={800} fontSize={15} mb={1}>Our Mission</Typography>
            <Typography fontSize={13.5} color="text.secondary" lineHeight={1.8}>
              ShopIzara was born from a love of resin art and a desire to bring handcrafted,
              artisan-made pieces to every home in India. Every pendant, coaster, photo frame
              and decor piece is poured, cured and finished by hand in small batches —
              so <em>no two pieces are ever exactly alike</em>. We believe art should be
              affordable, personal, and made with genuine care.
            </Typography>
          </Box>
        </Box>

        {/* ── How it works ── */}
        <Box sx={{
          background: '#fff', borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', mb: 3,
        }}>
          <SectionHeader icon={Layers} title="How Our Resin Art Is Made" />
          <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <StepItem
              num={1}
              title="Design & Mix"
              desc="Every piece starts as a sketch. We mix food-safe epoxy resin with pigments, alcohol inks, dried flowers or glitter to bring the design to life."
            />
            <Box sx={{ height: 1, background: '#f5f5f5' }} />
            <StepItem
              num={2}
              title="Pour & Cure"
              desc="The resin is carefully poured into hand-finished moulds and left to cure for 24–48 hours in a dust-free studio, layer by layer where needed."
            />
            <Box sx={{ height: 1, background: '#f5f5f5' }} />
            <StepItem
              num={3}
              title="Sand & Polish"
              desc="Once cured, every piece is de-moulded, sanded and hand-polished to a glass-like shine, then checked for quality and finish."
            />
            <Box sx={{ height: 1, background: '#f5f5f5' }} />
            <StepItem
              num={4}
              title="Pack & Ship"
              desc="Finished pieces are carefully wrapped in protective packaging and shipped across India, ready to be unwrapped and loved."
            />
          </Box>
        </Box>

        {/* ── Why us ── */}
        <Box sx={{
          background: '#fff', borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', mb: 3,
        }}>
          <SectionHeader icon={TrendingUp} title="Why Choose ShopIzara?" />
          <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            <FeatureCard
              icon={Heart}
              title="100% Handmade"
              desc="Every resin piece is individually crafted by our artisans — no mass production, no two pieces identical."
              color="#F06292"
              bg={PINK[50]}
            />
            <FeatureCard
              icon={Palette}
              title="Unique Designs"
              desc="From resin jewelry to coasters and photo frames, each design blends colour, texture and creativity."
              color="#1976D2"
              bg="#E3F2FD"
            />
            <FeatureCard
              icon={Gift}
              title="Perfect for Gifting"
              desc="Beautifully packaged resin art makes a thoughtful, memorable gift for every occasion."
              color="#7B1FA2"
              bg="#F3E5F5"
            />
            <FeatureCard
              icon={Sparkles}
              title="Premium Finish"
              desc="Food-safe, UV-resistant resin polished to a glossy, long-lasting shine on every piece."
              color="#F57C00"
              bg="#FFF3E0"
            />
            <FeatureCard
              icon={Shield}
              title="Quality Checked"
              desc="Every piece is inspected for durability and finish before it leaves our studio."
              color="#388E3C"
              bg="#E8F5E9"
            />
            <FeatureCard
              icon={Truck}
              title="Pan-India Delivery"
              desc="Safely packaged and shipped across India, so your resin art arrives exactly as crafted."
              color="#0288D1"
              bg="#E1F5FE"
            />
          </Box>
        </Box>

        {/* ── What customers get ── */}
        <Box sx={{
          background: '#fff', borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', mb: 3,
        }}>
          <SectionHeader icon={CheckCircle2} title="What You Get as a Customer" />
          <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[
              { text: 'Genuinely handmade resin jewelry, decor and gifting pieces — never mass-produced' },
              { text: 'Easy order tracking from crafting to doorstep delivery' },
              { text: 'Secure payments with instant order confirmation' },
              { text: 'Order history and easy re-ordering from your personal dashboard' },
              { text: 'Friendly, responsive support for sizing, customisation and care tips' },
            ].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box sx={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: PINK[50], display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.1,
                }}>
                  <CheckCircle2 size={13} color={PINK[600]} />
                </Box>
                <Typography fontSize={13.5} color="text.secondary" lineHeight={1.6}>{item.text}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Footer note ── */}
        <Box sx={{
          background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
          borderRadius: '20px', px: 3, py: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 2,
          boxShadow: '0 4px 20px rgba(240,98,146,0.25)',
        }}>
          <Box>
            <Typography fontWeight={900} fontSize={17} color="#fff">
              Ready to explore handmade resin art?
            </Typography>
            <Typography fontSize={13} sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Browse our collection of resin jewelry, decor and gifts.
            </Typography>
          </Box>
          <Box
            onClick={() => navigate('/products')}
            sx={{
              background: '#fff', color: PINK[600],
              px: 2.5, py: 1, borderRadius: '30px',
              fontWeight: 800, fontSize: 14, cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
              '&:hover': { background: PINK[50] },
              whiteSpace: 'nowrap',
            }}
          >
            Browse Products →
          </Box>
        </Box>

      </Box>
    </Box>
    </>
  );
};