import { Box, Typography } from '@mui/material';
import {
  ArrowLeft, ShieldX, CreditCard, AlertTriangle,
  CheckCircle2, XCircle, HelpCircle, Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PINK = { 600: '#C2185B', 500: '#D81B60', 50: '#FFF0F6', 100: '#FCE4EC' };

const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: 1 }}>
    <Icon size={17} color={PINK[600]} />
    <Typography fontWeight={800} fontSize={15}>{title}</Typography>
  </Box>
);

const PolicyPoint = ({
  icon: Icon, iconColor, iconBg, title, desc,
}: { icon: any; iconColor: string; iconBg: string; title: string; desc: string }) => (
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

const TimelineStep = ({
  step, label, sub, isLast,
}: { step: string; label: string; sub: string; isLast?: boolean }) => (
  <Box sx={{ display: 'flex', gap: 2 }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Typography fontSize={12} fontWeight={900} color="#fff">{step}</Typography>
      </Box>
      {!isLast && <Box sx={{ width: 2, flex: 1, background: '#f0e0e6', my: 0.5, minHeight: 24 }} />}
    </Box>
    <Box sx={{ pb: isLast ? 0 : 2.5, pt: 0.4 }}>
      <Typography fontWeight={800} fontSize={14}>{label}</Typography>
      <Typography fontSize={12.5} color="text.secondary" lineHeight={1.6}>{sub}</Typography>
    </Box>
  </Box>
);

export const RefundPolicy = () => {
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
        <Typography fontSize={13} fontWeight={700} color="#fff">Refund Policy</Typography>
      </Box>

      <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 1.5, sm: 2, md: 3 }, py: 3 }}>

        {/* ── Hero banner ── */}
        <Box sx={{
          background: '#fff', borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.07)', mb: 3,
        }}>
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
                <ShieldX size={24} color="#fff" />
              </Box>
              <Box>
                <Typography fontWeight={900} fontSize={{ xs: 18, sm: 24 }} color="#fff" lineHeight={1.1}>
                  Refund Policy
                </Typography>
                <Typography fontSize={12} sx={{ color: 'rgba(255,255,255,0.75)' }}>
                  Please read carefully before placing your order
                </Typography>
              </Box>
            </Box>
            <Typography fontSize={{ xs: 13, sm: 14 }} sx={{ color: 'rgba(255,255,255,0.88)', lineHeight: 1.7, maxWidth: 520 }}>
              We believe in full transparency. Our payment and refund terms are simple, fair,
              and clearly defined — so you always know what to expect before you shop.
            </Typography>
          </Box>

          {/* Last updated */}
          <Box sx={{
            px: 3, py: 1.5, background: PINK[50],
            display: 'flex', alignItems: 'center', gap: 1,
          }}>
            <Clock size={13} color={PINK[600]} />
            <Typography fontSize={12} color="text.secondary">
              Last updated: <strong>may 2026</strong> &nbsp;·&nbsp; Applies to all orders placed on this platform
            </Typography>
          </Box>
        </Box>

        {/* ── No Refund Policy ── */}
        <Box sx={{
          background: '#fff', borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', mb: 3,
        }}>
          <SectionHeader icon={XCircle} title="No Refund Policy" />

          {/* Big alert */}
          <Box sx={{
            mx: { xs: 2, sm: 3 }, mt: 2.5,
            p: 2, borderRadius: '14px',
            background: '#FFF3E0',
            border: '1.5px solid #FFB74D',
            display: 'flex', gap: 1.5, alignItems: 'flex-start',
          }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
              background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={18} color="#F57C00" />
            </Box>
            <Box>
              <Typography fontWeight={900} fontSize={14} color="#E65100" mb={0.3}>
                Important Notice — No Refunds After Payment
              </Typography>
              <Typography fontSize={13} color="#BF360C" lineHeight={1.65}>
                Once a payment is made — whether it is the initial 50% advance or the remaining 50%
                balance — <strong>it is strictly non-refundable</strong>. By proceeding with your order
                and making payment, you fully agree to this policy.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 }, pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <PolicyPoint
              icon={XCircle}
              iconColor="#D32F2F"
              iconBg="#FFEBEE"
              title="No Refunds on Advance Payment (50%)"
              desc="The 50% advance payment made at the time of placing your order is completely non-refundable under any circumstances, including order cancellation, change of mind, or product unavailability."
            />
            <Box sx={{ height: 1, background: '#f5f5f5' }} />
            <PolicyPoint
              icon={XCircle}
              iconColor="#D32F2F"
              iconBg="#FFEBEE"
              title="No Refunds on Balance Payment (50%)"
              desc="The remaining 50% payment made before or after delivery is also non-refundable once processed. Ensure you are satisfied with your order before completing the balance payment."
            />
            <Box sx={{ height: 1, background: '#f5f5f5' }} />
            <PolicyPoint
              icon={ShieldX}
              iconColor="#7B1FA2"
              iconBg="#F3E5F5"
              title="No Exceptions to This Policy"
              desc="We do not offer refunds for reasons including but not limited to: change of mind, delivery delays, product dissatisfaction, or accidental orders. Please review your order carefully before payment."
            />
          </Box>
        </Box>

        {/* ── Payment Structure ── */}
        <Box sx={{
          background: '#fff', borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', mb: 3,
        }}>
          <SectionHeader icon={CreditCard} title="Payment Structure — 50% + 50%" />

          {/* Visual split card */}
          <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 1 }}>
            <Box sx={{
              display: 'flex', borderRadius: '14px', overflow: 'hidden',
              border: '1px solid #f0f0f0',
              flexDirection: { xs: 'column', sm: 'row' },
            }}>
              {/* First half */}
              <Box sx={{
                flex: 1, p: 2.5, background: PINK[50],
                borderRight: { xs: 'none', sm: `2px dashed ${PINK[100]}` },
                borderBottom: { xs: `2px dashed ${PINK[100]}`, sm: 'none' },
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ width: 28, height: 28, borderRadius: '8px', background: PINK[100], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography fontSize={13} fontWeight={900} color={PINK[600]}>1</Typography>
                  </Box>
                  <Typography fontWeight={800} fontSize={14} color={PINK[600]}>First Payment — 50%</Typography>
                </Box>
                <Typography fontSize={22} fontWeight={900} color={PINK[600]} mb={0.5}>Advance</Typography>
                <Typography fontSize={12.5} color="text.secondary" lineHeight={1.6}>
                  Paid at the time of placing your order. This confirms and reserves your order.
                  <br /><strong style={{ color: '#D32F2F' }}>Non-refundable.</strong>
                </Typography>
              </Box>

              {/* Second half */}
              <Box sx={{ flex: 1, p: 2.5, background: '#F3E5F5' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ width: 28, height: 28, borderRadius: '8px', background: '#E1BEE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography fontSize={13} fontWeight={900} color="#7B1FA2">2</Typography>
                  </Box>
                  <Typography fontWeight={800} fontSize={14} color="#7B1FA2">Second Payment — 50%</Typography>
                </Box>
                <Typography fontSize={22} fontWeight={900} color="#7B1FA2" mb={0.5}>Balance</Typography>
                <Typography fontSize={12.5} color="text.secondary" lineHeight={1.6}>
                  Paid after the order is processed and ready, before or upon delivery.
                  <br /><strong style={{ color: '#D32F2F' }}>Non-refundable.</strong>
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Timeline */}
          <Box sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
            <Typography fontWeight={800} fontSize={13} color="text.secondary" mb={2} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Order Payment Flow
            </Typography>
            <TimelineStep
              step="1"
              label="Place Your Order"
              sub="Browse products and add items to your cart."
            />
            <TimelineStep
              step="2"
              label="Pay 50% Advance"
              sub="Complete the first half of the total amount to confirm your order. This is non-refundable."
            />
            <TimelineStep
              step="3"
              label="Order Processing"
              sub="Your order is confirmed and prepared by the seller."
            />
            <TimelineStep
              step="4"
              label="Pay Remaining 50%"
              sub="Complete the balance payment before or at the time of delivery. Also non-refundable."
              isLast
            />
          </Box>
        </Box>

        {/* ── What IS covered ── */}
        <Box sx={{
          background: '#fff', borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', mb: 3,
        }}>
          <SectionHeader icon={CheckCircle2} title="What We Do Ensure" />
          <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[
              'Product listings are accurate and up to date before you pay',
              'You receive an order confirmation with full details after each payment',
              'Order tracking is available from placement to delivery',
              'Our support team is available to assist with genuine order issues',
              'In rare cases of a seller-side error, the matter will be reviewed by our team',
            ].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box sx={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.1,
                }}>
                  <CheckCircle2 size={13} color="#388E3C" />
                </Box>
                <Typography fontSize={13.5} color="text.secondary" lineHeight={1.6}>{item}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── FAQ ── */}
        <Box sx={{
          background: '#fff', borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', mb: 3,
        }}>
          <SectionHeader icon={HelpCircle} title="Frequently Asked Questions" />
          <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              {
                q: 'Can I cancel my order after paying the advance?',
                a: 'You may request a cancellation before the order enters processing, but the 50% advance payment will not be refunded regardless of the cancellation.',
              },
              {
                q: 'What if I change my mind after paying the full amount?',
                a: 'Unfortunately, we cannot process refunds for change-of-mind situations. All payments are final once made.',
              },
              {
                q: 'What if the product I received is damaged?',
                a: 'Please contact the store admin or our support team immediately with photo evidence. Damaged or incorrect product cases are reviewed individually.',
              },
              {
                q: 'Why is the payment split into two halves?',
                a: 'The 50-50 payment model protects both the buyer and the seller — the advance confirms your order commitment, and the balance ensures the seller delivers before full payment is collected.',
              },
            ].map((faq, i) => (
              <Box key={i}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 0.5 }}>
                  <Box sx={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: PINK[50], display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.1,
                  }}>
                    <HelpCircle size={12} color={PINK[600]} />
                  </Box>
                  <Typography fontWeight={800} fontSize={13.5}>{faq.q}</Typography>
                </Box>
                <Typography fontSize={13} color="text.secondary" lineHeight={1.65} ml={4}>{faq.a}</Typography>
                {i < 3 && <Box sx={{ height: 1, background: '#f5f5f5', mt: 2 }} />}
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Footer CTA ── */}
        <Box sx={{
          background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
          borderRadius: '20px', px: 3, py: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 2,
          boxShadow: '0 4px 20px rgba(240,98,146,0.25)',
        }}>
          <Box>
            <Typography fontWeight={900} fontSize={16} color="#fff">Have more questions?</Typography>
            <Typography fontSize={13} sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Reach out to us before placing your order.
            </Typography>
          </Box>
          <Box
            onClick={() => navigate('/contact')}
            sx={{
              background: '#fff', color: PINK[600],
              px: 2.5, py: 1, borderRadius: '30px',
              fontWeight: 800, fontSize: 14, cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
              '&:hover': { background: PINK[50] },
              whiteSpace: 'nowrap',
            }}
          >
            Contact Us →
          </Box>
        </Box>

      </Box>
    </Box>
  );
};