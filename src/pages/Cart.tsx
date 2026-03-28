import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Button,
  Divider,
  TextField,
  Paper,
} from '@mui/material';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../types';
import { cartService } from '../services/cartService';
import { useAppSelector } from '../store/hooks';
import { useSnackbar } from 'notistack';

export const Cart = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAppSelector((state) => state.auth);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadCart();
    }
  }, [user]);

  const loadCart = async () => {
    try {
      const items = await cartService.getCartItems(user!.id);
      setCartItems(items);
    } catch (error) {
      enqueueSnackbar('Failed to load cart', { variant: 'error' });
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      setLoading(true);
      await cartService.updateQuantity(itemId, newQuantity);
      await loadCart();
      enqueueSnackbar('Cart updated', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to update quantity', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setLoading(true);
      await cartService.removeFromCart(itemId);
      await loadCart();
      enqueueSnackbar('Item removed from cart', { variant: 'info' });
    } catch (error) {
      enqueueSnackbar('Failed to remove item', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.discount_price || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
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
          <ShoppingBag size={64} color="#ccc" />
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Add some beautiful resin products to get started!
          </Typography>
          <Button variant="contained" onClick={() => navigate('/products')}>
            Shop Now
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom fontWeight={600}>
        Shopping Cart
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {cartItems.map((item) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <Box
                      component="img"
                      src={item.product?.images[0] || 'https://via.placeholder.com/150'}
                      alt={item.product?.name}
                      sx={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: 1,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/products/${item.product_id}`)}
                    >
                      {item.product?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.product?.category?.name}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={2}>
                    <Typography variant="h6" color="primary" fontWeight={600}>
                      ${(item.product?.discount_price || item.product?.price || 0).toFixed(2)}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={loading || item.quantity <= 1}
                        sx={{ border: '1px solid', borderColor: 'divider' }}
                      >
                        <Minus size={16} />
                      </IconButton>
                      <Typography sx={{ minWidth: 30, textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={loading || item.quantity >= (item.product?.stock || 0)}
                        sx={{ border: '1px solid', borderColor: 'divider' }}
                      >
                        <Plus size={16} />
                      </IconButton>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={1}>
                    <IconButton
                      onClick={() => removeItem(item.id)}
                      disabled={loading}
                      color="error"
                    >
                      <Trash2 size={20} />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 80 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Order Summary
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Subtotal ({cartItems.length} items)</Typography>
              <Typography fontWeight={600}>${subtotal.toFixed(2)}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Shipping</Typography>
              <Typography fontWeight={600}>
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </Typography>
            </Box>

            {subtotal < 50 && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add ${(50 - subtotal).toFixed(2)} more for free shipping!
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Total
              </Typography>
              <Typography variant="h6" color="primary" fontWeight={700}>
                ${total.toFixed(2)}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => navigate('/checkout')}
              sx={{ mb: 2 }}
            >
              Proceed to Checkout
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
