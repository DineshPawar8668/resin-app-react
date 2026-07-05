import { Box } from "@mui/material";
import { Instagram } from "lucide-react";

const INSTAGRAM_URL = "https://www.instagram.com/arpitaa_resin_gallery?igsh=MXF6bDhqeW1mdWYzdg==";
const WHATSAPP_URL = "https://wa.me/917620342754";

const WhatsAppIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-1.746-.873-2.888-1.559-4.035-3.535-.305-.526.305-.489.874-1.627.099-.198.05-.371-.05-.52-.099-.148-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.05 3.132 4.966 4.27 2.916 1.14 2.916.76 3.485.71.57-.05 1.758-.718 2.005-1.412.247-.694.247-1.289.173-1.412-.074-.124-.272-.198-.57-.347z" />
    <path d="M12.04 2c-5.523 0-10 4.477-10 10 0 1.784.466 3.53 1.348 5.06L2 22l5.06-1.335A9.958 9.958 0 0012.04 22c5.523 0 10-4.477 10-10s-4.477-10-10-10zm0 18.13a8.09 8.09 0 01-4.13-1.13l-.296-.176-3.006.793.803-2.933-.192-.301A8.12 8.12 0 013.91 12c0-4.482 3.648-8.13 8.13-8.13 4.482 0 8.13 3.648 8.13 8.13 0 4.482-3.648 8.13-8.13 8.13z" />
  </svg>
);

export const SocialFloatingButtons = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: { xs: 84, sm: 96 },
        right: { xs: 12, sm: 24 },
        zIndex: 1400,
        display: "flex",
        flexDirection: "column",
        gap: 1.2,
      }}
    >
      <Box
        component="a"
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Visit our Instagram"
        sx={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f58529, #dd2a7b, #8134af, #515bd4)",
          boxShadow: "0 4px 16px rgba(221,42,123,0.45)",
          transition: "transform 0.2s ease",
          "&:hover": { transform: "scale(1.08)" },
          "&:active": { transform: "scale(0.95)" },
        }}
      >
        <Instagram size={22} color="#fff" />
      </Box>

      <Box
        component="a"
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        sx={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#25D366",
          boxShadow: "0 4px 16px rgba(37,211,102,0.45)",
          transition: "transform 0.2s ease",
          "&:hover": { transform: "scale(1.08)" },
          "&:active": { transform: "scale(0.95)" },
        }}
      >
        <WhatsAppIcon />
      </Box>
    </Box>
  );
};
