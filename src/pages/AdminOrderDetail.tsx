import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Divider, Select, MenuItem, Button } from "@mui/material";
import { ArrowLeft, ClipboardList, User, Package, CheckCircle2, Clock, Truck, XCircle, RefreshCw, CreditCard, Calendar, Hash } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { orderService, OrderItem, OrderStatus } from "../services/orderService";
import { getImageUrl } from "../lib/imageUrl";

const PINK = { 600: "#C2185B", 500: "#D81B60", 50: "#FFF0F6", 100: "#FCE4EC" };

const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: "Pending", color: "#F57C00", bg: "#FFF3E0", icon: Clock },
  confirmed: { label: "Confirmed", color: "#1976D2", bg: "#E3F2FD", icon: CheckCircle2 },
  processing: { label: "Processing", color: "#7B1FA2", bg: "#F3E5F5", icon: RefreshCw },
  shipped: { label: "Shipped", color: "#0288D1", bg: "#E1F5FE", icon: Truck },
  delivered: { label: "Delivered", color: "#388E3C", bg: "#E8F5E9", icon: Package },
  cancelled: { label: "Cancelled", color: "#D32F2F", bg: "#FFEBEE", icon: XCircle },
};

const ALL_STATUSES: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

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

export const AdminOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [order, setOrder] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("pending");

  useEffect(() => {
    if (id) loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await orderService.getById(id!);
      setOrder(data);
      setSelectedStatus(data.status);
    } catch {
      enqueueSnackbar("Failed to load order", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!order || selectedStatus === order.status) return;
    try {
      setStatusUpdating(true);
      const updated = await orderService.updateStatus(order.id, selectedStatus);
      setOrder(updated);
      enqueueSnackbar("Order status updated", { variant: "success" });
    } catch {
      enqueueSnackbar("Failed to update status", { variant: "error" });
    } finally {
      setStatusUpdating(false);
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
        <Button onClick={() => navigate("/admin/orders")} sx={{ mt: 2, color: PINK[600] }}>
          Back to Orders
        </Button>
      </Box>
    );
  }

  const statusMeta = STATUS_META[order.status];
  const StatusIcon = statusMeta.icon;

  return (
    <Box sx={{ background: "#f7f7fa", minHeight: "100vh" }}>
      {/* Top bar */}
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
          onClick={() => navigate("/admin/orders")}
          sx={{ display: "flex", alignItems: "center", gap: 0.8, color: "rgba(255,255,255,0.85)", cursor: "pointer", "&:hover": { color: "#fff" } }}
        >
          <ArrowLeft size={16} />
          <Typography fontSize={13} fontWeight={600}>
            All Orders
          </Typography>
        </Box>
        <Typography fontSize={13} sx={{ color: "rgba(255,255,255,0.5)", mx: 0.5 }}>
          /
        </Typography>
        <Typography fontSize={13} fontWeight={700} color="#fff">
          #{order.id.slice(-8).toUpperCase()}
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 1.5, sm: 2, md: 3 }, py: 3 }}>
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

          <Box sx={{ p: { xs: 2, sm: 3 }, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4,1fr)" }, gap: 0 }}>
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

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 340px" }, gap: 3, alignItems: "flex-start" }}>
          {/* LEFT: Products + Customer */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Products */}
            <Box sx={{ background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "center", gap: 1 }}>
                <Package size={17} color={PINK[600]} />
                <Typography fontWeight={800} fontSize={15}>
                  Ordered Products
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

              {/* Total breakdown */}
              <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography fontSize={14} color="text.secondary">
                    Subtotal
                  </Typography>
                  <Typography fontSize={14} fontWeight={600}>
                    ₹{order.totalprice.toFixed(0)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Typography fontSize={14} color="text.secondary">
                    Shipping
                  </Typography>
                  <Typography fontSize={14} fontWeight={600} color="success.main">
                    FREE
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

            {/* Customer */}
            <Box sx={{ background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "center", gap: 1 }}>
                <User size={17} color={PINK[600]} />
                <Typography fontWeight={800} fontSize={15}>
                  Customer Details
                </Typography>
              </Box>
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                {order.customer ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Typography fontWeight={800} color="#fff" fontSize={18}>
                        {order.customer.name?.[0]?.toUpperCase() ?? "U"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography fontWeight={700} fontSize={15}>
                        {order.customer.name}
                      </Typography>
                      <Typography fontSize={13} color="text.secondary">
                        {order.customer.email}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Typography fontSize={14} color="text.secondary">
                    Customer details not available
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* RIGHT: Status management */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box
              sx={{
                background: "#fff",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                position: { md: "sticky" },
                top: { md: 84 },
              }}
            >
              <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "center", gap: 1 }}>
                <RefreshCw size={17} color={PINK[600]} />
                <Typography fontWeight={800} fontSize={15}>
                  Update Status
                </Typography>
              </Box>

              <Box sx={{ p: 2.5 }}>
                {/* Status timeline */}
                <Box sx={{ mb: 3 }}>
                  {ALL_STATUSES.filter((s) => s !== "cancelled").map((s, i, arr) => {
                    const m = STATUS_META[s];
                    const Icon = m.icon;
                    const currentIdx = ALL_STATUSES.indexOf(order.status);
                    const thisIdx = ALL_STATUSES.indexOf(s);
                    const isDone = order.status !== "cancelled" && currentIdx >= thisIdx;
                    return (
                      <Box key={s} sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: i < arr.length - 1 ? 0 : 0 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: isDone ? m.bg : "#f5f5f5",
                              border: `2px solid ${isDone ? m.color : "#e0e0e0"}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              transition: "all 0.2s",
                            }}
                          >
                            <Icon size={14} color={isDone ? m.color : "#ccc"} strokeWidth={2} />
                          </Box>
                          {i < arr.length - 1 && (
                            <Box
                              sx={{
                                width: 2,
                                height: 20,
                                background: isDone && currentIdx > thisIdx ? m.color : "#e0e0e0",
                                my: 0.3,
                                transition: "background 0.2s",
                              }}
                            />
                          )}
                        </Box>
                        <Typography fontSize={13} fontWeight={isDone ? 700 : 400} color={isDone ? m.color : "text.disabled"}>
                          {m.label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>

                <Divider sx={{ borderColor: "#f5f5f5", mb: 2 }} />

                <Typography fontSize={13} color="text.secondary" mb={1} fontWeight={600}>
                  Change Status
                </Typography>
                <Select
                  fullWidth
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                  size="small"
                  sx={{ mb: 1.5, fontSize: 13, borderRadius: 2 }}
                >
                  {ALL_STATUSES.map((s) => (
                    <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {(() => {
                          const Icon = STATUS_META[s].icon;
                          return <Icon size={13} color={STATUS_META[s].color} />;
                        })()}
                        {STATUS_META[s].label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>

                <Button
                  fullWidth
                  variant="contained"
                  disabled={statusUpdating || selectedStatus === order.status}
                  onClick={handleStatusUpdate}
                  sx={{
                    py: 1.2,
                    borderRadius: 2,
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
                    "&:hover": { background: `linear-gradient(135deg, #a3154e, ${PINK[600]})` },
                    "&:disabled": { background: "#f5f5f5", color: "#bbb" },
                  }}
                >
                  {statusUpdating ? <CircularProgress size={16} color="inherit" /> : "Update Status"}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
