import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Rating,
} from '@mui/material';
import { Heart, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Product } from '../types';
import { getImageUrl } from '../lib/imageUrl';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { useSnackbar } from 'notistack';
import { cartService, AddToCartDetails } from '../services/cartService';
import { wishlistService } from '../services/wishlistService';
import { addToCart as addToCartAction } from '../store/slices/cartSlice';
import { AddToCartDetailsModal } from './AddToCartDetailsModal';

interface ProductCardProps {
  product: Product;
  onWishlistToggle?: () => void;
  onAddToCart?: () => void;
}

export const ProductCard = ({ product, onWishlistToggle, onAddToCart }: ProductCardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);

  const isInWishlist = wishlistItems.some((item) => item.product_id === product.id);
  const displayPrice = product.discount_price || product.price;
  const hasDiscount = !!product.discount_price;

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated || !user) {
      enqueueSnackbar('Please login to add items to cart', { variant: 'warning' });
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setDetailsModalOpen(true);
  };

  const handleDetailsSubmit = async (values: AddToCartDetails) => {
    if (!user) return;
    try {
      setAddingToCart(true);
      const item = await cartService.addToCart(user.id, product.id, values);
      dispatch(addToCartAction(item));
      enqueueSnackbar('Added to cart!', { variant: 'success' });
      setDetailsModalOpen(false);
      onAddToCart?.();
    } catch (error) {
      enqueueSnackbar('Failed to add to cart', { variant: 'error' });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated || !user) {
      enqueueSnackbar('Please login to add to wishlist', { variant: 'warning' });
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    try {
      if (isInWishlist) {
        const item = wishlistItems.find((item) => item.product_id === product.id);
        if (item) {
          await wishlistService.removeFromWishlist(item.id);
          enqueueSnackbar('Removed from wishlist', { variant: 'info' });
        }
      } else {
        await wishlistService.addToWishlist(user.id, product.id);
        enqueueSnackbar('Added to wishlist!', { variant: 'success' });
      }
      onWishlistToggle?.();
    } catch (error) {
      enqueueSnackbar('Failed to update wishlist', { variant: 'error' });
    }
  };

  return (
    <>
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
        },
        position: 'relative',
      }}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="240"
          image={getImageUrl(product.images?.[0], 'https://via.placeholder.com/400x300')}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />
        {hasDiscount && (
          <Chip
            label={`-${Math.round(((product.price - displayPrice) / product.price) * 100)}%`}
            color="primary"
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              fontWeight: 600,
            }}
          />
        )}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 1,
          }}
        >
          <IconButton
            size="small"
            onClick={handleWishlistToggle}
            sx={{
              backgroundColor: 'background.paper',
              '&:hover': { backgroundColor: 'background.paper' },
            }}
          >
            <Heart
              size={18}
              fill={isInWishlist ? '#FF9A8B' : 'none'}
              color={isInWishlist ? '#FF9A8B' : 'currentColor'}
            />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleAddToCart}
            sx={{
              backgroundColor: 'background.paper',
              '&:hover': { backgroundColor: 'background.paper' },
            }}
          >
            <ShoppingCart size={18} />
          </IconButton>
        </Box>
      </Box>

      <CardContent>
        <Typography variant="h6" gutterBottom noWrap fontWeight={600}>
          {product.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating value={product.rating} precision={0.5} size="small" readOnly />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({product.rating})
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" color="primary" fontWeight={700}>
            ${displayPrice.toFixed(2)}
          </Typography>
          {hasDiscount && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: 'line-through' }}
            >
              ${product.price.toFixed(2)}
            </Typography>
          )}
        </Box>

        {product.stock <= 5 && product.stock > 0 && (
          <Chip
            label={`Only ${product.stock} left!`}
            size="small"
            color="warning"
            sx={{ mt: 1 }}
          />
        )}
        {product.stock === 0 && (
          <Chip label="Out of Stock" size="small" color="error" sx={{ mt: 1 }} />
        )}
      </CardContent>
    </Card>
    <AddToCartDetailsModal
      open={detailsModalOpen}
      productImage={getImageUrl(product.images?.[0])}
      productName={product.name}
      submitting={addingToCart}
      onClose={() => setDetailsModalOpen(false)}
      onSubmit={handleDetailsSubmit}
    />
    </>
  );
};
