import { useState } from 'react';
import { Box, Typography, TextField, Button, Checkbox, FormControlLabel, Link as MuiLink } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from 'notistack';

const PINK = {
  600: '#C2185B',
  500: '#E91E8C',
};

const validationSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from || '/';

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await signIn(values.email, values.password);
        enqueueSnackbar('Welcome back!', { variant: 'success' });
        navigate(from, { replace: true });
      } catch (err: any) {
        enqueueSnackbar(
          err.response?.data?.message || err.message || 'Login failed',
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
            "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography fontSize={48} fontWeight={800} mb={2}>
            Welcome Back
          </Typography>
          <Typography maxWidth={400} sx={{ opacity: 0.8 }}>
            Login to continue exploring beautiful resin art products.
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
            Sign in
          </Typography>
          <Typography fontSize={14} color="text.secondary" mb={3}>
            Don't have an account?{' '}
            <MuiLink component={Link} to="/register" underline="hover" fontWeight={600} color={PINK[500]}>
              Register here
            </MuiLink>
          </Typography>

          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              placeholder="Email Address"
              name="email"
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

            <FormControlLabel
              control={<Checkbox />}
              label="Remember Me"
              sx={{ mt: 1 }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                mt: 2,
                background: PINK[500],
                '&:hover': { background: PINK[600] },
                py: 1.2,
                fontWeight: 600,
              }}
            >
              {loading ? 'Signing in…' : 'Sign in now'}
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  );
};
