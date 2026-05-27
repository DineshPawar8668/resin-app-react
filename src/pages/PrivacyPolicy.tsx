import { Box, Typography } from '@mui/material';
import {
  ArrowLeft, Shield, Eye, Lock, Database, UserCheck,
  Globe, Bell, Mail, Clock, CheckCircle2, AlertTriangle,
  ShoppingBag,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PINK = { 600: '#C2185B', 500: '#D81B60', 50: '#FFF0F6', 100: '#FCE4EC' };

const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: 1 }}>
    <Icon size={17} color={PINK[600]} />
    <Typography fontWeight={800} fontSize={15}>{title}</Typography>
  </Box>
);

const InfoRow = ({ icon: Icon, iconColor, iconBg, title, desc }: {
  icon: any; iconColor: string; iconBg: string; title: string; desc: string;
}) => (
  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
    <Box sx={{
      width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
      background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={16} color={iconColor} />
    </Box>
    <Box>
      <Typography fontWeight={800} fontSize={14} mb={0.3}>{title}</Typography>
      <Typography fontSize={13} color="text.secondary" lineHeight={1.65}>{desc}</Typography>
    </Box>
  </Box>
);

const BulletList = ({ items }: { items: string[] }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
    {items.map((item, i) => (
      <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box sx={{
          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
          background: PINK[50], display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.2,
        }}>
          <CheckCircle2 size={11} color={PINK[600]} />
        </Box>
        <Typography fontSize={13} color="text.secondary" lineHeight={1.6}>{item}</Typography>
      </Box>
    ))}
  </Box>
);

export const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ background: '#f7f7fa', minHeight: '100vh' }}>

      {/* Breadcrumb */}
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
        <Typography fontSize={13} fontWeight={700} color="#fff">Privacy Policy</Typography>
      </Box>

      <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 1.5, sm: 2, md: 3 }, py: 3 }}>

        {/* Hero */}
        <Box sx={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', mb: 3 }}>
          <Box sx={{
            background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
            px: { xs: 2.5, sm: 4 }, py: { xs: 3, sm: 4 },
            position: 'relative', overflow: 'hidden',
          }}>
            {[140, 240, 320].map((size, i) => (
              <Box key={i} sx={{
                position: 'absolute', right: -size / 3, top: -size / 3,
                width: size, height: size, borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
              }} />
            ))}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <Box sx={{
                width: 48, height: 48, borderRadius: '14px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Shield size={24} color="#fff" />
              </Box>
              <Box>
                <Typography fontWeight={900} fontSize={{ xs: 18, sm: 24 }} color="#fff" lineHeight={1.1}>
                  Privacy Policy
                </Typography>
                <Typography fontSize={12} sx={{ color: 'rgba(255,255,255,0.75)' }}>
                  Your privacy is our priority
                </Typography>
              </Box>
            </Box>
            <Typography fontSize={{ xs: 13, sm: 14 }} sx={{ color: 'rgba(255,255,255,0.88)', lineHeight: 1.7, maxWidth: 520 }}>
              We are committed to protecting your personal information and being transparent
              about how we collect, use, and safeguard your data on our platform.
            </Typography>
          </Box>
          <Box sx={{ px: 3, py: 1.5, background: PINK[50], display: 'flex', alignItems: 'center', gap: 1 }}>
            <Clock size={13} color={PINK[600]} />
            <Typography fontSize={12} color="text.secondary">
              Last updated: <strong>may 2026</strong> &nbsp;·&nbsp; Effective immediately upon use of the platform
            </Typography>
          </Box>
        </Box>

        {/* What we collect */}
        <Box sx={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', mb: 3 }}>
          <SectionHeader icon={Database} title="Information We Collect" />
          <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <InfoRow
              icon={UserCheck} iconColor="#1976D2" iconBg="#E3F2FD"
              title="Account Information"
              desc="When you register, we collect your name, email address, phone number, and password (stored encrypted). This is used to identify you and manage your account securely."
            />
            <Box sx={{ height: 1, background: '#f5f5f5' }} />
            <InfoRow
              icon={ShoppingBag} iconColor={PINK[600]} iconBg={PINK[50]}
              title="Order & Transaction Data"
              desc="We collect details of every order you place, including products purchased, payment amounts (advance and balance), order status, and delivery address."
            />
            <Box sx={{ height: 1, background: '#f5f5f5' }} />
            <InfoRow
              icon={Globe} iconColor="#388E3C" iconBg="#E8F5E9"
              title="Device & Usage Data"
              desc="We automatically collect your IP address, browser type, device information, pages visited, and time spent on the platform to improve performance and detect fraud."
            />
            <Box sx={{ height: 1, background: '#f5f5f5' }} />
            <InfoRow
              icon={Bell} iconColor="#F57C00" iconBg="#FFF3E0"
              title="Communication Data"
              desc="Messages you send via our contact form, support queries, or any correspondence with us are stored to provide better support and resolve disputes."
            />
          </Box>
        </Box>

        {/* How we use it */}
        <Box sx={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', mb: 3 }}>
          <SectionHeader icon={Eye} title="How We Use Your Information" />
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <BulletList items={[
              'To create and manage your account on the platform',
              'To process your orders, payments, and send order confirmations',
              'To provide order tracking and delivery updates',
              'To connect you with the correct admin storefront based on your store link',
              'To send important notifications about your orders or account',
              'To detect, prevent, and respond to fraud or security issues',
              'To improve platform features and fix bugs based on usage patterns',
              'To respond to your queries submitted via the contact form',
            ]} />
          </Box>
        </Box>

        {/* Data sharing */}
        <Box sx={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', mb: 3 }}>
          <SectionHeader icon={Lock} title="Data Sharing & Third Parties" />
          <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{
              p: 2, borderRadius: '12px', background: '#E8F5E9',
              border: '1px solid #C8E6C9', display: 'flex', gap: 1.5, alignItems: 'flex-start',
            }}>
              <CheckCircle2 size={18} color="#388E3C" style={{ flexShrink: 0, marginTop: 2 }} />
              <Typography fontSize={13} color="#2E7D32" lineHeight={1.65} fontWeight={600}>
                We do NOT sell, rent, or trade your personal data to any third party for marketing purposes. Ever.
              </Typography>
            </Box>
            <Typography fontSize={13} color="text.secondary" lineHeight={1.7}>
              We may share your data only in the following limited circumstances:
            </Typography>
            <BulletList items={[
              'With the admin of the specific storefront you shop on — so they can fulfil your order',
              'With payment processors to handle your advance and balance payments securely',
              'With delivery partners when required to complete your order shipment',
              'With law enforcement or authorities if legally required by a court order or government regulation',
              'With our internal technical team strictly for platform maintenance and security audits',
            ]} />
          </Box>
        </Box>

        {/* Data security */}
        <Box sx={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', mb: 3 }}>
          <SectionHeader icon={Shield} title="Data Security" />
          <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography fontSize={13} color="text.secondary" lineHeight={1.7}>
              We implement industry-standard security measures to protect your personal data from
              unauthorised access, alteration, disclosure, or destruction.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {[
                { icon: Lock, label: 'Encrypted passwords', color: '#1976D2', bg: '#E3F2FD' },
                { icon: Shield, label: 'Secure HTTPS', color: '#388E3C', bg: '#E8F5E9' },
                { icon: Eye, label: 'Access controls', color: '#7B1FA2', bg: '#F3E5F5' },
                { icon: Database, label: 'Secure databases', color: '#F57C00', bg: '#FFF3E0' },
              ].map(({ icon: Icon, label, color, bg }) => (
                <Box key={label} sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  px: 1.5, py: 1, borderRadius: '10px', background: bg,
                  border: `1px solid ${color}22`,
                }}>
                  <Icon size={14} color={color} />
                  <Typography fontSize={12.5} fontWeight={700} sx={{ color }}>{label}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{
              p: 2, borderRadius: '12px', background: '#FFF3E0',
              border: '1px solid #FFB74D', display: 'flex', gap: 1.5, alignItems: 'flex-start',
            }}>
              <AlertTriangle size={16} color="#F57C00" style={{ flexShrink: 0, marginTop: 2 }} />
              <Typography fontSize={13} color="#E65100" lineHeight={1.65}>
                While we take all reasonable precautions, no system is 100% secure. Please use a strong,
                unique password and do not share your account credentials with anyone.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Your rights */}
        <Box sx={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', mb: 3 }}>
          <SectionHeader icon={UserCheck} title="Your Rights" />
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <BulletList items={[
              'Access the personal data we hold about you at any time',
              'Request correction of inaccurate or incomplete data',
              'Request deletion of your account and associated personal data',
              'Opt out of non-essential communications and marketing emails',
              'Lodge a complaint if you believe your data has been mishandled',
            ]} />
            <Typography fontSize={13} color="text.secondary" lineHeight={1.7} mt={2}>
              To exercise any of these rights, please reach out to us via our{' '}
              <Box
                component="span"
                onClick={() => navigate('/contact')}
                sx={{ color: PINK[600], fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                Contact Us
              </Box>{' '}
              page. We will respond within 7 business days.
            </Typography>
          </Box>
        </Box>

        {/* Cookies */}
        <Box sx={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', mb: 3 }}>
          <SectionHeader icon={Globe} title="Cookies & Tracking" />
          <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography fontSize={13} color="text.secondary" lineHeight={1.7}>
              We use essential cookies to keep you logged in and maintain your session. We may also
              use analytics cookies to understand how users interact with the platform.
            </Typography>
            <BulletList items={[
              'Session cookies — required for login and cart functionality',
              'Preference cookies — to remember your language and display settings',
              'Analytics cookies — to understand usage patterns (anonymised)',
            ]} />
            <Typography fontSize={13} color="text.secondary" lineHeight={1.7}>
              You can disable cookies in your browser settings, but some features may not work correctly.
            </Typography>
          </Box>
        </Box>

        {/* Contact */}
        <Box sx={{
          background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
          borderRadius: '20px', px: 3, py: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 2,
          boxShadow: '0 4px 20px rgba(240,98,146,0.25)',
        }}>
          <Box>
            <Typography fontWeight={900} fontSize={16} color="#fff">Privacy concerns or questions?</Typography>
            <Typography fontSize={13} sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Contact our team and we'll respond within 7 business days.
            </Typography>
          </Box>
          <Box onClick={() => navigate('/contact')} sx={{
            background: '#fff', color: PINK[600],
            px: 2.5, py: 1, borderRadius: '30px',
            fontWeight: 800, fontSize: 14, cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
            '&:hover': { background: PINK[50] },
            whiteSpace: 'nowrap',
          }}>
            Contact Us →
          </Box>
        </Box>

      </Box>
    </Box>
  );
};