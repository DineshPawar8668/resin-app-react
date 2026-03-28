import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  Slider,
  Divider,
  Drawer,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import { Filter } from "lucide-react";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { productService } from "../services/productService";

const PINK = {
  600: "#C2185B",
  500: "#E91E8C",
};

const Products = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [price, setPrice] = useState<number[]>([0, 5000]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [prod, cat] = await Promise.all([
      productService.getProducts(),
      productService.getCategories(),
    ]);
    setProducts(prod);
    setCategories(cat);
  };

  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id)
        ? prev.filter((c) => c !== id)
        : [...prev, id]
    );
  };

  const filteredProducts = products.filter((p) => {
    const catMatch =
      selectedCategories.length === 0 ||
      selectedCategories.includes(p.category_id);

    const priceMatch =
      p.price >= price[0] && p.price <= price[1];

    return catMatch && priceMatch;
  });

  /* ─── FILTER UI ─── */
  const FilterUI = () => (
    <Box sx={{ width: 260, p: 2 }}>
      <Typography fontWeight={700} mb={2}>
        Filters
      </Typography>

      <Typography fontWeight={600}>Category</Typography>
      {categories.map((cat) => (
        <FormControlLabel
          key={cat.id}
          control={
            <Checkbox
              checked={selectedCategories.includes(cat.id)}
              onChange={() => toggleCategory(cat.id)}
              sx={{
                color: PINK[500],
                "&.Mui-checked": { color: PINK[500] },
              }}
            />
          }
          label={cat.name}
        />
      ))}

      <Divider sx={{ my: 2 }} />

      <Typography fontWeight={600}>Price</Typography>
      <Slider
        value={price}
        onChange={(e, val: any) => setPrice(val)}
        valueLabelDisplay="auto"
        sx={{ color: PINK[500] }}
      />

      <Divider sx={{ my: 2 }} />

      <Button
        fullWidth
        variant="contained"
        sx={{ background: PINK[500] }}
      >
        Apply
      </Button>
    </Box>
  );

  return (
    <Box sx={{ background: "#f1f3f6", minHeight: "100vh", p: 2 }}>
      {/* MOBILE FILTER BUTTON */}
      {isMobile && (
        <Box sx={{ mb: 2 }}>
          <Button
            startIcon={<Filter size={18} />}
            variant="contained"
            sx={{ background: PINK[500] }}
            onClick={() => setDrawerOpen(true)}
          >
            Filters
          </Button>
        </Box>
      )}

      {/* MAIN LAYOUT */}
      <Box sx={{ display: "flex", gap: 2 }}>
        
        {/* DESKTOP FILTER */}
        {!isMobile && (
          <Box
            sx={{
              width: "20%",
              minWidth: 260,
              background: "#fff",
              borderRadius: 2,
              position: "sticky",
              top: 80,
              height: "fit-content",
            }}
          >
            <FilterUI />
          </Box>
        )}

        {/* PRODUCTS */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ background: "#fff", borderRadius: 2, p: 2 }}>
            
            {/* TOP BAR */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography fontWeight={700}>
                {filteredProducts.length} Products
              </Typography>
              <Button variant="outlined">Sort</Button>
            </Box>

            {/* GRID */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",   // mobile
                  sm: "repeat(3, 1fr)",   // tablet
                  md: "repeat(4, 1fr)",   // desktop
                  lg: "repeat(5, 1fr)",   // big screen
                },
                gap: 2,
              }}
            >
              {filteredProducts.map((p, i) => (
                <Box
                  key={i}
                  onClick={() => navigate(`/products/${p.id}`)}
                  sx={{
                    border: "1px solid #eee",
                    borderRadius: 2,
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "0.3s",
                    background: "#fff",

                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow:
                        "0 8px 20px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <Box sx={{ height: 150, background: "#fafafa" }}>
                    <Box
                      component="img"
                      src={p.image_url || "https://images.pexels.com/photos/1458329/pexels-photo-1458329.jpeg?auto=compress&w=600"}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>

                  <Box sx={{ p: 1 }}>
                    <Typography fontSize={13} fontWeight={600}>
                      {p.name}
                    </Typography>

                    <Typography
                      sx={{
                        color: PINK[500],
                        fontWeight: 700,
                      }}
                    >
                      ₹{p.price}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* MOBILE DRAWER */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <FilterUI />
      </Drawer>
    </Box>
  );
};

export default Products;