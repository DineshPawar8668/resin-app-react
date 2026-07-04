import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Typography, CircularProgress } from '@mui/material';
import { ImageOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { categoryService, CategoryItem } from '../services/categoryService';

const PINK = '#C2185B';

export const ShopCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService
      .getAll()
      .then((list) => setCategories(list.filter((c: CategoryItem) => c.is_active)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>Resin Art Categories – Jewelry, Coasters, Frames & More | ShopIzara</title>
        <meta name="description" content="Shop resin art by category at ShopIzara. Explore handmade resin jewelry, coasters, photo frames, home decor, name plates, wedding gifts and more. Premium resin products online in India." />
        <meta name="keywords" content="resin art categories india, resin jewelry category, resin coasters india, resin photo frames, resin home decor categories, resin gifts india, resin name plates" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://shopizara.com/categories" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shopizara.com/categories" />
        <meta property="og:site_name" content="ShopIzara" />
        <meta property="og:title" content="Resin Art Categories – Jewelry, Coasters, Frames & More | ShopIzara" />
        <meta property="og:description" content="Shop handmade resin art by category. Jewelry, coasters, frames, home decor, gifts and more." />
        <meta property="og:image" content="https://shopizara.com/hero/r-4.jpg" />
        <meta property="og:locale" content="en_IN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Resin Art Categories | ShopIzara" />
        <meta name="twitter:image" content="https://shopizara.com/hero/r-4.jpg" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Resin Art Categories – ShopIzara",
            "url": "https://shopizara.com/categories",
            "description": "All handmade resin art product categories at ShopIzara including jewelry, coasters, photo frames, home decor and gifts.",
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://shopizara.com" },
                { "@type": "ListItem", "position": 2, "name": "Categories", "item": "https://shopizara.com/categories" }
              ]
            }
          }
        `}</script>
      </Helmet>
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Page Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${PINK} 0%, #D81B60 100%)`,
          py: { xs: 3, sm: 4 },
          px: { xs: 2, sm: 4 },
        }}
      >
        <Typography fontWeight={800} fontSize={{ xs: 22, sm: 28 }} color="#fff">
          Shop by Category
        </Typography>
        <Typography fontSize={13} color="rgba(255,255,255,0.8)" mt={0.5}>
          Browse our curated collections
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3 }, py: 4 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={12}>
            <CircularProgress sx={{ color: PINK }} />
          </Box>
        ) : categories.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Typography fontSize={18} fontWeight={600} color="text.secondary">
              No categories available
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
                lg: 'repeat(5, 1fr)',
              },
              gap: { xs: 3, sm: 4 },
            }}
          >
            {categories.map((cat) => (
              <Box
                key={cat.id}
                onClick={() => navigate(`/products?category=${cat.id}`)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.5,
                  cursor: 'pointer',
                  '&:hover .cat-circle': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 32px rgba(194,24,91,0.22)',
                  },
                  '&:hover .cat-img': { transform: 'scale(1.08)' },
                }}
              >
                <Box
                  className="cat-circle"
                  sx={{
                    width: { xs: 110, sm: 140, md: 160 },
                    height: { xs: 110, sm: 140, md: 160 },
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: `3px solid ${PINK}`,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.10)',
                    transition: 'transform 0.25s, box-shadow 0.25s',
                    flexShrink: 0,
                  }}
                >
                  {cat.image ? (
                    <Box
                      component="img"
                      className="cat-img"
                      src={cat.image}
                      alt={cat.name}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        bgcolor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ImageOff size={28} color="#bdbdbd" />
                    </Box>
                  )}
                </Box>

                <Typography
                  fontWeight={700}
                  fontSize={{ xs: 13, sm: 15 }}
                  textAlign="center"
                  sx={{
                    color: '#1a1a1a',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.3,
                    px: 0.5,
                  }}
                >
                  {cat.name}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
    </>
  );
};
