import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User } from "lucide-react";

const PINK = {
  600: "#C2185B",
  500: "#E91E8C",
};

const NAV_H = 64;

export const Header = () => {
  const navigate = useNavigate();
  const cartCount = 2; // later redux se lena

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1200,
        background: `linear-gradient(90deg, ${PINK[600]} 0%, ${PINK[500]} 100%)`,
        height: NAV_H,
        display: "flex",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(194,24,91,0.35)",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1280,
          mx: "auto",
          px: 2,
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        {/* Logo */}
        <Box
          onClick={() => navigate("/")}
          sx={{
            color: "#fff",
            fontWeight: 800,
            fontSize: 24,
            cursor: "pointer",
          }}
        >
          ResinArt
        </Box>

        {/* Search */}
        <Box
          sx={{
            flex: 1,
            maxWidth: 500,
            background: "#fff",
            borderRadius: 1,
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            overflow: "hidden",
            height: 40,
          }}
        >
          <input
            placeholder="Search products..."
            style={{
              flex: 1,
              padding: "0 10px",
              border: "none",
              outline: "none",
            }}
          />
          <Box
            sx={{
              background: PINK[500],
              px: 2,
              height: "100%",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <Search size={18} color="#fff" />
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 2, ml: "auto" }}>
          {/* Cart */}
          <Box
            onClick={() => navigate("/cart")}
            sx={{
              color: "#fff",
              cursor: "pointer",
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  top: -6,
                  right: -10,
                  background: "#FFD54F",
                  borderRadius: "50%",
                  fontSize: 10,
                  px: 0.6,
                }}
              >
                {cartCount}
              </Box>
            )}
            Cart
          </Box>

          {/* Login */}
          <Box
            onClick={() => navigate("/login")}
            sx={{
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <User size={18} />
            Login
          </Box>
        </Box>
      </Box>
    </Box>
  );
};