import { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, IconButton, InputAdornment } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useSnackbar } from 'notistack';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

const PINK = { 600: '#C2185B', 500: '#D81B60' };

const validationSchema = yup.object({
  current_password: yup.string().required('Current password is required'),
  new_password: yup
    .string()
    .min(6, 'Minimum 6 characters')
    .required('New password is required'),
  confirm_password: yup
    .string()
    .oneOf([yup.ref('new_password')], 'Passwords must match')
    .required('Please confirm your new password'),
});

export const ChangePassword = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const formik = useFormik({
    initialValues: { current_password: '', new_password: '', confirm_password: '' },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await authService.changePassword({
          current_password: values.current_password,
          new_password: values.new_password,
        });
        enqueueSnackbar('Password changed successfully!', { variant: 'success' });
        navigate('/profile');
      } catch (err: any) {
        enqueueSnackbar(
          err.response?.data?.message || err.message || 'Failed to change password',
          { variant: 'error' }
        );
      } finally {
        setLoading(false);
      }
    },
  });

  const visibilityAdornment = (show: boolean, toggle: () => void) => ({
    endAdornment: (
      <InputAdornment position="end">
        <IconButton size="small" onClick={toggle} edge="end">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </IconButton>
      </InputAdornment>
    ),
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        pt: 6,
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Header banner */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${PINK[600]} 0%, ${PINK[500]} 100%)`,
            px: 4,
            py: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <IconButton
            size="small"
            onClick={() => navigate('/profile')}
            sx={{ color: '#fff', p: 0.5 }}
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Typography fontWeight={700} fontSize={18} color="#fff">
              Change Password
            </Typography>
            <Typography fontSize={12} sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Keep your account secure
            </Typography>
          </Box>
        </Box>

        {/* Form */}
        <Box sx={{ px: 4, py: 4 }}>
          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              placeholder="Current Password"
              name="current_password"
              type={showCurrent ? 'text' : 'password'}
              margin="normal"
              value={formik.values.current_password}
              onChange={formik.handleChange}
              error={formik.touched.current_password && Boolean(formik.errors.current_password)}
              helperText={formik.touched.current_password && formik.errors.current_password}
              InputProps={visibilityAdornment(showCurrent, () => setShowCurrent((v) => !v))}
            />

            <TextField
              fullWidth
              placeholder="New Password"
              name="new_password"
              type={showNew ? 'text' : 'password'}
              margin="normal"
              value={formik.values.new_password}
              onChange={formik.handleChange}
              error={formik.touched.new_password && Boolean(formik.errors.new_password)}
              helperText={formik.touched.new_password && formik.errors.new_password}
              InputProps={visibilityAdornment(showNew, () => setShowNew((v) => !v))}
            />

            <TextField
              fullWidth
              placeholder="Confirm New Password"
              name="confirm_password"
              type={showConfirm ? 'text' : 'password'}
              margin="normal"
              value={formik.values.confirm_password}
              onChange={formik.handleChange}
              error={formik.touched.confirm_password && Boolean(formik.errors.confirm_password)}
              helperText={formik.touched.confirm_password && formik.errors.confirm_password}
              InputProps={visibilityAdornment(showConfirm, () => setShowConfirm((v) => !v))}
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
              {loading ? 'Updating…' : 'Update Password'}
            </Button>
          </form>
        </Box>
      </Paper>
    </Box>
  );
};
