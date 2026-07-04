import { useState, useEffect } from "react";
import { Box, Avatar, Menu, MenuItem, Divider, Typography, InputBase, IconButton, Drawer, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { productService } from "../../services/productService";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingCart, User, LogOut, Lock, Tag, Package, ClipboardList, ShoppingBag, Heart, X, Menu as MenuIcon, Phone, Info } from "lucide-react";
import { useAppSelector } from "../../store/hooks";
import { useAuth } from "../../contexts/AuthContext";

const C = {
  pink: "#C2185B",
  pinkDark: "#880E4F",
  pinkLight: "#FCE4EC",
  teal: "#0097A7",
  bar: "#D81B60",
  white: "#FFFFFF",
  text: "#111111",
  grey: "#555555",
};

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const cartCount = useAppSelector((state) => state.cart.items.length);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [barVisible, setBarVisible] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuOpen = Boolean(anchorEl);

  useEffect(() => {
    productService.getCategories().then(setCategories).catch(() => {});
  }, []);

  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    handleMenuClose();
    signOut();
    navigate("/login");
  };

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user?.email?.[0]?.toUpperCase() ?? "U");

  return (
    <Box sx={{ position: "sticky", top: 0, zIndex: 1200 }}>
      {/* ── Announcement Bar ── */}
      {/* {barVisible && (
        <Box
          sx={{
            background: C.bar,
            color: '#fff',
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 600,
            py: 0.8,
            px: 4,
            letterSpacing: 0.5,
            position: 'relative',
          }}
        >
          Free Shipping on Orders ₹999+ &nbsp;|&nbsp; Handcrafted Resin Art
          <IconButton
            size="small"
            onClick={() => setBarVisible(false)}
            sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#fff', p: 0.3 }}
          >
            <X size={14} />
          </IconButton>
        </Box>
      )} */}

      {/* ── Main Navbar ── */}
      <Box
        sx={{
          background: C.white,
          borderBottom: "1px solid #f0f0f0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <Box
          sx={{
            maxWidth: 1280,
            mx: "auto",
            px: { xs: 2, md: 3 },
            height: 64,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* Hamburger — mobile only */}
          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { xs: "flex", md: "none" }, color: C.grey, mr: 0.5, "&:hover": { color: C.pink } }}
          >
            <MenuIcon size={22} />
          </IconButton>

          {/* Logo */}
          <Box onClick={() => navigate("/")} sx={{ cursor: "pointer", flexShrink: 0 }}>
            <Typography
              sx={{
                fontFamily: '"Dancing Script", "Brush Script MT", cursive',
                fontSize: { xs: 22, md: 28 },
                fontWeight: 700,
                color: C.pink,
                lineHeight: 1,
              }}
            >
              Shopi Nova
            </Typography>
            <Typography sx={{ fontSize: 9, color: C.teal, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase" }}>
              Plus
            </Typography>
          </Box>

          {/* Nav Links */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3.5, ml: 4 }}>
            {[
              { label: "Shop", path: "/products" },
              { label: "About Us", path: "/about-us" },
              { label: "Privacy Policy", path: "/privacy-policy" },
              { label: "Terms & Condition", path: "/terms-and-conditions" },
              { label: "Refund Policy", path: "/refund-policy" },
              { label: "Contact", path: "/contact" },
            ].map((item) => (
              <Typography
                key={item.label}
                onClick={() => navigate(item.path)}
                sx={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: C.text,
                  cursor: "pointer",
                  position: "relative",
                  pb: 0.3,
                  "&:hover": { color: C.pink },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: 0,
                    height: "1.5px",
                    background: C.pink,
                    transition: "width 0.2s ease",
                  },
                  "&:hover::after": { width: "100%" },
                }}
              >
                {item.label}
              </Typography>
            ))}
          </Box>

          <Box sx={{ flex: 1 }} />

          {/* Search */}
          {/* {searchOpen ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                border: `1.5px solid ${C.pink}`,
                borderRadius: "20px",
                px: 1.5,
                height: 36,
                minWidth: { xs: 160, md: 260 },
                background: "#fff",
              }}
            >
              <Search size={14} color={C.pink} />
              <InputBase
                autoFocus
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search products..."
                sx={{ ml: 1, flex: 1, fontSize: 13 }}
              />
              <IconButton
                size="small"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchVal("");
                }}
                sx={{ p: 0.3 }}
              >
                <X size={14} color={C.grey} />
              </IconButton>
            </Box>
          ) : (
            <IconButton onClick={() => setSearchOpen(true)} sx={{ color: C.grey, "&:hover": { color: C.pink } }}>
              <Search size={20} />
            </IconButton>
          )} */}

          {/* Wishlist */}
          {/* <IconButton onClick={() => navigate("/wishlist")} sx={{ color: C.grey, "&:hover": { color: C.pink }, display: { xs: "none", sm: "flex" } }}>
            <Heart size={20} />
          </IconButton> */}

          {/* Cart */}
          <IconButton onClick={() => navigate("/cart")} sx={{ color: C.grey, "&:hover": { color: C.pink }, position: "relative" }}>
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 16,
                  height: 16,
                  background: C.pink,
                  color: "#fff",
                  borderRadius: "50%",
                  fontSize: 9,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cartCount}
              </Box>
            )}
          </IconButton>

          {/* Account */}
          {isAuthenticated && user ? (
            <>
              <Avatar
                src={user.avatar_url}
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: 12,
                  fontWeight: 700,
                  bgcolor: C.pink,
                  color: "#fff",
                  cursor: "pointer",
                  "&:hover": { opacity: 0.85 },
                }}
              >
                {initials}
              </Avatar>

              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                slotProps={{ paper: { sx: { mt: 1, minWidth: 210, borderRadius: 2, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" } } }}
              >
                <Box sx={{ px: 2, py: 1.5, background: C.pinkLight }}>
                  <Typography fontWeight={700} fontSize={13} noWrap color={C.pinkDark}>
                    {user.full_name || user.name || "User"}
                  </Typography>
                  <Typography fontSize={11} color="text.secondary" noWrap>
                    {user.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate("/profile");
                  }}
                  sx={{ gap: 1.5, fontSize: 13, py: 1.2 }}
                >
                  <User size={14} color={C.pink} /> My Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate("/change-password");
                  }}
                  sx={{ gap: 1.5, fontSize: 13, py: 1.2 }}
                >
                  <Lock size={14} color={C.pink} /> Change Password
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate("/my-orders");
                  }}
                  sx={{ gap: 1.5, fontSize: 13, py: 1.2 }}
                >
                  <ShoppingBag size={14} color={C.pink} /> My Orders
                </MenuItem>

                {user?.is_admin && <Divider />}
                {user?.is_admin && (
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      navigate("/admin/categories");
                    }}
                    sx={{ gap: 1.5, fontSize: 13, py: 1.2, color: C.pink, fontWeight: 600 }}
                  >
                    <Tag size={14} /> Manage Categories
                  </MenuItem>
                )}
                {user?.is_admin && (
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      navigate("/admin/products");
                    }}
                    sx={{ gap: 1.5, fontSize: 13, py: 1.2, color: C.pink, fontWeight: 600 }}
                  >
                    <Package size={14} /> Manage Products
                  </MenuItem>
                )}
                {user?.is_admin && (
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      navigate("/admin/orders");
                    }}
                    sx={{ gap: 1.5, fontSize: 13, py: 1.2, color: C.pink, fontWeight: 600 }}
                  >
                    <ClipboardList size={14} /> Manage Orders
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ gap: 1.5, fontSize: 13, py: 1.2, color: "error.main" }}>
                  <LogOut size={14} /> Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <IconButton onClick={() => navigate("/login")} sx={{ color: C.grey, "&:hover": { color: C.pink } }}>
              <User size={20} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* ── Mobile Navigation Drawer ── */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { width: 270, pt: 1 } } }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            background: `linear-gradient(135deg, ${C.pinkDark} 0%, ${C.pink} 100%)`,
            mb: 1,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: '"Dancing Script", "Brush Script MT", cursive',
                fontSize: 22,
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1,
              }}
            >
              Shopi Nova
            </Typography>
            <Typography sx={{ fontSize: 9, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>
              Plus
            </Typography>
          </Box>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: "#fff" }}>
            <X size={20} />
          </IconButton>
        </Box>

        <List sx={{ px: 1 }}>
          {[
            { label: "Categories", path: "/categories", icon: <Tag size={18} color={C.pink} /> },
            { label: "Products", path: "/products", icon: <Package size={18} color={C.pink} /> },
            { label: "About Us", path: "/about-us", icon: <Info size={18} color={C.pink} /> },
            { label: "Contact Us", path: "/contact", icon: <Phone size={18} color={C.pink} /> },
          ].map((item) => (
            <ListItemButton
              key={item.label}
              onClick={() => {
                setDrawerOpen(false);
                navigate(item.path);
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&:hover": { bgcolor: C.pinkLight },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{ primary: { sx: { fontSize: 14, fontWeight: 600, color: C.text } } }}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

    </Box>
  );
};
