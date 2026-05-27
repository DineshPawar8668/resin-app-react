import { Box, Typography, Divider } from '@mui/material';
import {
  ArrowLeft, Store, Users, ShoppingBag, Globe, Zap, Shield,
  CheckCircle2, TrendingUp, Layers, Link2,
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
                <ShoppingBag size={26} color="#fff" />
              </Box>
              <Box>
                <Typography fontWeight={900} fontSize={{ xs: 20, sm: 26 }} color="#fff" lineHeight={1.1}>
                  ShopSphere
                </Typography>
                <Typography fontSize={12} sx={{ color: 'rgba(255,255,255,0.75)' }}>
                  Multi-Vendor SaaS E-Commerce Platform
                </Typography>
              </Box>
            </Box>
            <Typography
              fontSize={{ xs: 13, sm: 15 }}
              sx={{ color: 'rgba(255,255,255,0.9)', maxWidth: 520, lineHeight: 1.7 }}
            >
              We empower businesses of every size to launch their own branded online store —
              all running on a single, powerful platform. Multiple admins, one ecosystem.
            </Typography>
          </Box>

          {/* Stats row */}
          <Box sx={{
            display: 'flex', alignItems: 'center',
            px: { xs: 2, sm: 4 }, py: 2.5,
            borderBottom: '1px solid #f5f5f5',
          }}>
            <StatBadge value="500+" label="Active Stores" />
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <StatBadge value="50K+" label="Happy Customers" />
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <StatBadge value="99.9%" label="Uptime" />
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <StatBadge value="24/7" label="Support" />
          </Box>

          {/* Mission */}
          <Box sx={{ px: { xs: 2.5, sm: 4 }, py: 3 }}>
            <Typography fontWeight={800} fontSize={15} mb={1}>Our Mission</Typography>
            <Typography fontSize={13.5} color="text.secondary" lineHeight={1.8}>
              ShopSphere was built with one goal: make it ridiculously easy for any entrepreneur,
              brand, or business to sell online — without worrying about infrastructure.
              Each admin gets their own isolated storefront, their own product catalogue,
              and their own customer base. Customers who land on an admin's unique link
              see <em>only that admin's</em> products, giving every store a personal, focused feel.
            </Typography>
          </Box>
        </Box>

        {/* ── How it works ── */}
        <Box sx={{
          background: '#fff', borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', mb: 3,
        }}>
          <SectionHeader icon={Layers} title="How It Works" />
          <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <StepItem
              num={1}
              title="Admin Signs Up & Gets a Unique Store Link"
              desc="Every admin registers on ShopSphere and instantly receives a personalised store URL — e.g. shopsphere.com/store/your-brand. No coding needed."
            />
            <Box sx={{ height: 1, background: '#f5f5f5' }} />
            <StepItem
              num={2}
              title="Admin Adds Their Products"
              desc="Admins manage their own product catalogue independently. Prices, images, offers, stock — everything stays within their dashboard and is visible only on their storefront."
            />
            <Box sx={{ height: 1, background: '#f5f5f5' }} />
            <StepItem
              num={3}
              title="Customers Shop on That Admin's Store"
              desc="When a customer visits an admin's link, they see a fully branded experience with only that admin's products. Orders, payments, and tracking are all scoped to that store."
            />
            <Box sx={{ height: 1, background: '#f5f5f5' }} />
            <StepItem
              num={4}
              title="Platform Handles the Heavy Lifting"
              desc="ShopSphere manages authentication, payments, order management, and notifications centrally — so admins focus on selling, not tech."
            />
          </Box>
        </Box>

        {/* ── Why us ── */}
        <Box sx={{
          background: '#fff', borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', mb: 3,
        }}>
          <SectionHeader icon={TrendingUp} title="Why ShopSphere?" />
          <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            <FeatureCard
              icon={Store}
              title="Isolated Storefronts"
              desc="Each admin's store is completely separate. Customers see only the products of the store they visit."
              color="#F06292"
              bg={PINK[50]}
            />
            <FeatureCard
              icon={Link2}
              title="Custom Store Links"
              desc="Admins share their unique URL. Traffic is routed automatically to the right storefront."
              color="#1976D2"
              bg="#E3F2FD"
            />
            <FeatureCard
              icon={Users}
              title="Multi-Admin SaaS"
              desc="Unlimited admins on one platform. Each has full control of their own catalogue and orders."
              color="#7B1FA2"
              bg="#F3E5F5"
            />
            <FeatureCard
              icon={Zap}
              title="Instant Setup"
              desc="Go live in minutes. No server setup, no deployment headaches. Just sign up and start selling."
              color="#F57C00"
              bg="#FFF3E0"
            />
            <FeatureCard
              icon={Shield}
              title="Secure & Reliable"
              desc="Bank-grade security, encrypted payments, and 99.9% uptime — your store is always open."
              color="#388E3C"
              bg="#E8F5E9"
            />
            <FeatureCard
              icon={Globe}
              title="Sell to Anyone"
              desc="Mobile-first, fast-loading storefronts that work beautifully across all devices and regions."
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
              { text: 'A focused, clutter-free shopping experience with products from one trusted store' },
              { text: 'Easy order tracking from placement to doorstep delivery' },
              { text: 'Secure payments with instant confirmation' },
              { text: 'Order history and re-order support in your personal dashboard' },
              { text: 'Responsive support from the store admin youre shopping with' },
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
              Ready to start shopping?
            </Typography>
            <Typography fontSize={13} sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Visit the store link shared with you to explore products.
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
  );
};