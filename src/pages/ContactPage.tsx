import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Box, Typography, TextField, Button, CircularProgress,
} from '@mui/material';
import {
  ArrowLeft, Mail, User, MessageSquare, Send, CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
// import { contactService } from '../services/contactService';

const PINK = { 600: '#C2185B', 500: '#D81B60', 50: '#FFF0F6', 100: '#FCE4EC' };

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    background: '#fff',
    '& fieldset': { borderColor: '#f0d6e0' },
    '&:hover fieldset': { borderColor: PINK[500] },
    '&.Mui-focused fieldset': { borderColor: PINK[600], borderWidth: 2 },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: PINK[600] },
};

export const ContactPage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [form, setForm] = useState({ name: '', email: '', description: '' });
  const [errors, setErrors] = useState({ name: '', email: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors = { name: '', email: '', description: '' };
    let valid = true;

    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address';
      valid = false;
    }
    if (!form.description.trim()) {
      newErrors.description = 'Message is required';
      valid = false;
    } else if (form.description.trim().length < 10) {
      newErrors.description = 'Message must be at least 10 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (field: any) => (e: any) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };
  

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      // await contactService.submit(form);
      setSubmitted(true);
    } catch {
      enqueueSnackbar('Failed to send message. Please try again.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact ShopIzara – Resin Art Online Store India</title>
        <meta name="description" content="Contact ShopIzara for queries about handmade resin art products, custom orders, delivery, returns or any help. We're here to assist you." />
        <meta name="keywords" content="contact shopizara, resin art customer support, custom resin order india" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://shopizara.com/contact" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shopizara.com/contact" />
        <meta property="og:site_name" content="ShopIzara" />
        <meta property="og:title" content="Contact ShopIzara – Handmade Resin Art Store" />
        <meta property="og:description" content="Contact ShopIzara for queries about resin art products, custom orders or any help you need." />
        <meta property="og:image" content="https://shopizara.com/hero/r-3.jpg" />
        <meta property="og:locale" content="en_IN" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Contact ShopIzara – Resin Art Store" />
      </Helmet>
    <Box sx={{ background: '#f7f7fa', minHeight: '100vh' }}>
      {/* Top breadcrumb bar */}
      <Box sx={{
        background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
        px: { xs: 2, md: 4 }, py: 1.5,
        display: 'flex', alignItems: 'center', gap: 1,
      }}>
        <Box
          onClick={() => navigate(-1)}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: 'rgba(255,255,255,0.85)', cursor: 'pointer', '&:hover': { color: '#fff' } }}
        >
          <ArrowLeft size={16} />
          <Typography fontSize={13} fontWeight={600}>Back</Typography>
        </Box>
        <Typography fontSize={13} sx={{ color: 'rgba(255,255,255,0.5)', mx: 0.5 }}>/</Typography>
        <Typography fontSize={13} fontWeight={700} color="#fff">Contact Us</Typography>
      </Box>

      <Box sx={{ maxWidth: 600, mx: 'auto', px: { xs: 1.5, sm: 2, md: 3 }, py: 4 }}>

        {/* Header card */}
        <Box sx={{
          background: '#fff', borderRadius: '20px', overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.07)', mb: 3,
        }}>
          <Box sx={{
            background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
            px: 3, py: 2.5,
            display: 'flex', alignItems: 'center', gap: 1.5,
          }}>
            <Mail size={22} color="#fff" />
            <Box>
              <Typography fontWeight={900} fontSize={18} color="#fff">Contact Us</Typography>
              <Typography fontSize={12} sx={{ color: 'rgba(255,255,255,0.75)' }}>
                We'd love to hear from you
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {!submitted ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Name */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '8px', background: PINK[50], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={13} color={PINK[600]} />
                    </Box>
                    <Typography fontSize={13} fontWeight={700} color="#444">Your Name</Typography>
                  </Box>
                  <TextField
                    fullWidth
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange('name')}
                    error={!!errors.name}
                    helperText={errors.name}
                    size="small"
                    sx={inputSx}
                  />
                </Box>

                {/* Email */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '8px', background: PINK[50], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mail size={13} color={PINK[600]} />
                    </Box>
                    <Typography fontSize={13} fontWeight={700} color="#444">Email Address</Typography>
                  </Box>
                  <TextField
                    fullWidth
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange('email')}
                    error={!!errors.email}
                    helperText={errors.email}
                    size="small"
                    sx={inputSx}
                  />
                </Box>

                {/* Description */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.8 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '8px', background: PINK[50], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MessageSquare size={13} color={PINK[600]} />
                    </Box>
                    <Typography fontSize={13} fontWeight={700} color="#444">Your Message</Typography>
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Write your message here..."
                    value={form.description}
                    onChange={handleChange('description')}
                    error={!!errors.description}
                    helperText={errors.description}
                    sx={inputSx}
                  />
                </Box>

                {/* Submit */}
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <Send size={16} />}
                  sx={{
                    background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
                    color: '#fff',
                    borderRadius: '30px',
                    py: 1.2,
                    fontWeight: 800,
                    fontSize: 15,
                    boxShadow: `0 4px 14px ${PINK[100]}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, #e0527a, ${PINK[600]})`,
                      boxShadow: `0 6px 18px ${PINK[100]}`,
                    },
                    '&:disabled': { background: '#f5c6d5', color: '#fff' },
                  }}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </Box>
            ) : (
              /* Success state */
              <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
                <Box sx={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: '#E8F5E9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mx: 'auto', mb: 2,
                }}>
                  <CheckCircle2 size={36} color="#388E3C" />
                </Box>
                <Typography fontWeight={900} fontSize={20} mb={0.8}>Message Sent!</Typography>
                <Typography fontSize={14} color="text.secondary" mb={3}>
                  Thanks for reaching out. We'll get back to you shortly.
                </Typography>
                <Button
                  onClick={() => { setForm({ name: '', email: '', description: '' }); setSubmitted(false); }}
                  variant="outlined"
                  sx={{
                    borderColor: PINK[500], color: PINK[600], borderRadius: '30px',
                    px: 3, fontWeight: 700,
                    '&:hover': { borderColor: PINK[600], background: PINK[50] },
                  }}
                >
                  Send Another Message
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
    </>
  );
};