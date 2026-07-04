import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { X, ImagePlus, Trash2 } from "lucide-react";

const PINK = { 600: "#C2185B", 500: "#D81B60", 50: "#FFF0F6", 100: "#FCE4EC" };
const MAX_IMAGES = 12;

export interface AddToCartFormValues {
  date: string;
  description: string;
  images: File[];
}

interface AddToCartDetailsModalProps {
  open: boolean;
  productImage: string;
  productName: string;
  title?: string;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: AddToCartFormValues) => void | Promise<void>;
}

export const AddToCartDetailsModal = ({
  open,
  productImage,
  productName,
  title,
  submitting = false,
  onClose,
  onSubmit,
}: AddToCartDetailsModalProps) => {
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ date?: string; details?: string; images?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setDate("");
      setName("");
      setMessage("");
      setImages([]);
      setPreviews([]);
      setErrors({});
    }
  }, [open]);

  useEffect(() => {
    const urls = images.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [images]);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files?.length) return;
    const incoming = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setImages((prev) => [...prev, ...incoming].slice(0, MAX_IMAGES));
    setErrors((prev) => ({ ...prev, images: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!date) next.date = "Date is required";
    if (!name.trim() || !message.trim()) next.details = "Name and Message are mandatory";
    if (images.length === 0) next.images = "At least one image is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const description = `Name: ${name.trim()}\nMessage: ${message.trim()}`;
    await onSubmit({ date, description, images });
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <IconButton
        onClick={onClose}
        disabled={submitting}
        sx={{ position: "absolute", top: 8, right: 8, zIndex: 1, color: "#999" }}
      >
        <X size={18} />
      </IconButton>

      <DialogContent sx={{ pt: 4, pb: 3 }}>
        {/* Product image — top middle */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2.5 }}>
          <Box
            component="img"
            src={productImage || "https://placehold.co/140x140/f5f5f5/bbb?text=img"}
            alt={productName}
            sx={{ width: 120, height: 120, borderRadius: "16px", objectFit: "cover", background: "#f8f8f8", border: "1px solid #f0f0f0" }}
          />
          <Typography fontWeight={700} fontSize={15} mt={1.5} textAlign="center">
            {productName}
          </Typography>
          <Typography fontSize={13} color="text.secondary" mt={0.3} textAlign="center">
            {title ?? "Tell us who this order is for"}
          </Typography>
        </Box>

        {/* Date field */}
        <TextField
          label="Date *"
          type="date"
          fullWidth
          size="small"
          value={date}
          onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: undefined })); }}
          error={!!errors.date}
          helperText={errors.date}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />

        {/* Name field — label is fixed, not part of the editable value */}
        <TextField
          label="Name *"
          fullWidth
          size="small"
          placeholder="Who is this for?"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, details: undefined })); }}
          error={!!errors.details}
          sx={{ mb: 2 }}
        />

        {/* Message field — label is fixed, not part of the editable value */}
        <TextField
          label="Message *"
          fullWidth
          multiline
          rows={3}
          size="small"
          placeholder="Add any details for this item (e.g. customization notes)..."
          value={message}
          onChange={(e) => { setMessage(e.target.value); setErrors((p) => ({ ...p, details: undefined })); }}
          error={!!errors.details}
          helperText={errors.details}
          sx={{ mb: 2 }}
        />

        {/* Image upload grid */}
        <Typography fontSize={13} fontWeight={600} mb={1}>
          Upload Images * ({images.length}/{MAX_IMAGES})
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1 }}>
          {previews.map((src, i) => (
            <Box
              key={i}
              sx={{
                position: "relative",
                aspectRatio: "1",
                borderRadius: 1.5,
                overflow: "hidden",
                border: "1px solid #eee",
              }}
            >
              <Box component="img" src={src} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <IconButton
                size="small"
                onClick={() => removeImage(i)}
                sx={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  width: 20,
                  height: 20,
                  background: "rgba(0,0,0,0.55)",
                  color: "#fff",
                  "&:hover": { background: "rgba(0,0,0,0.75)" },
                }}
              >
                <Trash2 size={11} />
              </IconButton>
            </Box>
          ))}
          {images.length < MAX_IMAGES && (
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                aspectRatio: "1",
                borderRadius: 1.5,
                border: `1.5px dashed ${errors.images ? "#e53935" : "#ddd"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#999",
                "&:hover": { borderColor: PINK[500], color: PINK[500] },
              }}
            >
              <ImagePlus size={20} />
            </Box>
          )}
        </Box>
        {errors.images && (
          <Typography fontSize={12} color="error" mt={0.5}>{errors.images}</Typography>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFilesSelected(e.target.files)}
        />

        <Button
          fullWidth
          variant="contained"
          disabled={submitting}
          onClick={handleSubmit}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{
            mt: 3,
            py: 1.3,
            fontWeight: 700,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
            "&:hover": { background: `linear-gradient(135deg, #a3154e, ${PINK[600]})` },
          }}
        >
          {submitting ? "Adding..." : "Add to Cart"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
