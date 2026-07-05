import { Dialog, DialogContent, Box, Typography, IconButton, Divider } from "@mui/material";
import { X, MapPin, Truck, ClipboardList } from "lucide-react";

const PINK = { 600: "#C2185B", 500: "#D81B60", 50: "#FFF0F6", 100: "#FCE4EC" };

interface CourierInfoModalProps {
  open: boolean;
  onClose: () => void;
}

const shippingAddress = [
  "Name: Arpita Vijay Bafna",
  "Address:",
  "Indra Sumana Sadan, House No. 152,",
  "Indira Nagar, Near Tukaram Maharaj Mandir,",
  "Dahiwal, Malegaon,",
  "Nashik – 423205, Maharashtra, India.",
  "Mobile: +91 90754 21021",
];

const courierDetails = ["Courier Company: ______", "Tracking ID: ______", "Dispatch Date: ______","Order ID:_______"];

const instructions = [
  "Pack your preservation carefully in a strong box.",
  "Do not fold or crush the preservation.",
  "Mention your Order ID and Name inside the package.",
  "Share the tracking ID on this number +919075421021 after dispatch.",
];

export const CourierInfoModal = ({ open, onClose }: CourierInfoModalProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { width: { xs: "calc(100% - 24px)", sm: 480, md: 600 }, m: { xs: 1.5, sm: 3 } } } }}
    >
      <Box
        sx={{
          background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
          px: { xs: 2, sm: 2.5, md: 3 },
          py: { xs: 1.5, sm: 2 },
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Typography fontWeight={800} fontSize={{ xs: 15, sm: 17, md: 18 }} color="#fff">
          💐 Send Your Preservation Things
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: "#fff", mt: -0.5, mr: -0.5, flexShrink: 0 }}>
          <X size={18} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Typography fontSize={13.5} color="text.secondary" mb={2.5}>
          You can courier to us, and we'll preserve it in beautiful resin art.
        </Typography>

        {/* Shipping Address */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <MapPin size={16} color={PINK[600]} />
          <Typography fontWeight={700} fontSize={14}>
            Shipping Address
          </Typography>
        </Box>
        <Box sx={{ background: PINK[50], borderRadius: 2, p: 1.5, mb: 2.5 }}>
          {shippingAddress.map((line, i) => (
            <Typography key={i} fontSize={13} lineHeight={1.7}>
              {line}
            </Typography>
          ))}
        </Box>

        

        {/* Important Instructions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <ClipboardList size={16} color={PINK[600]} />
          <Typography fontWeight={700} fontSize={14}>
            Important Instructions
          </Typography>
        </Box>
        <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 2 }}>
          {instructions.map((line, i) => (
            <Typography key={i} component="li" fontSize={13} lineHeight={1.8} color="text.secondary">
              {line}
            </Typography>
          ))}
        </Box>
{/* Courier Details */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1 }}>
          <Truck size={16} color={PINK[600]} style={{ flexShrink: 0, marginTop: 2 }} />
          <Typography fontWeight={700} fontSize={{ xs: 13, sm: 14 }} sx={{ wordBreak: "break-word" }}>
            Courier Details (Send this details to us on this mobile no: +919075421021)
          </Typography>
        </Box>
        <Box sx={{ background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: 2, p: 1.5, mb: 2.5 }}>
          {courierDetails.map((line, i) => (
            <Typography key={i} fontSize={13} lineHeight={1.7}>
              {line}
            </Typography>
          ))}
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ background: "#FFF8E1", borderRadius: 2, px: 1.5, py: 1.2 }}>
          <Typography fontSize={12.5} color="#8a5a00" fontWeight={600} lineHeight={1.6}>
            As per your order, sending this preservation item is mandatory — we cannot proceed with the next step of your order until it is received.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
