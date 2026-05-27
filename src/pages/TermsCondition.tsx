import { Box, Typography } from '@mui/material';
import {
  ArrowLeft, FileText, ShoppingBag, CreditCard, UserCheck,
  AlertTriangle, ShieldX, Globe, Scale, Mail, Clock, CheckCircle2, XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PINK = { 600: '#C2185B', 500: '#D81B60', 50: '#FFF0F6', 100: '#FCE4EC' };

const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: 1 }}>
    <Icon size={17} color={PINK[600]} />
    <Typography fontWeight={800} fontSize={15}>{title}</Typography>
  </Box>
);

const BulletList = ({ items, color = PINK[600], bg = PINK[50], icon: Icon = CheckCircle2 }: {
  items: string[]; color?: string; bg?: string; icon?: any;
}) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
    {items.map((item, i) => (
      <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box sx={{
          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
          background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.2,
        }}>
          <Icon size={11} color={color} />
        </Box>
        <Typography fontSize={13} color="text.secondary" lineHeight={1.6}>{item}</Typography>
      </Box>
    ))}
  </Box>
);

const ClauseBlock = ({ number, title, children }: { number: string; title: string; children: React.ReactNode }) => (
  <Box sx={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', mb: 3 }}>
    <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{
        width: 28, height: 28, borderRadius: '8px', flexShrink: 0,
        background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Typography fontSize={12} fontWeight={900} color="#fff">{number}</Typography>
      </Box>
      <Typography fontWeight={800} fontSize={15}>{title}</Typography>
    </Box>
    <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>
  </Box>
);

export const TermsAndConditions = () => {
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
        <Typography fontSize={13} fontWeight={700} color="#fff">Terms & Conditions</Typography>
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
                <FileText size={24} color="#fff" />
              </Box>
              <Box>
                <Typography fontWeight={900} fontSize={{ xs: 18, sm: 24 }} color="#fff" lineHeight={1.1}>
                  Terms & Conditions
                </Typography>
                <Typography fontSize={12} sx={{ color: 'rgba(255,255,255,0.75)' }}>
                  Please read before using our platform
                </Typography>
              </Box>
            </Box>
            <Typography fontSize={{ xs: 13, sm: 14 }} sx={{ color: 'rgba(255,255,255,0.88)', lineHeight: 1.7, maxWidth: 520 }}>
              By accessing or using this platform — whether as a customer or a store admin —
              you agree to be bound by these Terms and Conditions. If you do not agree, please
              discontinue use immediately.
            </Typography>
          </Box>
          <Box sx={{ px: 3, py: 1.5, background: PINK[50], display: 'flex', alignItems: 'center', gap: 1 }}>
            <Clock size={13} color={PINK[600]} />
            <Typography fontSize={12} color="text.secondary">
              Last updated: <strong>may 2026</strong> &nbsp;·&nbsp; Applies to all users and admins of the platform
            </Typography>
          </Box>
        </Box>

        {/* Clause 1 — Acceptance */}
        <ClauseBlock number="1" title="Acceptance of Terms">
          <Typography fontSize={13} color="text.secondary" lineHeight={1.75} mb={2}>
            By creating an account, browsing the platform, placing an order, or making any payment,
            you acknowledge that you have read, understood, and agree to these Terms & Conditions
            in full — including our{' '}
            <Box component="span" onClick={() => navigate('/refund-policy')}
              sx={{ color: PINK[600], fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
              Refund Policy
            </Box>{' '}
            and{' '}
            <Box component="span" onClick={() => navigate('/privacy-policy')}
              sx={{ color: PINK[600], fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
              Privacy Policy
            </Box>.
          </Typography>
          <Box sx={{ p: 2, borderRadius: '12px', background: PINK[50], border: `1px solid ${PINK[100]}` }}>
            <Typography fontSize={13} color={PINK[600]} fontWeight={700} lineHeight={1.65}>
              These terms form a legally binding agreement between you and the platform.
              Continued use of the platform after any updates to these terms implies acceptance
              of the revised terms.
            </Typography>
          </Box>
        </ClauseBlock>

        {/* Clause 2 — Platform Overview */}
        <ClauseBlock number="2" title="About the Platform">
          <Typography fontSize={13} color="text.secondary" lineHeight={1.75} mb={2}>
            This is a multi-vendor SaaS e-commerce platform. Multiple store admins operate
            their independent storefronts on a shared infrastructure. Each admin manages their
            own products, pricing, and orders.
          </Typography>
          <BulletList items={[
            'Each admin has a unique store link. Customers who visit that link see only that admin\'s products.',
            'The platform provides the technology infrastructure; individual admins are responsible for their own product listings and fulfillment.',
            'The platform operator is not directly liable for the quality or delivery of products sold by individual store admins.',
            'Admins must comply with all applicable laws when listing and selling products on the platform.',
          ]} />
        </ClauseBlock>

        {/* Clause 3 — User Accounts */}
        <ClauseBlock number="3" title="User Accounts & Eligibility">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <BulletList items={[
              'You must be at least 18 years old to create an account and make purchases on this platform.',
              'You are responsible for maintaining the confidentiality of your account credentials.',
              'You must provide accurate and complete information during registration.',
              'One person may not maintain multiple customer accounts.',
              'We reserve the right to suspend or terminate accounts that violate these terms.',
            ]} />
            <Box sx={{ p: 2, borderRadius: '12px', background: '#FFF3E0', border: '1px solid #FFB74D', display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <AlertTriangle size={16} color="#F57C00" style={{ flexShrink: 0, marginTop: 2 }} />
              <Typography fontSize={13} color="#E65100" lineHeight={1.65}>
                Any suspicious activity, fraudulent orders, or misuse of the platform will result
                in immediate account suspension without prior notice.
              </Typography>
            </Box>
          </Box>
        </ClauseBlock>

        {/* Clause 4 — Orders */}
        <ClauseBlock number="4" title="Orders & Product Listings">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography fontSize={13} color="text.secondary" lineHeight={1.7}>
              When you place an order on a store admin's storefront, you enter into a
              transaction directly with that admin. The platform facilitates the transaction
              but is not a party to the sale itself.
            </Typography>
            <BulletList items={[
              'All product information, images, and pricing are managed by the respective store admin.',
              'Placing an order constitutes an offer to purchase at the listed price.',
              'Order confirmation is sent after the 50% advance payment is received.',
              'The platform reserves the right to cancel orders in cases of fraudulent activity or pricing errors.',
              'Product availability is subject to stock held by the store admin.',
            ]} />
          </Box>
        </ClauseBlock>

        {/* Clause 5 — Payments */}
        <ClauseBlock number="5" title="Payment Terms">
          <Box sx={{
            display: 'flex', borderRadius: '14px', overflow: 'hidden',
            border: '1px solid #f0f0f0', mb: 2,
            flexDirection: { xs: 'column', sm: 'row' },
          }}>
            <Box sx={{
              flex: 1, p: 2, background: PINK[50],
              borderRight: { xs: 'none', sm: `2px dashed ${PINK[100]}` },
              borderBottom: { xs: `2px dashed ${PINK[100]}`, sm: 'none' },
            }}>
              <Typography fontWeight={900} fontSize={13} color={PINK[600]} mb={0.5}>First Payment — 50% Advance</Typography>
              <Typography fontSize={12.5} color="text.secondary" lineHeight={1.6}>
                Due at the time of placing your order. Confirms your order.
                <br /><strong style={{ color: '#D32F2F' }}>Strictly non-refundable.</strong>
              </Typography>
            </Box>
            <Box sx={{ flex: 1, p: 2, background: '#F3E5F5' }}>
              <Typography fontWeight={900} fontSize={13} color="#7B1FA2" mb={0.5}>Second Payment — 50% Balance</Typography>
              <Typography fontSize={12.5} color="text.secondary" lineHeight={1.6}>
                Due before or upon delivery of your order.
                <br /><strong style={{ color: '#D32F2F' }}>Strictly non-refundable.</strong>
              </Typography>
            </Box>
          </Box>
          <BulletList items={[
            'All payments must be made through the payment methods provided on the platform.',
            'Prices are listed in Indian Rupees (₹) and include applicable taxes unless stated otherwise.',
            'The platform uses secure, encrypted payment gateways. We do not store your full card details.',
            'Failed payments do not confirm an order. Re-attempt or contact support if a payment fails.',
          ]} />
        </ClauseBlock>

        {/* Clause 6 — No Refund */}
        <ClauseBlock number="6" title="Refund & Cancellation Policy">
          <Box sx={{ p: 2, borderRadius: '12px', background: '#FFEBEE', border: '1.5px solid #EF9A9A', display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 2 }}>
            <XCircle size={18} color="#D32F2F" style={{ flexShrink: 0, marginTop: 2 }} />
            <Typography fontSize={13} color="#B71C1C" fontWeight={700} lineHeight={1.65}>
              All payments made on this platform — advance (50%) and balance (50%) — are
              strictly non-refundable once processed. No exceptions.
            </Typography>
          </Box>
          <BulletList
            items={[
              'Refunds will not be issued for change of mind, accidental orders, or buyer\'s remorse.',
              'Order cancellations do not entitle the customer to a refund of any amount already paid.',
              'In case of a genuine dispute (e.g., item not delivered), the matter will be reviewed — but refunds are not guaranteed.',
              'For full details, refer to our Refund Policy page.',
            ]}
            color="#D32F2F"
            bg="#FFEBEE"
            icon={XCircle}
          />
        </ClauseBlock>

        {/* Clause 7 — Admin Responsibilities */}
        <ClauseBlock number="7" title="Store Admin Responsibilities">
          <Typography fontSize={13} color="text.secondary" lineHeight={1.7} mb={2}>
            Each store admin operating on this platform agrees to the following:
          </Typography>
          <BulletList items={[
            'Maintain accurate, up-to-date, and lawful product listings at all times.',
            'Fulfil orders in a timely manner after receiving payment confirmation.',
            'Communicate promptly with customers regarding order updates and issues.',
            'Not list prohibited, counterfeit, or illegal products on the platform.',
            'Comply with all applicable local, state, and national laws regarding the sale of goods.',
            'Not misuse customer data obtained through the platform for any unauthorised purpose.',
          ]} />
        </ClauseBlock>

        {/* Clause 8 — Prohibited Use */}
        <ClauseBlock number="8" title="Prohibited Activities">
          <Typography fontSize={13} color="text.secondary" lineHeight={1.7} mb={2}>
            The following activities are strictly prohibited on this platform:
          </Typography>
          <BulletList
            items={[
              'Placing fraudulent orders or using stolen payment credentials.',
              'Attempting to hack, reverse-engineer, or disrupt platform services.',
              'Creating fake reviews or manipulating product ratings.',
              'Using the platform to sell illegal, harmful, or counterfeit goods.',
              'Collecting other users\' personal data without their consent.',
              'Impersonating another user, admin, or platform representative.',
            ]}
            color="#D32F2F"
            bg="#FFEBEE"
            icon={XCircle}
          />
        </ClauseBlock>

        {/* Clause 9 — Liability */}
        <ClauseBlock number="9" title="Limitation of Liability">
          <Typography fontSize={13} color="text.secondary" lineHeight={1.75} mb={2}>
            To the maximum extent permitted by applicable law, the platform and its operators
            shall not be liable for:
          </Typography>
          <BulletList items={[
            'Any loss or damage resulting from a store admin\'s failure to fulfil an order.',
            'Delays in delivery caused by logistics partners or external circumstances.',
            'Indirect, incidental, or consequential damages arising from use of the platform.',
            'Temporary unavailability of the platform due to maintenance or technical issues.',
            'Any disputes between customers and store admins regarding product quality or condition.',
          ]} />
          <Box sx={{ mt: 2, p: 2, borderRadius: '12px', background: '#E3F2FD', border: '1px solid #90CAF9' }}>
            <Typography fontSize={13} color="#1565C0" lineHeight={1.65}>
              Our total liability in any dispute is limited to the amount actually paid by you
              for the specific order in question.
            </Typography>
          </Box>
        </ClauseBlock>

        {/* Clause 10 — Changes */}
        <ClauseBlock number="10" title="Changes to These Terms">
          <Typography fontSize={13} color="text.secondary" lineHeight={1.75}>
            We reserve the right to update or modify these Terms & Conditions at any time.
            When we do, we will update the "Last updated" date at the top of this page.
            Significant changes may be communicated via email or an in-app notification.
            Continued use of the platform after changes are made constitutes your acceptance
            of the revised terms. We encourage you to review this page periodically.
          </Typography>
        </ClauseBlock>

        {/* Clause 11 — Governing Law */}
        <ClauseBlock number="11" title="Governing Law & Jurisdiction">
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', flexShrink: 0, background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scale size={16} color="#388E3C" />
            </Box>
            <Typography fontSize={13} color="text.secondary" lineHeight={1.75}>
              These Terms & Conditions are governed by and construed in accordance with the
              laws of India. Any disputes arising out of or in connection with these terms
              shall be subject to the exclusive jurisdiction of the courts located in India.
              By using this platform, you consent to the personal jurisdiction of such courts.
            </Typography>
          </Box>
        </ClauseBlock>

        {/* Contact CTA */}
        <Box sx={{
          background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
          borderRadius: '20px', px: 3, py: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 2,
          boxShadow: '0 4px 20px rgba(240,98,146,0.25)',
        }}>
          <Box>
            <Typography fontWeight={900} fontSize={16} color="#fff">Questions about these terms?</Typography>
            <Typography fontSize={13} sx={{ color: 'rgba(255,255,255,0.8)' }}>
              We're happy to clarify anything before you shop.
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