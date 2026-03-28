import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { cartService } from '../services/cartService';
import { supabase } from '../lib/supabase';
import { useSnackbar } from 'notistack';
import { CartItem } from '../types';

const validationSchema = yup.object({
  full_name: yup.string().required('Full name is required'),
  phone: yup.string().required('Phone number is required'),
  address_line1: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  postal_code: yup.string().required('Postal code is required'),
  country: yup.string().required('Country is required'),
});

export const Checkout = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAppSelector((state) => state.auth);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [processing, setProcessing] = useState(false);

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

  const formik = useFormik({
    initialValues: {
      full_name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'USA',
    },
    validationSchema,
    onSubmit: async (values) => {
      setProcessing(true);
      try {
        const { data: address, error: addressError } = await supabase
          .from('addresses')
          .insert({
            user_id: user!.id,
            ...values,
            is_default: false,
          })
          .select()
          .single();

        if (addressError) throw addressError;

        const total = cartItems.reduce((sum, item) => {
          const price = item.product?.discount_price || item.product?.price || 0;
          return sum + price * item.quantity;
        }, 0);

        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user!.id,
            address_id: address.id,
            total_amount: total,
            status: 'pending',
            payment_method: paymentMethod,
          })
          .select()
          .single();

        if (orderError) throw orderError;

        const orderItems = cartItems.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.product?.discount_price || item.product?.price || 0,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;

        await cartService.clearCart(user!.id);

        enqueueSnackbar('Order placed successfully!', { variant: 'success' });
        navigate('/');
      } catch (error) {
        enqueueSnackbar('Failed to place order', { variant: 'error' });
        console.error(error);
      } finally {
        setProcessing(false);
      }
    },
  });

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.discount_price || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Button variant="contained" onClick={() => navigate('/products')} sx={{ mt: 2 }}>
            Continue Shopping
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom fontWeight={600}>
        Checkout
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Shipping Address
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="full_name"
                    label="Full Name"
                    value={formik.values.full_name}
                    onChange={formik.handleChange}
                    error={formik.touched.full_name && Boolean(formik.errors.full_name)}
                    helperText={formik.touched.full_name && formik.errors.full_name}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="phone"
                    label="Phone Number"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                    helperText={formik.touched.phone && formik.errors.phone}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="address_line1"
                    label="Address Line 1"
                    value={formik.values.address_line1}
                    onChange={formik.handleChange}
                    error={formik.touched.address_line1 && Boolean(formik.errors.address_line1)}
                    helperText={formik.touched.address_line1 && formik.errors.address_line1}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="address_line2"
                    label="Address Line 2 (Optional)"
                    value={formik.values.address_line2}
                    onChange={formik.handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="city"
                    label="City"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    error={formik.touched.city && Boolean(formik.errors.city)}
                    helperText={formik.touched.city && formik.errors.city}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="state"
                    label="State"
                    value={formik.values.state}
                    onChange={formik.handleChange}
                    error={formik.touched.state && Boolean(formik.errors.state)}
                    helperText={formik.touched.state && formik.errors.state}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="postal_code"
                    label="Postal Code"
                    value={formik.values.postal_code}
                    onChange={formik.handleChange}
                    error={formik.touched.postal_code && Boolean(formik.errors.postal_code)}
                    helperText={formik.touched.postal_code && formik.errors.postal_code}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="country"
                    label="Country"
                    value={formik.values.country}
                    onChange={formik.handleChange}
                    error={formik.touched.country && Boolean(formik.errors.country)}
                    helperText={formik.touched.country && formik.errors.country}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <FormControl>
                <FormLabel>
                  <Typography variant="h6" fontWeight={600}>
                    Payment Method
                  </Typography>
                </FormLabel>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <FormControlLabel
                    value="cash_on_delivery"
                    control={<Radio />}
                    label="Cash on Delivery"
                  />
                  <FormControlLabel
                    value="card"
                    control={<Radio />}
                    label="Credit/Debit Card (Demo)"
                  />
                  <FormControlLabel
                    value="paypal"
                    control={<Radio />}
                    label="PayPal (Demo)"
                  />
                </RadioGroup>
              </FormControl>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, position: 'sticky', top: 80 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Order Summary
              </Typography>

              <Divider sx={{ my: 2 }} />

              {cartItems.map((item) => (
                <Box key={item.id} sx={{ mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Box
                        component="img"
                        src={item.product?.images[0]}
                        alt={item.product?.name}
                        sx={{ width: '100%', borderRadius: 1 }}
                      />
                    </Grid>
                    <Grid item xs={9}>
                      <Typography variant="body2" fontWeight={600}>
                        {item.product?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Qty: {item.quantity}
                      </Typography>
                      <Typography variant="body2" color="primary" fontWeight={600}>
                        ${((item.product?.discount_price || item.product?.price || 0) * item.quantity).toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal</Typography>
                <Typography fontWeight={600}>${subtotal.toFixed(2)}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Shipping</Typography>
                <Typography fontWeight={600}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </Typography>
              </Box>

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
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Place Order'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};
