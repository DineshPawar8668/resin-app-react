import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setCartItems as setCartItemsAction, clearCart as clearCartAction } from "../store/slices/cartSlice";
import { cartService } from "../services/cartService";
import { paymentService } from "../services/paymentService";
import { useSnackbar } from "notistack";
import { CartItem } from "../types";
import { BASE_URL } from "../constant";
import { CheckCircle2, MapPin, ShoppingBag, CreditCard, ChevronRight, Home, Briefcase, MoreHorizontal } from "lucide-react";

const PINK = { 600: "#C2185B", 500: "#D81B60", 400: "#E91E63", 100: "#FCE4EC", 50: "#FFF0F6" };

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

type Step = "address" | "review";

interface AddressForm {
  fullName: string;
  phone: string;
  pincode: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  addressType: "home" | "work" | "other";
}

const emptyAddress: AddressForm = {
  fullName: "", phone: "", pincode: "", addressLine1: "", addressLine2: "",
  landmark: "", city: "", state: "", addressType: "home",
};

const addressErrors = (f: AddressForm) => ({
  fullName: !f.fullName.trim() ? "Full name is required" : "",
  phone: !f.phone.trim() ? "Phone is required" : !/^[6-9]\d{9}$/.test(f.phone) ? "Enter valid 10-digit mobile number" : "",
  pincode: !f.pincode.trim() ? "Pincode is required" : !/^\d{6}$/.test(f.pincode) ? "Enter valid 6-digit pincode" : "",
  addressLine1: !f.addressLine1.trim() ? "Address is required" : "",
  city: !f.city.trim() ? "City is required" : "",
  state: !f.state ? "State is required" : "",
  addressLine2: "",
  landmark: "",
  addressType: "",
});

const TYPE_ICONS: Record<string, any> = { home: Home, work: Briefcase, other: MoreHorizontal };

