import { useEffect, useState } from "react";
import { Box, Typography, IconButton, Button, Divider, CircularProgress, Dialog, DialogTitle, DialogContent, List, ListItemButton } from "@mui/material";
import { Trash2, Plus, Minus, ShoppingBag, BookOpen, ArrowRight, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CartItem } from "../types";
import { cartService, AddToCartDetails } from "../services/cartService";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setCartItems as setCartItemsAction, addToCart as addToCartAction, removeCartInstance, removeFromCart as removeFromCartAction } from "../store/slices/cartSlice";
import { useSnackbar } from "notistack";
import { AddToCartDetailsModal } from "../components/AddToCartDetailsModal";

const PINK = { 600: "#C2185B", 500: "#D81B60", 50: "#FFF0F6", 100: "#FCE4EC" };

export const Cart = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [addModalItem, setAddModalItem] = useState<CartItem | null>(null);
  const [pickerItem, setPickerItem] = useState<CartItem | null>(null);

  useEffect(() => {
    if (user) loadCart();
  }, [user]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const items = await cartService.getCartItems(user!.id);
      setCartItems(items);
      dispatch(setCartItemsAction(items));
    } catch {
      enqueueSnackbar("Failed to load cart", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = (item: CartItem) => setAddModalItem(item);

  const handleAddInstanceSubmit = async (values: AddToCartDetails) => {
    if (!user || !addModalItem) return;
    try {
      setActionLoading(addModalItem.id);
      const updated = await cartService.addToCart(user.id, addModalItem.product_id, values);
      setCartItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      dispatch(addToCartAction(updated));
      setAddModalItem(null);
    } catch {
      enqueueSnackbar("Failed to update quantity", { variant: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecrement = (item: CartItem) => {
    if (item.quantity <= 1) {
      removeItem(item.id);
      return;
    }
    setPickerItem(item);
  };

  const handleRemoveInstance = async (item: CartItem, index: number) => {
    try {
      setActionLoading(item.id);
      await cartService.removeInstance(item.id, index);
      dispatch(removeCartInstance({ id: item.id, index }));
      setCartItems((prev) => {
        if (item.instanceDetails.length <= 1) return prev.filter((i) => i.id !== item.id);
        return prev.map((i) => {
          if (i.id !== item.id) return i;
          const nextDetails = i.instanceDetails.filter((_, idx) => idx !== index);
          return { ...i, instanceDetails: nextDetails, quantity: nextDetails.length };
        });
      });
      setPickerItem(null);
    } catch {
      enqueueSnackbar("Failed to remove item", { variant: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setActionLoading(itemId);
      await cartService.removeFromCart(itemId);
      setCartItems((prev) => prev.filter((i) => i.id !== itemId));
      dispatch(removeFromCartAction(itemId));
      enqueueSnackbar("Item removed", { variant: "info" });
    } catch {
      enqueueSnackbar("Failed to remove item", { variant: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  // const handleBookNow = async () => {
  //   if (!user || cartItems.length === 0) return;
  //   try {
  //     setBookingLoading(true);
  //     const productIds = cartItems.map((i) => i.product_id);

  //     const paymentData = await paymentService.initiatePayment(user.id, productIds);

  //     setBookingLoading(false);

  //     paymentService.openCheckout(
  //       paymentData,
  //       user.name ?? 'Customer',
  //       user.email ?? '',
  //       async (razorpayResponse) => {
  //         try {
  //           setBookingLoading(true);
  //           await paymentService.verifyPayment(
  //             razorpayResponse.razorpay_order_id,
  //             razorpayResponse.razorpay_payment_id,
  //             razorpayResponse.razorpay_signature,
  //             user.id,
  //             productIds
  //           );
  //           await cartService.clearCart(user.id);
  //           setCartItems([]);
  //           enqueueSnackbar('Order placed successfully! Payment confirmed.', { variant: 'success' });
  //           navigate('/my-orders');
  //         } catch {
  //           enqueueSnackbar('Payment verification failed. Please contact support.', { variant: 'error' });
  //         } finally {
  //           setBookingLoading(false);
  //         }
  //       },
  //       () => {
  //         enqueueSnackbar('Payment cancelled.', { variant: 'info' });
  //       }
  //     );
  //   } catch {
  //     enqueueSnackbar('Failed to initiate payment. Please try again.', { variant: 'error' });
  //     setBookingLoading(false);
  //   }
  // };

  const handleBookNow = () => {
    if (!user || cartItems.length === 0) return;
    navigate("/checkout");
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.discount_price ?? item.product?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);
  const shipping = subtotal > 50 ? 0 : 6;
  const total = subtotal + shipping;

  /* ── EMPTY STATE ── */
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: PINK[600] }} />
      </Box>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Box sx={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, px: 2 }}>
        <Box
          sx={{
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: PINK[50],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1,
          }}
        >
          <ShoppingBag size={48} color={PINK[500]} strokeWidth={1.5} />
        </Box>
        <Typography variant="h5" fontWeight={800} color="#1a1a1a">
          Your cart is empty
        </Typography>
        <Typography color="text.secondary" textAlign="center" maxWidth={340}>
          Looks like you haven't added any resin art products yet. Explore our collection!
        </Typography>
        <Button
          variant="contained"
          endIcon={<ArrowRight size={16} />}
          onClick={() => navigate("/products")}
          sx={{
            mt: 1,
            px: 3,
            py: 1.2,
            borderRadius: 3,
            fontWeight: 700,
            background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
            boxShadow: `0 6px 20px rgba(194,24,91,0.3)`,
          }}
        >
          Shop Now
        </Button>
      </Box>
    );
  }

  /* ── MAIN LAYOUT ── */
  return (
    <>
    <Box sx={{ background: "#f7f7fa", minHeight: "100vh" }}>
      {/* Header banner */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${PINK[600]} 0%, ${PINK[500]} 100%)`,
          py: { xs: 2.5, md: 3 },
          px: { xs: 2, md: 4 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {[
          { s: 180, t: -60, r: -40, op: 0.08 },
          { s: 90, t: 10, r: 130, op: 0.06 },
        ].map((c, i) => (
          <Box
            key={i}
            sx={{ position: "absolute", width: c.s, height: c.s, borderRadius: "50%", background: "#fff", opacity: c.op, top: c.t, right: c.r }}
          />
        ))}
        <Box sx={{ maxWidth: 1200, mx: "auto", position: "relative", display: "flex", alignItems: "center", gap: 1.5 }}>
          <ShoppingCart size={26} color="#fff" />
          <Box>
            <Typography variant="h5" fontWeight={900} color="#fff" letterSpacing={-0.3}>
              Shopping Cart
            </Typography>
            <Typography fontSize={13} sx={{ color: "rgba(255,255,255,0.8)" }}>
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your cart
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 1.5, sm: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
        <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", flexDirection: { xs: "column", md: "row" } }}>
          {/* ── LEFT: Order Summary ── */}
          <Box
            sx={{
              width: { xs: "100%", md: 320 },
              flexShrink: 0,
              position: { md: "sticky" },
              top: { md: 84 },
              background: "#fff",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
              order: { xs: 2, md: 1 },
            }}
          >
            {/* Summary header */}
            <Box sx={{ background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`, px: 2.5, py: 2 }}>
              <Typography fontWeight={800} fontSize={16} color="#fff">
                Order Summary
              </Typography>
            </Box>

            <Box sx={{ p: 2.5 }}>
              {/* Line items */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 4 }}>
                {cartItems.map((item) => {
                  const unitPrice = item.product?.discount_price ?? item.product?.price ?? 0;
                  return (
                    <Box key={item.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                      <Typography
                        fontSize={13}
                        color="text.secondary"
                        sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {item.product?.name ?? "Product"}
                        <Box component="span" sx={{ ml: 0.5, color: "#bbb", fontSize: 12 }}>
                          ×{item.quantity}
                        </Box>
                      </Typography>
                      <Typography fontSize={13} fontWeight={700} sx={{ flexShrink: 0 }}>
                        ₹{(unitPrice * item.quantity).toFixed(0)}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              <Divider sx={{ borderColor: "#f5f5f5", mb: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.2 }}>
                <Typography fontSize={14} color="text.secondary">
                  Subtotal
                </Typography>
                <Typography fontSize={14} fontWeight={700}>
                  ₹{subtotal.toFixed(0)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography fontSize={14} color="text.secondary">
                  Shipping
                </Typography>
                <Typography fontSize={14} fontWeight={700} color={shipping === 0 ? "success.main" : "text.primary"}>
                  {shipping === 0 ? "FREE" : `₹${shipping.toFixed(0)}`}
                </Typography>
              </Box>

              {subtotal < 50 && (
                <Box sx={{ background: "#FFF8E1", borderRadius: 2, px: 1.5, py: 1, mb: 2 }}>
                  <Typography fontSize={12} color="#F57C00">
                    Add ₹{(50 - subtotal).toFixed(0)} more for free shipping
                  </Typography>
                </Box>
              )}

              <Divider sx={{ borderColor: "#f5f5f5", mb: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography fontSize={16} fontWeight={800}>
                  Total
                </Typography>
                <Typography fontSize={22} fontWeight={900} sx={{ color: PINK[600] }}>
                  ₹{total.toFixed(0)}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleBookNow}
                startIcon={<BookOpen size={17} />}
                sx={{
                  mb: 1.5,
                  py: 1.5,
                  fontWeight: 800,
                  fontSize: 15,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
                  boxShadow: `0 6px 20px rgba(194,24,91,0.35)`,
                  letterSpacing: 0.3,
                  "&:hover": { background: `linear-gradient(135deg, #a3154e, ${PINK[600]})` },
                  "&:disabled": { background: PINK[100], color: "#fff" },
                }}
              >
                Place Order
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate("/products")}
                sx={{
                  py: 1.3,
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: 14,
                  borderColor: PINK[100],
                  color: PINK[600],
                  "&:hover": { borderColor: PINK[500], background: PINK[50] },
                }}
              >
                Continue Shopping
              </Button>
            </Box>
          </Box>

          {/* ── RIGHT: Cart Items ── */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              width: { xs: "100%", md: "auto" },
              display: "flex",
              flexDirection: "column",
              gap: 2,
              order: { xs: 1, md: 2 },
            }}
          >
            {cartItems.map((item) => {
              const unitPrice = item.product?.discount_price ?? item.product?.price ?? 0;
              const originalPrice = item.product?.price ?? 0;
              const hasDiscount = item.product?.discount_price != null && item.product.discount_price < originalPrice;
              const discountPct = hasDiscount ? Math.round(((originalPrice - unitPrice) / originalPrice) * 100) : 0;
              const isUpdating = actionLoading === item.id;

              return (
                <Box
                  key={item.id}
                  sx={{
                    background: "#fff",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    border: "1px solid #f0f0f0",
                    opacity: isUpdating ? 0.75 : 1,
                    transition: "box-shadow 0.2s, opacity 0.2s",
                    "&:hover": { boxShadow: "0 6px 24px rgba(194,24,91,0.11)" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "stretch" }}>
                    {/* ── Image ── */}
                    <Box
                      sx={{
                        flexShrink: 0,
                        width: { xs: 120, sm: 140 },
                        minHeight: { xs: 140, sm: 150 },
                        position: "relative",
                        cursor: "pointer",
                        overflow: "hidden",
                        borderRadius: "16px 0 0 16px",
                        background: "#f8f8f8",
                      }}
                      onClick={() => navigate(`/products/${item.product_id}`)}
                    >
                      <Box
                        component="img"
                        src={item.product?.images?.[0] || "https://placehold.co/140x150/f5f5f5/bbb?text=img"}
                        alt={item.product?.name}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          position: "absolute",
                          inset: 0,
                          transition: "transform 0.35s",
                          "&:hover": { transform: "scale(1.07)" },
                        }}
                      />
                      {discountPct > 0 && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: 800,
                            px: 0.8,
                            py: 0.3,
                            borderRadius: "6px",
                            lineHeight: 1.5,
                            zIndex: 1,
                          }}
                        >
                          -{discountPct}%
                        </Box>
                      )}
                    </Box>

                    {/* ── Content ── */}
                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        p: { xs: 1.5, sm: 2 },
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: 1,
                      }}
                    >
                      {/* Row 1 — Name + delete */}
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 0.5 }}>
                        <Typography
                          fontWeight={700}
                          fontSize={{ xs: 14, sm: 15 }}
                          lineHeight={1.4}
                          onClick={() => navigate(`/products/${item.product_id}`)}
                          sx={{
                            flex: 1,
                            cursor: "pointer",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            "&:hover": { color: PINK[600] },
                            transition: "color 0.15s",
                          }}
                        >
                          {item.product?.name ?? "Product"}
                        </Typography>
                        <IconButton
                          size="small"
                          disabled={isUpdating}
                          onClick={() => removeItem(item.id)}
                          sx={{
                            flexShrink: 0,
                            width: 30,
                            height: 30,
                            color: "#ccc",
                            "&:hover": { color: "#e53935", background: "#ffebee" },
                          }}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </Box>

                      {/* Row 2 — Price */}
                      <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.8 }}>
                        <Typography fontWeight={900} fontSize={{ xs: 15, sm: 17 }} sx={{ color: PINK[600] }}>
                          ₹{unitPrice.toFixed(0)}
                        </Typography>
                        {hasDiscount && (
                          <Typography fontSize={12} sx={{ textDecoration: "line-through", color: "#bbb" }}>
                            ₹{originalPrice.toFixed(0)}
                          </Typography>
                        )}
                        {hasDiscount && (
                          <Box
                            sx={{
                              background: "#E8F5E9",
                              color: "#2E7D32",
                              fontSize: 11,
                              fontWeight: 700,
                              px: 0.7,
                              py: 0.2,
                              borderRadius: 1,
                              lineHeight: 1.6,
                            }}
                          >
                            {discountPct}% off
                          </Box>
                        )}
                      </Box>

                      {/* Row 3 — Qty stepper + item total */}
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "auto" }}>
                        {/* Stepper pill */}
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            border: "1.5px solid #e8e8e8",
                            borderRadius: "30px",
                            background: "#fafafa",
                            overflow: "hidden",
                          }}
                        >
                          <IconButton
                            size="small"
                            disabled={isUpdating || item.quantity <= 1}
                            onClick={() => handleDecrement(item)}
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 0,
                              color: item.quantity <= 1 ? "#ddd" : "#555",
                              "&:hover:not(:disabled)": { background: PINK[50], color: PINK[600] },
                            }}
                          >
                            <Minus size={13} />
                          </IconButton>
                          <Box
                            sx={{
                              minWidth: 36,
                              textAlign: "center",
                              fontWeight: 800,
                              fontSize: 14,
                              color: "#111",
                              borderLeft: "1.5px solid #e8e8e8",
                              borderRight: "1.5px solid #e8e8e8",
                              lineHeight: "32px",
                            }}
                          >
                            {isUpdating ? <CircularProgress size={11} sx={{ color: PINK[500], verticalAlign: "middle" }} /> : item.quantity}
                          </Box>
                          <IconButton
                            size="small"
                            disabled={isUpdating}
                            onClick={() => handleIncrement(item)}
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 0,
                              color: "#555",
                              "&:hover": { background: PINK[50], color: PINK[600] },
                            }}
                          >
                            <Plus size={13} />
                          </IconButton>
                        </Box>

                        {/* Item total */}
                        <Box sx={{ textAlign: "right" }}>
                          <Typography fontSize={11} color="text.disabled" lineHeight={1.3}>
                            Item total
                          </Typography>
                          <Typography fontWeight={800} fontSize={{ xs: 14, sm: 16 }} color="#1a1a1a">
                            ₹{(unitPrice * item.quantity).toFixed(0)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>

    <AddToCartDetailsModal
      open={!!addModalItem}
      productImage={addModalItem?.product?.images?.[0] ?? ""}
      productName={addModalItem?.product?.name ?? "Product"}
      submitting={!!addModalItem && actionLoading === addModalItem.id}
      title="Add one more — who is this for?"
      onClose={() => setAddModalItem(null)}
      onSubmit={handleAddInstanceSubmit}
    />

    <Dialog open={!!pickerItem} onClose={() => setPickerItem(null)} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: 16 }}>
        Which one do you want to remove?
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        <List sx={{ py: 0 }}>
          {pickerItem?.instanceDetails.map((detail, index) => (
            <ListItemButton
              key={index}
              onClick={() => pickerItem && handleRemoveInstance(pickerItem, index)}
              disabled={actionLoading === pickerItem?.id}
              sx={{ display: "flex", gap: 1.5, alignItems: "center", borderRadius: 2, mb: 1, border: "1px solid #f0f0f0" }}
            >
              <Box
                component="img"
                src={detail.images?.[0] || "https://placehold.co/48x48/f5f5f5/bbb?text=img"}
                alt=""
                sx={{ width: 48, height: 48, borderRadius: 1.5, objectFit: "cover", flexShrink: 0, background: "#f5f5f5" }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography fontSize={13} fontWeight={700}>
                  {detail.date ? new Date(detail.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                </Typography>
                <Typography fontSize={12} color="text.secondary" noWrap>
                  {detail.description || "No description"}
                </Typography>
              </Box>
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
    </Dialog>
    </>
  );
};
