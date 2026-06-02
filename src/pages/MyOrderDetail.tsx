import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Divider, Button, TextField, Rating } from "@mui/material";
import { ArrowLeft, ClipboardList, Package, CheckCircle2, Clock, Truck, XCircle, RefreshCw, CreditCard, Calendar, Hash, MapPin, Star, Edit3 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { orderService, OrderItem, OrderStatus } from "../services/orderService";
import { orderReviewService, OrderReview } from "../services/orderReviewService";
import { useAppSelector } from "../store/hooks";

const PINK = { 600: "#C2185B", 500: "#D81B60", 50: "#FFF0F6", 100: "#FCE4EC" };

const STATUS_FLOW: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];

const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string; icon: any; desc: string }> = {
  pending: { label: "Order Placed", color: "#F57C00", bg: "#FFF3E0", icon: Clock, desc: "Your order has been received" },
  confirmed: { label: "Confirmed", color: "#1976D2", bg: "#E3F2FD", icon: CheckCircle2, desc: "Order confirmed by the seller" },
  processing: { label: "Processing", color: "#7B1FA2", bg: "#F3E5F5", icon: RefreshCw, desc: "Your order is being prepared" },
  shipped: { label: "Shipped", color: "#0288D1", bg: "#E1F5FE", icon: Truck, desc: "Your order is on the way" },
  delivered: { label: "Delivered", color: "#388E3C", bg: "#E8F5E9", icon: Package, desc: "Order delivered successfully" },
  cancelled: { label: "Cancelled", color: "#D32F2F", bg: "#FFEBEE", icon: XCircle, desc: "This order has been cancelled" },
};