export const Checkout = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();

  const [step, setStep] = useState<Step>("address");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<AddressForm>(emptyAddress);
  const [touched, setTouched] = useState<Partial<Record<keyof AddressForm, boolean>>>({});
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user) loadCart();
  }, [user]);

  const loadCart = async () => {
    try {
      const items = await cartService.getCartItems(user!.id);
      setCartItems(items);
      dispatch(setCartItemsAction(items));
    } catch {
      enqueueSnackbar("Failed to load cart", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const errors = addressErrors(address);
  const isAddressValid = Object.values(errors).every((e) => !e);

  const handleAddressChange = (field: keyof AddressForm, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof AddressForm) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleAddressContinue = () => {
    setTouched({ fullName: true, phone: true, pincode: true, addressLine1: true, city: true, state: true });
    if (isAddressValid) setStep("review");
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.discount_price ?? item.product?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);
  const shipping = subtotal > 50 ? 0 : 6;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    if (!user || cartItems.length === 0) return;
    try {
      setProcessing(true);
      const products = cartItems.map((i) => ({ product_id: i.product_id, quantity: i.quantity }));
      const paymentData = await paymentService.initiatePayment(user.id, products);
      setProcessing(false);

      paymentService.openCheckout(
        paymentData,
        user.name ?? "Customer",
        user.email ?? "",
        async (razorpayResponse) => {
          try {
            setProcessing(true);
            await paymentService.verifyPayment(
              razorpayResponse.razorpay_order_id,
              razorpayResponse.razorpay_payment_id,
              razorpayResponse.razorpay_signature,
              user.id,
              products,
              address,
            );
            await cartService.clearCart(user.id);
            dispatch(clearCartAction());
            enqueueSnackbar("Order placed successfully! Payment confirmed.", { variant: "success" });
            navigate("/my-orders");
          } catch {
            enqueueSnackbar("Payment verification failed. Please contact support.", { variant: "error" });
          } finally {
            setProcessing(false);
          }
        },
        () => { enqueueSnackbar("Payment cancelled.", { variant: "info" }); },
      );
    } catch {
      enqueueSnackbar("Failed to initiate payment. Please try again.", { variant: "error" });
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: PINK[500] }} />
      </Box>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Box sx={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
        <ShoppingBag size={56} color={PINK[300]} strokeWidth={1.5} />
        <Typography variant="h6" fontWeight={700}>Your cart is empty</Typography>
        <Button variant="contained" sx={{ background: PINK[500] }} onClick={() => navigate("/products")}>
          Shop Now
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ background: "#f0f0f0", minHeight: "100vh", fontFamily: '"Poppins", sans-serif' }}>
      {/* Header */}
      <Box sx={{ background: "#fff", borderBottom: "1px solid #e0e0e0", px: { xs: 2, md: 4 }, py: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
        <Typography fontWeight={800} fontSize={20} sx={{ color: PINK[600], cursor: "pointer" }} onClick={() => navigate("/")}>
          Shopi Nova
        </Typography>
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
          <StepChip active={step === "address"} done={step === "review"} num={1} label="ADDRESS" />
          <ChevronRight size={14} color="#bbb" />
          <StepChip active={step === "review"} done={false} num={2} label="ORDER SUMMARY" />
          <ChevronRight size={14} color="#bbb" />
          <StepChip active={false} done={false} num={3} label="PAYMENT" />
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 1, sm: 2, md: 3 }, py: 3, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 340px" }, gap: 2, alignItems: "flex-start" }}>
        {/* LEFT PANEL */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* ── ADDRESS STEP ── */}
          <Box sx={{ background: "#fff", borderRadius: 2, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            {/* Step header */}
            <Box
              sx={{ px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between", background: step === "address" ? PINK[50] : "#fff", borderBottom: "1px solid #f5f5f5", cursor: step === "review" ? "pointer" : "default" }}
              onClick={() => step === "review" && setStep("address")}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <StepBadge num={1} done={step === "review"} active={step === "address"} />
                <Typography fontWeight={700} fontSize={14} letterSpacing={0.5}>DELIVERY ADDRESS</Typography>
              </Box>
              {step === "review" && (
                <Typography fontSize={12} sx={{ color: PINK[600], fontWeight: 700, cursor: "pointer" }}>CHANGE</Typography>
              )}
            </Box>

            {step === "address" && (
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <FField label="Full Name *" value={address.fullName} onChange={(v) => handleAddressChange("fullName", v)}
                    onBlur={() => handleBlur("fullName")} error={touched.fullName ? errors.fullName : ""} />
                  <FField label="Mobile Number *" value={address.phone} onChange={(v) => handleAddressChange("phone", v)}
                    onBlur={() => handleBlur("phone")} error={touched.phone ? errors.phone : ""} type="tel" />
                  <FField label="Pincode *" value={address.pincode} onChange={(v) => handleAddressChange("pincode", v)}
                    onBlur={() => handleBlur("pincode")} error={touched.pincode ? errors.pincode : ""} type="number" />
                  <FField label="City / District *" value={address.city} onChange={(v) => handleAddressChange("city", v)}
                    onBlur={() => handleBlur("city")} error={touched.city ? errors.city : ""} />
                  <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
                    <FField label="Address (House No, Street, Area) *" value={address.addressLine1}
                      onChange={(v) => handleAddressChange("addressLine1", v)} onBlur={() => handleBlur("addressLine1")}
                      error={touched.addressLine1 ? errors.addressLine1 : ""} />
                  </Box>
                  <FField label="Locality / Town (Optional)" value={address.addressLine2} onChange={(v) => handleAddressChange("addressLine2", v)} />
                  <FField label="Landmark (Optional)" value={address.landmark} onChange={(v) => handleAddressChange("landmark", v)} />
                  <Box>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ fontSize: 13 }}>State *</InputLabel>
                      <Select
                        label="State *"
                        value={address.state}
                        onChange={(e) => handleAddressChange("state", e.target.value)}
                        onBlur={() => handleBlur("state")}
                        error={touched.state && Boolean(errors.state)}
                        sx={{ fontSize: 13, borderRadius: "8px" }}
                      >
                        {INDIAN_STATES.map((s) => <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>{s}</MenuItem>)}
                      </Select>
                      {touched.state && errors.state && <Typography fontSize={11} color="error" mt={0.3} ml={1.5}>{errors.state}</Typography>}
                    </FormControl>
                  </Box>
                </Box>

                {/* Address type */}
                <Box sx={{ mt: 2.5 }}>
                  <Typography fontSize={12} fontWeight={700} color="text.secondary" mb={1}>ADDRESS TYPE</Typography>
                  <RadioGroup row value={address.addressType} onChange={(e) => handleAddressChange("addressType", e.target.value)}>
                    {(["home", "work", "other"] as const).map((t) => {
                      const Icon = TYPE_ICONS[t];
                      return (
                        <FormControlLabel
                          key={t}
                          value={t}
                          control={<Radio size="small" sx={{ color: PINK[400], "&.Mui-checked": { color: PINK[500] } }} />}
                          label={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <Icon size={14} />
                              <Typography fontSize={13} fontWeight={600} textTransform="capitalize">{t}</Typography>
                            </Box>
                          }
                        />
                      );
                    })}
                  </RadioGroup>
                </Box>

                <Button
                  variant="contained"
                  onClick={handleAddressContinue}
                  sx={{ mt: 3, px: 5, py: 1.3, fontWeight: 700, fontSize: 14, borderRadius: 1, background: PINK[500], "&:hover": { background: PINK[600] } }}
                >
                  DELIVER HERE
                </Button>
              </Box>
            )}

            {/* Address summary when on review step */}
            {step === "review" && (
              <Box sx={{ px: 3, py: 2, display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                <CheckCircle2 size={18} color="#388E3C" />
                <Box>
                  <Typography fontWeight={700} fontSize={14}>{address.fullName}
                    <Box component="span" sx={{ ml: 1, background: "#e8f5e9", color: "#388E3C", fontSize: 10, fontWeight: 700, px: 0.8, py: 0.2, borderRadius: 1, textTransform: "uppercase" }}>
                      {address.addressType}
                    </Box>
                  </Typography>
                  <Typography fontSize={13} color="text.secondary" mt={0.3}>
                    {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}{address.landmark ? `, ${address.landmark}` : ""}, {address.city}, {address.state} – {address.pincode}
                  </Typography>
                  <Typography fontSize={13} color="text.secondary">Mobile: {address.phone}</Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* ── ORDER SUMMARY STEP ── */}
          {step === "review" && (
            <Box sx={{ background: "#fff", borderRadius: 2, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #f5f5f5", background: PINK[50], display: "flex", alignItems: "center", gap: 1.5 }}>
                <StepBadge num={2} done={false} active={true} />
                <Typography fontWeight={700} fontSize={14} letterSpacing={0.5}>ORDER SUMMARY</Typography>
              </Box>

              <Box sx={{ p: { xs: 1.5, sm: 2.5 }, display: "flex", flexDirection: "column", gap: 1.5 }}>
                {cartItems.map((item) => {
                  const price = item.product?.discount_price ?? item.product?.price ?? 0;
                  const imgSrc = item.product?.images?.[0] ? `${BASE_URL}${item.product.images[0]}` : "";
                  return (
                    <Box key={item.id} sx={{ display: "flex", gap: 2, p: 1.5, borderRadius: 2, border: "1px solid #f5f5f5", alignItems: "center" }}>
                      <Box
                        component="img"
                        src={imgSrc}
                        alt={item.product?.name}
                        sx={{ width: 72, height: 72, borderRadius: 1.5, objectFit: "cover", flexShrink: 0, background: "#fafafa" }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={700} fontSize={14} noWrap>{item.product?.name}</Typography>
                        <Typography fontSize={12} color="text.secondary">Qty: {item.quantity}</Typography>
                        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 0.5 }}>
                          <Typography fontWeight={800} fontSize={15} sx={{ color: "#0f1111" }}>₹{(price * item.quantity).toFixed(0)}</Typography>
                          {item.product?.price && item.product.discount_price && item.product.price > item.product.discount_price && (
                            <Typography fontSize={12} color="text.disabled" sx={{ textDecoration: "line-through" }}>₹{(item.product.price * item.quantity).toFixed(0)}</Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              <Divider />
              <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography fontSize={14} color="text.secondary">Subtotal ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})</Typography>
                  <Typography fontSize={14} fontWeight={600}>₹{subtotal.toFixed(0)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Typography fontSize={14} color="text.secondary">Delivery Charges</Typography>
                  {shipping === 0
                    ? <Typography fontSize={14} fontWeight={700} color="success.main">FREE</Typography>
                    : <Typography fontSize={14} fontWeight={600}>₹{shipping}</Typography>}
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                  <Typography fontWeight={800} fontSize={16}>Total Amount</Typography>
                  <Typography fontWeight={900} fontSize={20} sx={{ color: PINK[600] }}>₹{total.toFixed(0)}</Typography>
                </Box>
                {shipping === 0 && (
                  <Typography fontSize={12} sx={{ color: "success.main", mb: 2, fontWeight: 600 }}>
                    🎉 You saved ₹6 on delivery!
                  </Typography>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={processing}
                  startIcon={processing ? <CircularProgress size={18} color="inherit" /> : <CreditCard size={18} />}
                  onClick={handlePlaceOrder}
                  sx={{ py: 1.5, fontWeight: 800, fontSize: 15, borderRadius: 1, background: PINK[500], "&:hover": { background: PINK[600] }, "&:disabled": { background: "#f0f0f0" } }}
                >
                  {processing ? "Processing..." : "PROCEED TO PAYMENT"}
                </Button>
                <Typography fontSize={11} color="text.secondary" textAlign="center" mt={1}>
                  You'll complete payment via Razorpay on the next screen
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* RIGHT: Price summary (sticky) */}
        <Box sx={{ background: "#fff", borderRadius: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", position: { md: "sticky" }, top: { md: 16 } }}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid #f5f5f5" }}>
            <Typography fontWeight={700} fontSize={13} color="text.secondary" letterSpacing={0.5}>PRICE DETAILS</Typography>
          </Box>
          <Box sx={{ px: 2.5, py: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.2 }}>
              <Typography fontSize={14}>Price ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})</Typography>
              <Typography fontSize={14}>₹{subtotal.toFixed(0)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.2 }}>
              <Typography fontSize={14}>Delivery Charges</Typography>
              {shipping === 0
                ? <Typography fontSize={14} color="success.main" fontWeight={700}>FREE</Typography>
                : <Typography fontSize={14}>₹{shipping}</Typography>}
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography fontWeight={800} fontSize={16}>Total Amount</Typography>
              <Typography fontWeight={900} fontSize={18} sx={{ color: PINK[600] }}>₹{total.toFixed(0)}</Typography>
            </Box>
            {shipping === 0 && (
              <Typography fontSize={12} color="success.main" fontWeight={600} mt={1.5}>
                You will save ₹6 on this order
              </Typography>
            )}
          </Box>
          <Box sx={{ px: 2.5, pb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.5, background: "#f9f9f9", borderRadius: 1.5 }}>
              <MapPin size={16} color={PINK[500]} />
              <Typography fontSize={12} color="text.secondary">
                {step === "review"
                  ? `Delivering to ${address.city}, ${address.state} – ${address.pincode}`
                  : "Add delivery address to continue"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

/* ── small helper components ── */
function StepChip({ active, done, num, label }: { active: boolean; done: boolean; num: number; label: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, opacity: active || done ? 1 : 0.45 }}>
      <Box
        sx={{
          width: 22, height: 22, borderRadius: "50%",
          background: done ? "#388E3C" : active ? PINK[500] : "#bbb",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {done ? <CheckCircle2 size={13} color="#fff" /> : <Typography fontSize={11} fontWeight={800} color="#fff">{num}</Typography>}
      </Box>
      <Typography fontSize={11} fontWeight={700} sx={{ display: { xs: "none", sm: "block" } }}>{label}</Typography>
    </Box>
  );
}

function StepBadge({ num, done, active }: { num: number; done: boolean; active: boolean }) {
  return (
    <Box
      sx={{
        width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
        background: done ? "#388E3C" : active ? PINK[500] : "#e0e0e0",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {done
        ? <CheckCircle2 size={14} color="#fff" />
        : <Typography fontSize={12} fontWeight={800} color={active ? "#fff" : "#777"}>{num}</Typography>}
    </Box>
  );
}

function FField({
  label, value, onChange, onBlur, error, type,
}: {
  label: string; value: string; onChange: (v: string) => void;
  onBlur?: () => void; error?: string; type?: string;
}) {
  return (
    <TextField
      fullWidth size="small" label={label} value={value} type={type}
      onChange={(e) => onChange(e.target.value)} onBlur={onBlur}
      error={Boolean(error)} helperText={error}
      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" }, "& label": { fontSize: 13 }, "& input": { fontSize: 13 } }}
    />
  );
}
