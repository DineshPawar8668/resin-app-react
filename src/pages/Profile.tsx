import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Divider,
  Button,
  CircularProgress,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { authService } from '../services/authService';
import { useSnackbar } from 'notistack';
import { UserProfile } from '../types';
import { Lock, User, Tag } from 'lucide-react';

const PINK = { 600: '#F06292', 500: '#F48FB1' };

export const Profile = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const reduxUser = useAppSelector((state) => state.auth.user);
  const [profile, setProfile] = useState<UserProfile | null>(reduxUser);
  const [loading, setLoading] = useState(!reduxUser);

  useEffect(() => {
    authService
      .getProfile()
      .then(({ data }) => {
        const raw = data;
        setProfile({
          id: raw.id ?? raw._id ?? '',
          email: raw.email ?? '',
          name: raw.name ?? raw.name ?? '',
          avatar_url: raw.avatar_url,
          is_admin: raw.is_admin ?? false,
          created_at: raw.created_at ?? '',
          updated_at: raw.updated_at ?? '',
        });
      })
      .catch(() => {
        enqueueSnackbar('Failed to load profile', { variant: 'error' });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) return null;

  const initials = profile.name
    ? profile?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : profile?.email[0]?.toUpperCase();

  console.log("profile???", profile)
  // alert(JSON.stringify(profile))
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
          maxWidth: 480,
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
            py: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Avatar
            src={profile.avatar_url}
            sx={{
              width: 80,
              height: 80,
              fontSize: 28,
              fontWeight: 700,
              bgcolor: 'rgba(255,255,255,0.25)',
              color: '#fff',
              border: '3px solid rgba(255,255,255,0.6)',
            }}
          >
            {initials}
          </Avatar>
          <Typography fontWeight={700} fontSize={20} color="#fff">
            {profile.name || '—'}
          </Typography>
          {profile.is_admin && (
            <Typography
              fontSize={11}
              fontWeight={600}
              sx={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                px: 1.5,
                py: 0.3,
                borderRadius: 10,
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              Admin
            </Typography>
          )}
        </Box>

        {/* Details */}
        <Box sx={{ px: 4, py: 3 }}>
          <ProfileRow label="Full Name" value={profile.name || '—'} />
          <Divider sx={{ my: 1.5 }} />
          <ProfileRow label="Email" value={profile.email} />
          {profile.created_at && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <ProfileRow
                label="Member since"
                value={new Date(profile.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              />
            </>
          )}
        </Box>

        <Divider />

        {/* Actions */}
        <Box sx={{ px: 4, py: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<Lock size={16} />}
            onClick={() => navigate('/change-password')}
            sx={{
              background: PINK[500],
              '&:hover': { background: PINK[600] },
              fontWeight: 600,
              py: 1.1,
            }}
          >
            Change Password
          </Button>
          <Button
            variant="outlined"
            startIcon={<User size={16} />}
            onClick={() => navigate('/')}
            sx={{ fontWeight: 600, py: 1.1 }}
          >
            Back to Home
          </Button>
        </Box>

        {/* Admin Section */}
        {profile.is_admin && (
          <>
            <Divider />
            <Box sx={{ px: 4, py: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography
                fontSize={11}
                fontWeight={700}
                color="text.disabled"
                textTransform="uppercase"
                letterSpacing={1}
              >
                Admin
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Tag size={16} />}
                onClick={() => navigate('/admin/categories')}
                sx={{
                  fontWeight: 600,
                  py: 1.1,
                  borderColor: PINK[500],
                  color: PINK[500],
                  '&:hover': {
                    borderColor: PINK[600],
                    bgcolor: 'rgba(194,24,91,0.04)',
                  },
                }}
              >
                Manage Categories
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

const ProfileRow = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
    <Typography fontSize={13} color="text.secondary" fontWeight={500}>
      {label}
    </Typography>
    <Typography fontSize={13} fontWeight={600}>
      {value}
    </Typography>
  </Box>
);
