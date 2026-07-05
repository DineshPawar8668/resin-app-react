import { Box, Container, Typography, Link as MuiLink, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const Footer = () => {
  const navigate = useNavigate();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
        py: 6,
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="primary" gutterBottom fontWeight={600}>
              Resin Artistry
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Handcrafted resin products made with love and creativity.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Quick Links
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <MuiLink href="/products" underline="hover" color="text.secondary">
                Shop All
              </MuiLink>
              <MuiLink href="/products" underline="hover" color="text.secondary">
                Categories
              </MuiLink>
              <MuiLink href="/about-us" underline="hover" color="text.secondary">
                About Us
              </MuiLink>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Support
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <MuiLink onClick={() => navigate("/contact")} underline="hover" color="text.secondary" sx={{ cursor: "pointer" }}>
                Contact Us
              </MuiLink>
              <MuiLink onClick={() => navigate("/privacy-policy")} underline="hover" color="text.secondary" sx={{ cursor: "pointer" }}>
                Privacy Policy
              </MuiLink>
              <MuiLink onClick={() => navigate("/terms-and-conditions")} underline="hover" color="text.secondary" sx={{ cursor: "pointer" }}>
                Terms and Conditions
              </MuiLink>
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ mt: 4, pt: 4, borderTop: "1px solid", borderColor: "divider" }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Resin Artistry. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
