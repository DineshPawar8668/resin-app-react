import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
} from '@mui/material';
import { Heart } from 'lucide-react';
import { WishlistItem } from '../types';
import { wishlistService } from '../services/wishlistService';
import { ProductCard } from '../components/ProductCard';
import { useAppSelector } from '../store/hooks';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

export const Wishlist = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAppSelector((state) => state.auth);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      const items = await wishlistService.getWishlist(user!.id);
      setWishlistItems(items);
    } catch (error) {
      enqueueSnackbar('Failed to load wishlist', { variant: 'error' });
    }
  };

  if (wishlistItems.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Heart size={64} color="#ccc" />
          <Typography variant="h5" gutterBottom>
            Your wishlist is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Save your favorite products for later!
          </Typography>
          <Button variant="contained" onClick={() => navigate('/products')}>
            Explore Products
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom fontWeight={600}>
        My Wishlist
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {wishlistItems.map((item) =>
          item.product ? (
            <Grid item xs={12} sm={6} md={3} key={item.id}>
              <ProductCard product={item.product} onWishlistToggle={loadWishlist} />
            </Grid>
          ) : null
        )}
      </Grid>
    </Container>
  );
};
