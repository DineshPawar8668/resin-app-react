import { useState } from 'react';
import { Box, Typography, TextField, Button, Link as MuiLink } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';

const PINK = {
  600: '#F06292',
  500: '#FCE4EC',
};

const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '', confirmPassword: '' },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await signUp(values.email, values.password, values.name);
        enqueueSnackbar('Account created! Please sign in.', { variant: 'success' });
        navigate('/login');
      } catch (err: any) {
        enqueueSnackbar(
          err.response?.data?.message || err.message || 'Registration failed',
          { variant: 'error' }
        );
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* LEFT — decorative image panel */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          px: 8,
          color: '#fff',
          backgroundImage:
            "url('https://images.unsplash.com/photo-1579965342575-16428a7c8881')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography fontSize={48} fontWeight={800} mb={2}>
            Join Us
          </Typography>
          <Typography maxWidth={400} sx={{ opacity: 0.8 }}>
            Create an account and start discovering beautiful handcrafted resin art.
          </Typography>
        </Box>
      </Box>

      {/* RIGHT — form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 380 }}>
          <Typography fontSize={28} fontWeight={700} mb={1}>
            Create Account
          </Typography>
          <Typography fontSize={14} color="text.secondary" mb={3}>
            Already have an account?{' '}
            <MuiLink component={Link} to="/login" underline="hover" fontWeight={600} color={PINK[500]}>
              Sign in
            </MuiLink>
          </Typography>

          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              placeholder="Full Name"
              name="name"
              margin="normal"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />

            <TextField
              fullWidth
              placeholder="Email Address"
              name="email"
              type="email"
              margin="normal"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />

            <TextField
              fullWidth
              placeholder="Password"
              type="password"
              name="password"
              margin="normal"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />

            <TextField
              fullWidth
              placeholder="Confirm Password"
              type="password"
              name="confirmPassword"
              margin="normal"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                background: PINK[500],
                '&:hover': { background: PINK[600] },
                py: 1.2,
                fontWeight: 600,
              }}
            >
              {loading ? 'Creating Account…' : 'Create Account'}
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  );
};