const InfoRow = ({ icon: Icon, label, value, valueColor }: { icon: any; label: string; value: string; valueColor?: string }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1 }}>
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: "8px",
        background: PINK[50],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon size={15} color={PINK[600]} />
    </Box>
    <Box>
      <Typography fontSize={11} color="text.disabled" lineHeight={1.2}>
        {label}
      </Typography>
      <Typography fontSize={14} fontWeight={700} sx={{ color: valueColor ?? "#1a1a1a" }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

export const MyOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const user = useAppSelector((s) => s.auth.user);

  const [order, setOrder] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [review, setReview] = useState<OrderReview | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [editingReview, setEditingReview] = useState(false);

  useEffect(() => {
    if (id) loadOrder();
  }, [id]);

  useEffect(() => {
    if (id && order?.status === "delivered") loadReview();
  }, [id, order?.status]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await orderService.getById(id!);
      setOrder(data);
    } catch {
      enqueueSnackbar("Failed to load order", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const loadReview = async () => {
    try {
      const data = await orderReviewService.getByOrderId(id!);
      if (data) {
        setReview(data);
        setReviewRating(data.ratings);
        setReviewText(data.description);
      }
    } catch {
      // no review yet — that's fine
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !id) return;
    try {
      setReviewLoading(true);
      const saved = await orderReviewService.submit({
        orderid: id,
        customerid: user.id,
        Customername: user.name ?? user.full_name ?? user.email,
        ratings: reviewRating,
        description: reviewText,
      });
      setReview(saved);
      setEditingReview(false);
      enqueueSnackbar("Review saved successfully!", { variant: "success" });
    } catch {
      enqueueSnackbar("Failed to save review", { variant: "error" });
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: PINK[500] }} />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <Typography variant="h6" color="text.secondary">
          Order not found
        </Typography>
        <Button onClick={() => navigate("/my-orders")} sx={{ mt: 2, color: PINK[600] }}>
          Back to Orders
        </Button>
      </Box>
    );
  }

  const isCancelled = order.status === "cancelled";
  const currentIdx = STATUS_FLOW.indexOf(order.status);

  const statusMeta = STATUS_META[order.status];
  const StatusIcon = statusMeta.icon;

  return (
    <Box sx={{ background: "#f7f7fa", minHeight: "100vh" }}>
      {/* Top breadcrumb bar */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
          px: { xs: 2, md: 4 },
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box
          onClick={() => navigate("/my-orders")}
          sx={{ display: "flex", alignItems: "center", gap: 0.8, color: "rgba(255,255,255,0.85)", cursor: "pointer", "&:hover": { color: "#fff" } }}
        >
          <ArrowLeft size={16} />
          <Typography fontSize={13} fontWeight={600}>
            My Orders
          </Typography>
        </Box>
        <Typography fontSize={13} sx={{ color: "rgba(255,255,255,0.5)", mx: 0.5 }}>
          /
        </Typography>
        <Typography fontSize={13} fontWeight={700} color="#fff">
          #{order.id.slice(-8).toUpperCase()}
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 900, mx: "auto", px: { xs: 1.5, sm: 2, md: 3 }, py: 3 }}>
        {/* Order header card */}
        <Box sx={{ background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.07)", mb: 3 }}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
              px: 3,
              py: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <ClipboardList size={22} color="#fff" />
              <Box>
                <Typography fontWeight={900} fontSize={18} color="#fff">
                  Order #{order.id.slice(-8).toUpperCase()}
                </Typography>
                <Typography fontSize={12} sx={{ color: "rgba(255,255,255,0.75)" }}>
                  Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.8,
                background: statusMeta.bg,
                color: statusMeta.color,
                px: 1.5,
                py: 0.8,
                borderRadius: "20px",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              <StatusIcon size={14} strokeWidth={2.5} />
              {statusMeta.label}
            </Box>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 }, display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4,1fr)" }, gap: 0 }}>
            <InfoRow icon={Hash} label="Order ID" value={`#${order.id.slice(-8).toUpperCase()}`} />
            <InfoRow
              icon={Calendar}
              label="Date"
              value={new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            />
            <InfoRow
              icon={CreditCard}
              label="Payment"
              value={order.ispayment ? "Paid" : "Pending"}
              valueColor={order.ispayment ? "#388E3C" : "#F57C00"}
            />
            <InfoRow icon={Package} label="Items" value={`${order.products.length} product${order.products.length !== 1 ? "s" : ""}`} />
          </Box>
        </Box>

        {/* Status tracker */}
        <Box sx={{ background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", mb: 3 }}>
          <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "center", gap: 1 }}>
            <MapPin size={17} color={PINK[600]} />
            <Typography fontWeight={800} fontSize={15}>
              Order Tracking
            </Typography>
          </Box>

          {isCancelled ? (
            <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "#FFEBEE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <XCircle size={24} color="#D32F2F" />
              </Box>
              <Box>
                <Typography fontWeight={800} fontSize={16} color="#D32F2F">
                  Order Cancelled
                </Typography>
                <Typography fontSize={13} color="text.secondary">
                  This order has been cancelled.
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
              {/* Horizontal stepper for md+, vertical for xs */}
              <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
                {/* connector line */}
                <Box sx={{ position: "absolute", top: 16, left: "10%", right: "10%", height: 3, background: "#f0f0f0", zIndex: 0 }} />
                <Box
                  sx={{
                    position: "absolute",
                    top: 16,
                    left: "10%",
                    height: 3,
                    zIndex: 1,
                    transition: "width 0.4s",
                    background: `linear-gradient(90deg, ${PINK[600]}, ${PINK[500]})`,
                    width: currentIdx < 0 ? "0%" : `${(currentIdx / (STATUS_FLOW.length - 1)) * 80}%`,
                  }}
                />

                {STATUS_FLOW.map((s, i) => {
                  const m = STATUS_META[s];
                  const Icon = m.icon;
                  const done = currentIdx >= i;
                  const active = currentIdx === i;
                  return (
                    <Box key={s} sx={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative", zIndex: 2 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: done ? (active ? `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})` : m.bg) : "#f5f5f5",
                          border: `3px solid ${done ? (active ? PINK[600] : m.color) : "#e0e0e0"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: active ? `0 0 0 4px ${PINK[100]}` : "none",
                          transition: "all 0.25s",
                        }}
                      >
                        <Icon size={15} color={done ? (active ? "#fff" : m.color) : "#ccc"} strokeWidth={2.5} />
                      </Box>
                      <Typography
                        fontSize={11}
                        fontWeight={done ? 700 : 400}
                        mt={1}
                        textAlign="center"
                        sx={{ color: done ? m.color : "text.disabled", lineHeight: 1.3 }}
                      >
                        {m.label}
                      </Typography>
                      {active && (
                        <Typography fontSize={10} color="text.disabled" textAlign="center" mt={0.3}>
                          {m.desc}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>

              {/* Mobile: vertical */}
              <Box sx={{ display: { xs: "flex", sm: "none" }, flexDirection: "column" }}>
                {STATUS_FLOW.map((s, i) => {
                  const m = STATUS_META[s];
                  const Icon = m.icon;
                  const done = currentIdx >= i;
                  const active = currentIdx === i;
                  return (
                    <Box key={s} sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background: done ? (active ? `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})` : m.bg) : "#f5f5f5",
                            border: `2.5px solid ${done ? (active ? PINK[600] : m.color) : "#e0e0e0"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: active ? `0 0 0 4px ${PINK[100]}` : "none",
                          }}
                        >
                          <Icon size={14} color={done ? (active ? "#fff" : m.color) : "#ccc"} strokeWidth={2.5} />
                        </Box>
                        {i < STATUS_FLOW.length - 1 && (
                          <Box sx={{ width: 2, height: 28, background: done && currentIdx > i ? m.color : "#e0e0e0", my: 0.3 }} />
                        )}
                      </Box>
                      <Box sx={{ pt: 0.5, pb: i < STATUS_FLOW.length - 1 ? 0 : 0 }}>
                        <Typography fontSize={13} fontWeight={done ? 700 : 400} sx={{ color: done ? m.color : "text.disabled" }}>
                          {m.label}
                        </Typography>
                        {active && (
                          <Typography fontSize={12} color="text.secondary">
                            {m.desc}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>

        {/* Products list */}
        <Box sx={{ background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", mb: 3 }}>
          <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "center", gap: 1 }}>
            <Package size={17} color={PINK[600]} />
            <Typography fontWeight={800} fontSize={15}>
              Ordered Items
            </Typography>
            <Box sx={{ ml: "auto", background: PINK[50], color: PINK[600], fontSize: 12, fontWeight: 700, px: 1, py: 0.2, borderRadius: 1 }}>
              {order.products.length}
            </Box>
          </Box>

          <Box sx={{ p: { xs: 1.5, sm: 2 }, display: "flex", flexDirection: "column", gap: 1.5 }}>
            {order.products.length === 0 ? (
              <Typography fontSize={14} color="text.secondary" textAlign="center" py={2}>
                No product details available
              </Typography>
            ) : (
              order.products.map((product, i) => (
                <Box
                  key={product.id || i}
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    alignItems: "center",
                    p: 1.5,
                    borderRadius: "12px",
                    background: "#fafafa",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <Box
                    component="img"
                    src={product.image || "https://placehold.co/60x60/f5f5f5/bbb?text=img"}
                    alt={product.title}
                    sx={{ width: 60, height: 60, borderRadius: "10px", objectFit: "cover", flexShrink: 0, background: "#eee" }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={700} fontSize={14} noWrap>
                      {product.title || "Product"}
                    </Typography>
                    {product.price !== product.offerprice && (
                      <Typography fontSize={12} sx={{ textDecoration: "line-through", color: "#bbb" }}>
                        ₹{product.price}
                      </Typography>
                    )}
                  </Box>
                  <Typography fontWeight={900} fontSize={15} sx={{ color: PINK[600], flexShrink: 0 }}>
                    ₹{product.offerprice || product.price}
                  </Typography>
                  <Typography fontWeight={900} fontSize={15} sx={{ color: PINK[600], flexShrink: 0 }}></Typography>
                  <Typography fontSize={14} fontWeight={600} color="text.secondary">
                    Qty: {order?.productsRawInfo?.[i]?.quantity}{" "}
                  </Typography>
                </Box>
              ))
            )}
          </Box>

          <Divider sx={{ borderColor: "#f5f5f5" }} />
          <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
            {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography fontSize={14} color="text.secondary">Subtotal</Typography>
              <Typography fontSize={14} fontWeight={600}>₹{order.totalprice.toFixed(0)}</Typography>
            </Box> */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography fontSize={14} color="text.secondary">
                Shipping
              </Typography>
              <Typography fontSize={14} fontWeight={600} color="text.secondary">
                {Number(order.totalprice.toFixed(0)) > 50 ? 0 : "₹6"}
              </Typography>
            </Box>
            <Divider sx={{ borderColor: "#f5f5f5", mb: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography fontWeight={800} fontSize={16}>
                Total
              </Typography>
              <Typography fontWeight={900} fontSize={20} sx={{ color: PINK[600] }}>
                ₹{order.totalprice.toFixed(0)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Review section — only for delivered orders */}
        {order.status === "delivered" && (
          <Box sx={{ background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", mb: 3 }}>
            <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "center", gap: 1 }}>
              <Star size={17} color={PINK[600]} />
              <Typography fontWeight={800} fontSize={15}>
                Your Review
              </Typography>
              {review && !editingReview && (
                <Box
                  onClick={() => setEditingReview(true)}
                  sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer", color: PINK[600], fontSize: 13, fontWeight: 600 }}
                >
                  <Edit3 size={14} />
                  Edit
                </Box>
              )}
            </Box>

            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              {review && !editingReview ? (
                /* Existing review display */
                <Box>
                  <Rating value={review.ratings} readOnly precision={1} sx={{ "& .MuiRating-iconFilled": { color: PINK[500] } }} />
                  <Typography fontSize={14} color="text.secondary" mt={1} sx={{ whiteSpace: "pre-wrap" }}>
                    {review.description || <em>No description added.</em>}
                  </Typography>
                  <Typography fontSize={11} color="text.disabled" mt={1}>
                    Reviewed on {new Date(review.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                  </Typography>
                </Box>
              ) : (
                /* Review form */
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box>
                    <Typography fontSize={13} fontWeight={600} mb={0.5}>
                      Rate your experience
                    </Typography>
                    <Rating
                      value={reviewRating}
                      onChange={(_, v) => setReviewRating(v ?? 1)}
                      size="large"
                      sx={{ "& .MuiRating-iconFilled": { color: PINK[500] } }}
                    />
                  </Box>
                  <TextField
                    label="Write your review (optional)"
                    multiline
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    fullWidth
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        "&.Mui-focused fieldset": { borderColor: PINK[500] },
                      },
                      "& label.Mui-focused": { color: PINK[600] },
                    }}
                  />
                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <Button
                      variant="contained"
                      onClick={handleSubmitReview}
                      disabled={reviewLoading || reviewRating === 0}
                      sx={{
                        background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
                        borderRadius: "30px",
                        px: 3,
                        fontWeight: 700,
                        boxShadow: "none",
                        "&:hover": { background: PINK[600], boxShadow: "none" },
                      }}
                    >
                      {reviewLoading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : review ? "Update Review" : "Submit Review"}
                    </Button>
                    {editingReview && (
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setEditingReview(false);
                          setReviewRating(review?.ratings ?? 5);
                          setReviewText(review?.description ?? "");
                        }}
                        sx={{ borderColor: "#ccc", color: "#666", borderRadius: "30px", px: 2, fontWeight: 700 }}
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        )}

        <Button
          onClick={() => navigate("/products")}
          variant="outlined"
          sx={{
            borderColor: PINK[500],
            color: PINK[600],
            borderRadius: "30px",
            px: 3,
            fontWeight: 700,
            "&:hover": { borderColor: PINK[600], background: PINK[50] },
          }}
        >
          Continue Shopping
        </Button>
      </Box>
    </Box>
  );
};
