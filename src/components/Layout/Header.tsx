import { useState } from 'react';
import { Box, Avatar, Menu, MenuItem, Divider, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, LogOut, Lock, Tag, Package } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { useAuth } from '../../contexts/AuthContext';

const PINK = {
  600: '#C2185B',
  500: '#E91E8C',
};

const NAV_H = 64;

export const Header = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const cartCount = useAppSelector((state) => state.cart.items.length);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleAvatarClick = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    signOut();
    navigate('/login');
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1200,
        background: `linear-gradient(90deg, ${PINK[600]} 0%, ${PINK[500]} 100%)`,
        height: NAV_H,
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(194,24,91,0.35)',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 1280,
          mx: 'auto',
          px: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
        }}
      >
        {/* Logo */}
        <Box
          onClick={() => navigate('/')}
          sx={{ color: '#fff', fontWeight: 800, fontSize: 24, cursor: 'pointer' }}
        >
          ResinArt
        </Box>

        {/* Search */}
        <Box
          sx={{
            flex: 1,
            maxWidth: 500,
            background: '#fff',
            borderRadius: 1,
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            overflow: 'hidden',
            height: 40,
          }}
        >
          <input
            placeholder="Search products..."
            style={{ flex: 1, padding: '0 10px', border: 'none', outline: 'none' }}
          />
          <Box
            sx={{
              background: PINK[500],
              px: 2,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <Search size={18} color="#fff" />
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2, ml: 'auto', alignItems: 'center' }}>
          {/* Cart */}
          <Box
            onClick={() => navigate('/cart')}
            sx={{
              color: '#fff',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -6,
                  right: -10,
                  background: '#FFD54F',
                  borderRadius: '50%',
                  fontSize: 10,
                  px: 0.6,
                }}
              >
                {cartCount}
              </Box>
            )}
            Cart
          </Box>

          {/* Auth area */}
          {isAuthenticated && user ? (
            <>
              <Avatar
                src={user.avatar_url}
                onClick={handleAvatarClick}
                sx={{
                  width: 34,
                  height: 34,
                  fontSize: 13,
                  fontWeight: 700,
                  bgcolor: 'rgba(255,255,255,0.25)',
                  color: '#fff',
                  cursor: 'pointer',
                  border: '2px solid rgba(255,255,255,0.6)',
                  '&:hover': { opacity: 0.85 },
                }}
              >
                {initials}
              </Avatar>

              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{ paper: { sx: { mt: 1, minWidth: 200, borderRadius: 2 } } }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography fontWeight={700} fontSize={14} noWrap>
                    {user.full_name || user.name || 'User'}
                  </Typography>
                  <Typography fontSize={12} color="text.secondary" noWrap>
                    {user.email}
                  </Typography>
                </Box>
                <Divider />

                <MenuItem
                  onClick={() => { handleMenuClose(); navigate('/profile'); }}
                  sx={{ gap: 1.5, fontSize: 14 }}
                >
                  <User size={15} /> My Profile
                </MenuItem>
                <MenuItem
                  onClick={() => { handleMenuClose(); navigate('/change-password'); }}
                  sx={{ gap: 1.5, fontSize: 14 }}
                >
                  <Lock size={15} /> Change Password
                </MenuItem>

                {user?.is_admin && (
                  <MenuItem
                    onClick={() => { handleMenuClose(); navigate('/admin/categories'); }}
                    sx={{ gap: 1.5, fontSize: 14, color: PINK[600], fontWeight: 600 }}
                  >
                    <Tag size={15} /> Manage Categories
                  </MenuItem>
                )}
                {user?.is_admin && (
                  <MenuItem
                    onClick={() => { handleMenuClose(); navigate('/admin/products'); }}
                    sx={{ gap: 1.5, fontSize: 14, color: PINK[600], fontWeight: 600 }}
                  >
                    <Package size={15} /> Manage Products
                  </MenuItem>
                )}

                <Divider />
                <MenuItem onClick={handleLogout} sx={{ gap: 1.5, fontSize: 14, color: 'error.main' }}>
                  <LogOut size={15} /> Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box
              onClick={() => navigate('/login')}
              sx={{
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <User size={18} />
              Login
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
