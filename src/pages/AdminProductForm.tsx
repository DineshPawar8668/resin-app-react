import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowLeft,
  ChevronRight,
  DollarSign,
  Package,
  Percent,
  Plus,
  Ruler,
  Tag,
  UploadCloud,
  Video,
  X,
  Image as ImageIcon,
  Play,
} from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { categoryService, CategoryItem } from '../services/categoryService';
import { productService } from '../services/productService';
import { ProductType } from '../types';

const PINK = { 600: '#C2185B', 500: '#D81B60' };

const PRODUCT_TYPES = [
  { value: ProductType.REGULAR, label: 'Regular', desc: 'Standard product listing', color: '#1976D2', bg: 'rgba(25,118,210,0.08)' },
  { value: ProductType.FEATURED, label: 'Featured', desc: 'Highlighted on homepage', color: '#9C27B0', bg: 'rgba(156,39,176,0.08)' },
  { value: ProductType.DEAL_OF_THE_DAY, label: 'Deal of the Day', desc: 'Special daily deal with extra visibility', color: '#F57C00', bg: 'rgba(245,124,0,0.08)' },
];

const validationSchema = Yup.object({
  title: Yup.string().trim().required('Product title is required'),
  description: Yup.string().trim().required('Description is required'),
  // price validated manually when hasSizes=false
  discountpercent: Yup.number().min(0, 'Min 0').max(100, 'Max 100'),
  product_type: Yup.number().required('Product type is required'),
  category_id: Yup.string().required('Category is required'),
  is_active: Yup.boolean(),
});

interface FormValues {
  title: string;
  description: string;
  price: number | '';
  discountpercent: number | '';
  product_type: ProductType;
  category_id: string;
  is_active: boolean;
  size: string;
}

interface ImageSlot {
  existingPublicId?: string;
  file?: File;
  preview: string;
}

interface SizeRow {
  _key: string;
  size: string;
  price: number | '';
  discountpercent: number | '';
}

const fieldSx = {
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: PINK[500] },
  '& .MuiInputLabel-root.Mui-focused': { color: PINK[500] },
};

const EMPTY_SLOT: ImageSlot = { preview: '' };

export const AdminProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [pageLoading, setPageLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  // ── Size variants state ───────────────────────────────────────────────────
  const [hasSizes, setHasSizes] = useState(false);
  const [sizeRows, setSizeRows] = useState<SizeRow[]>([
    { _key: '1', size: '', price: '', discountpercent: '' },
  ]);
  const [sizeRowError, setSizeRowError] = useState('');
  const rowKeyRef = useRef(2);

  // ── Media state ───────────────────────────────────────────────────────────
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>([EMPTY_SLOT, EMPTY_SLOT, EMPTY_SLOT, EMPTY_SLOT]);
  const [mediaError, setMediaError] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [videoExistingId, setVideoExistingId] = useState('');
  const [removeVideo, setRemoveVideo] = useState(false);
  // Public_id of a video pre-uploaded to Cloudinary this session (not yet attached to a saved product)
  const [videoUploadPublicId, setVideoUploadPublicId] = useState('');
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const activeSlotRef = useRef<number>(-1);

  const formik = useFormik<FormValues>({
    initialValues: {
      title: '', description: '', price: '', discountpercent: 0,
      product_type: ProductType.REGULAR, category_id: '', is_active: true, size: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      if (videoUploading) {
        enqueueSnackbar('Please wait for the video to finish uploading', { variant: 'warning' });
        return;
      }
      const hasAnyImage = imageSlots.some((s) => s.preview);
      if (!hasAnyImage) { setMediaError('At least one product image is required'); return; }
      setMediaError('');

      // ── Size variants path ──────────────────────────────────
      if (hasSizes && !isEdit) {
        const rowErrors: string[] = [];
        sizeRows.forEach((row, i) => {
          if (!row.size.trim()) rowErrors.push(`Row ${i + 1}: Size name is required`);
          if (!row.price || Number(row.price) <= 0) rowErrors.push(`Row ${i + 1}: Price must be > 0`);
          if (Number(row.discountpercent) < 0 || Number(row.discountpercent) > 100)
            rowErrors.push(`Row ${i + 1}: Discount must be 0–100`);
        });
        if (rowErrors.length > 0) { setSizeRowError(rowErrors[0]); return; }
        setSizeRowError('');
        setSubmitting(true);
        try {
          const fd = new FormData();
          fd.append('title', values.title.trim());
          fd.append('description', values.description.trim());
          fd.append('product_type', String(values.product_type));
          if (values.category_id) fd.append('category_id', values.category_id);
          fd.append('is_active', String(values.is_active));
          fd.append('size_variants', JSON.stringify(
            sizeRows.map((r) => ({
              size: r.size.trim(),
              price: Number(r.price),
              discountpercent: Number(r.discountpercent) || 0,
            }))
          ));
          imageSlots.forEach((slot) => { if (slot.file) fd.append('images', slot.file); });
          if (videoUploadPublicId) fd.append('video_public_id', videoUploadPublicId);

          await productService.createWithSizes(fd);
          enqueueSnackbar('Products created successfully', { variant: 'success' });
          navigate('/admin/products');
        } catch {
          enqueueSnackbar('Failed to create products', { variant: 'error' });
        } finally {
          setSubmitting(false);
        }
        return;
      }

      // ── Single product path ─────────────────────────────────
      if (!isEdit && (!values.price || Number(values.price) <= 0)) {
        formik.setFieldError('price', 'Price is required and must be greater than 0');
        return;
      }

      setSubmitting(true);
      try {
        const fd = new FormData();
        fd.append('title', values.title.trim());
        fd.append('description', values.description?.trim() ?? '');
        fd.append('price', String(values.price));
        fd.append('discountpercent', String(values.discountpercent || 0));
        fd.append('product_type', String(values.product_type));
        if (values.category_id) fd.append('category_id', values.category_id);
        fd.append('is_active', String(values.is_active));
        if (values.size) fd.append('size', values.size.trim());

        if (isEdit) {
          imageSlots.forEach((slot) => {
            if (slot.existingPublicId && !slot.file) fd.append('existingImages', slot.existingPublicId);
          });
          if (removeVideo) fd.append('removeVideo', 'true');
        }

        imageSlots.forEach((slot) => { if (slot.file) fd.append('images', slot.file); });
        if (videoUploadPublicId) fd.append('video_public_id', videoUploadPublicId);

        if (isEdit && id) {
          await productService.update(id, fd);
          enqueueSnackbar('Product updated successfully', { variant: 'success' });
        } else {
          await productService.create(fd);
          enqueueSnackbar('Product created successfully', { variant: 'success' });
        }
        navigate('/admin/products');
      } catch {
        enqueueSnackbar('Failed to save product', { variant: 'error' });
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(() => {});

    if (isEdit && id) {
      productService.getById(id)
        .then((p) => {
          formik.setValues({
            title: p.title, description: p.description, price: p.price,
            discountpercent: p.discountpercent, product_type: p.product_type,
            category_id: p.category_id ?? '', is_active: p.is_active,
            size: p.size ?? '',
          });

          const slots: ImageSlot[] = [EMPTY_SLOT, EMPTY_SLOT, EMPTY_SLOT, EMPTY_SLOT];
          p.imagePublicIds.forEach((publicId, i) => {
            if (i < 4) slots[i] = { existingPublicId: publicId, preview: p.images[i] };
          });
          setImageSlots(slots);

          if (p.videoPublicId) {
            setVideoExistingId(p.videoPublicId);
            setVideoPreview(p.video ?? '');
          }
        })
        .catch(() => {
          enqueueSnackbar('Failed to load product', { variant: 'error' });
          navigate('/admin/products');
        })
        .finally(() => setPageLoading(false));
    }
  }, [id]);

  // ── Size row handlers ─────────────────────────────────────────────────────
  const addSizeRow = () => {
    setSizeRows((prev) => [...prev, { _key: String(rowKeyRef.current++), size: '', price: '', discountpercent: '' }]);
  };

  const removeSizeRow = (key: string) => {
    setSizeRows((prev) => prev.filter((r) => r._key !== key));
  };

  const updateSizeRow = (key: string, field: keyof Omit<SizeRow, '_key'>, value: string) => {
    setSizeRowError('');
    setSizeRows((prev) => prev.map((r) => r._key === key ? { ...r, [field]: value } : r));
  };

  // ── Image slot handlers ───────────────────────────────────────────────────
  const handleSlotClick = (index: number) => {
    activeSlotRef.current = index;
    if (imageInputRef.current) { imageInputRef.current.value = ''; imageInputRef.current.click(); }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const slot = activeSlotRef.current;
    if (!file || slot < 0) return;
    if (!file.type.startsWith('image/')) { enqueueSnackbar('Only image files are allowed', { variant: 'error' }); return; }
    setImageSlots((prev) => { const next = [...prev]; next[slot] = { file, preview: URL.createObjectURL(file) }; return next; });
    setMediaError('');
    e.target.value = '';
  };

  const handleRemoveSlot = (index: number) => {
    setImageSlots((prev) => { const next = [...prev]; next[index] = EMPTY_SLOT; return next; });
  };

  // ── Video slot handlers ───────────────────────────────────────────────────
  // Uploads the video to Cloudinary immediately so the eventual product save request stays fast.
  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('video/')) { enqueueSnackbar('Only video files are allowed', { variant: 'error' }); return; }

    // A previous pre-uploaded (not yet saved) video is being swapped out — clean it up
    const staleUploadId = videoUploadPublicId;

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setRemoveVideo(false);
    setVideoUploadPublicId('');
    setVideoUploadProgress(0);
    setVideoUploading(true);

    if (staleUploadId) {
      productService.deleteUploadedVideo(staleUploadId).catch(() => {});
    }

    try {
      const publicId = await productService.uploadVideo(file, setVideoUploadProgress);
      setVideoUploadPublicId(publicId);
    } catch {
      enqueueSnackbar('Video upload failed', { variant: 'error' });
      setVideoFile(null);
      setVideoPreview('');
    } finally {
      setVideoUploading(false);
    }
  };

  const handleRemoveVideo = () => {
    if (videoUploadPublicId) {
      productService.deleteUploadedVideo(videoUploadPublicId).catch(() => {});
    }
    setVideoFile(null); setVideoPreview(''); setRemoveVideo(true); setVideoExistingId('');
    setVideoUploadPublicId(''); setVideoUploadProgress(0);
  };

  const price = Number(formik.values.price) || 0;
  const discount = Number(formik.values.discountpercent) || 0;
  const offerPrice = parseFloat((price - (price * discount) / 100).toFixed(2));
  const saving = price > 0 ? price - offerPrice : 0;
  const hasVideo = Boolean(videoPreview);

  if (pageLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: PINK[500] }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
      {/* Page Header */}
      <Box sx={{ background: `linear-gradient(135deg, ${PINK[600]} 0%, ${PINK[500]} 100%)`, py: { xs: 2.5, sm: 3 }, px: { xs: 2, sm: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
          <Typography fontSize={12} color="rgba(255,255,255,0.75)" sx={{ cursor: 'pointer', '&:hover': { color: '#fff' } }} onClick={() => navigate('/admin/products')}>
            Products
          </Typography>
          <ChevronRight size={12} color="rgba(255,255,255,0.6)" />
          <Typography fontSize={12} color="#fff">{isEdit ? 'Edit Product' : 'New Product'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/admin/products')} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }, p: 1 }}>
            <ArrowLeft size={20} />
          </IconButton>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={20} color="#fff" />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#fff" lineHeight={1.2}>
              {isEdit ? 'Edit Product' : 'Create Product'}
            </Typography>
            <Typography fontSize={12} color="rgba(255,255,255,0.8)">
              {isEdit ? 'Update the product details below' : 'Fill in the details to create a new product'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
      <input ref={videoInputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleVideoChange} />

      {/* Form Body */}
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, sm: 3 }, py: 4 }}>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>

            {/* ── Left column: form fields ── */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Basic Info */}
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
                <SectionHeader icon={<Package size={16} color={PINK[500]} />} iconBg={`${PINK[500]}18`} title="Basic Information" />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 2.5 }}>
                  <TextField label="Product Title *" name="title" fullWidth autoFocus value={formik.values.title} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.title && !!formik.errors.title} helperText={formik.touched.title && formik.errors.title} sx={fieldSx} />
                  <TextField label="Description *" name="description" fullWidth multiline rows={4} value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.description && !!formik.errors.description} helperText={formik.touched.description && formik.errors.description} placeholder="Describe your product in detail…" sx={fieldSx} />
                </Box>
              </Card>

              {/* Pricing */}
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
                {/* Pricing header with toggle */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <SectionHeader icon={<DollarSign size={16} color="#1976D2" />} iconBg="rgba(25,118,210,0.1)" title="Pricing" />
                  {!isEdit && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={hasSizes}
                          onChange={(e) => { setHasSizes(e.target.checked); setSizeRowError(''); }}
                          size="small"
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: PINK[500] },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: PINK[500] },
                          }}
                        />
                      }
                      label={<Typography fontSize={12} fontWeight={600} color="text.secondary">Multiple sizes</Typography>}
                      labelPlacement="start"
                      sx={{ mr: 0, gap: 0.5 }}
                    />
                  )}
                </Box>

                {hasSizes && !isEdit ? (
                  /* ── Size variants cards ── */
                  <Box>
                    {/* Info banner */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5, p: 1.5, bgcolor: 'rgba(25,118,210,0.06)', borderRadius: 2, border: '1px solid rgba(25,118,210,0.18)' }}>
                      <Ruler size={14} color="#1976D2" />
                      <Typography fontSize={12} color="#1976D2" fontWeight={600} lineHeight={1.4}>
                        Each row creates a separate product — images are shared across all sizes
                      </Typography>
                    </Box>

                    {sizeRowError && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 1.2, bgcolor: 'rgba(211,47,47,0.07)', borderRadius: 1.5, border: '1px solid rgba(211,47,47,0.2)' }}>
                        <Typography fontSize={12} color="error" fontWeight={600}>{sizeRowError}</Typography>
                      </Box>
                    )}

                    {/* Size rows as cards */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {sizeRows.map((row, index) => {
                        const p = Number(row.price) || 0;
                        const d = Number(row.discountpercent) || 0;
                        const offer = p > 0 ? parseFloat((p - (p * d) / 100).toFixed(2)) : 0;
                        const rowSaving = p > 0 ? p - offer : 0;
                        return (
                          <Box
                            key={row._key}
                            sx={{
                              border: '1.5px solid',
                              borderColor: 'divider',
                              borderRadius: 2.5,
                              p: 2,
                              bgcolor: 'background.paper',
                              transition: 'border-color 0.2s, box-shadow 0.2s',
                              '&:hover': { borderColor: `${PINK[500]}50`, boxShadow: `0 2px 10px ${PINK[500]}10` },
                            }}
                          >
                            {/* Row header */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#1976D2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <Typography fontSize={11} fontWeight={800} color="#fff" lineHeight={1}>{index + 1}</Typography>
                                </Box>
                                <Typography fontSize={12} fontWeight={600} color="text.secondary">Size Variant</Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => sizeRows.length > 1 && removeSizeRow(row._key)}
                                disabled={sizeRows.length === 1}
                                sx={{
                                  color: sizeRows.length > 1 ? '#d32f2f' : 'text.disabled',
                                  p: 0.6,
                                  borderRadius: 1.5,
                                  '&:hover': { bgcolor: sizeRows.length > 1 ? 'rgba(211,47,47,0.08)' : 'transparent' },
                                }}
                              >
                                <X size={15} />
                              </IconButton>
                            </Box>

                            {/* Input fields */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 0.9fr', gap: 1.5 }}>
                              <TextField
                                label="Size name"
                                size="small"
                                placeholder="e.g. Small"
                                value={row.size}
                                onChange={(e) => updateSizeRow(row._key, 'size', e.target.value)}
                                sx={fieldSx}
                              />
                              <TextField
                                label="Price"
                                size="small"
                                type="number"
                                placeholder="0"
                                value={row.price}
                                onChange={(e) => updateSizeRow(row._key, 'price', e.target.value)}
                                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment>, inputProps: { min: 0, step: 1 } }}
                                sx={fieldSx}
                              />
                              <TextField
                                label="Discount"
                                size="small"
                                type="number"
                                placeholder="0"
                                value={row.discountpercent}
                                onChange={(e) => updateSizeRow(row._key, 'discountpercent', e.target.value)}
                                InputProps={{ endAdornment: <InputAdornment position="end"><Percent size={11} /></InputAdornment>, inputProps: { min: 0, max: 100 } }}
                                sx={fieldSx}
                              />
                            </Box>

                            {/* Offer price strip */}
                            {p > 0 && (
                              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 1.5, px: 1.5, py: 1, bgcolor: `${PINK[500]}08`, border: `1px solid ${PINK[500]}20`, borderRadius: 1.5 }}>
                                <Typography fontSize={11} color="text.secondary" mr={0.5}>Offer price:</Typography>
                                <Typography fontWeight={800} fontSize={15} color={PINK[600]}>₹{offer.toFixed(2)}</Typography>
                                {d > 0 && (
                                  <>
                                    <Typography fontSize={11} color="text.disabled" sx={{ textDecoration: 'line-through' }}>₹{p}</Typography>
                                    <Chip label={`${d}% off`} size="small" sx={{ height: 20, fontSize: 10, bgcolor: 'rgba(244,67,54,0.1)', color: '#D32F2F', fontWeight: 700 }} />
                                    <Chip label={`Save ₹${rowSaving.toFixed(2)}`} size="small" sx={{ height: 20, fontSize: 10, bgcolor: 'rgba(76,175,80,0.1)', color: '#2e7d32', fontWeight: 700, ml: 'auto' }} />
                                  </>
                                )}
                              </Box>
                            )}
                          </Box>
                        );
                      })}
                    </Box>

                    {/* Add size button */}
                    <Button
                      fullWidth
                      startIcon={<Plus size={15} />}
                      onClick={addSizeRow}
                      sx={{
                        mt: 2,
                        py: 1.1,
                        color: PINK[500],
                        border: `1.5px dashed ${PINK[500]}60`,
                        borderRadius: 2.5,
                        fontWeight: 700,
                        fontSize: 13,
                        textTransform: 'none',
                        bgcolor: 'transparent',
                        '&:hover': { bgcolor: `${PINK[500]}06`, border: `1.5px dashed ${PINK[500]}` },
                        transition: 'all 0.18s',
                      }}
                    >
                      Add Size
                    </Button>
                  </Box>
                ) : (
                  /* ── Single price/discount ── */
                  <>
                    {/* Size field — edit mode only when product has a size */}
                    {isEdit && (
                      <Box sx={{ mb: 2 }}>
                        <TextField
                          label="Size (optional)"
                          name="size"
                          value={formik.values.size}
                          onChange={formik.handleChange}
                          placeholder="e.g. Small, Medium, Large, 10×12 inch…"
                          fullWidth
                          size="small"
                          sx={fieldSx}
                        />
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2.5 }}>
                      <TextField label="Original Price *" name="price" type="number" value={formik.values.price} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.price && !!formik.errors.price} helperText={(formik.touched.price && (formik.errors.price as string)) || ' '} sx={{ ...fieldSx, flex: '1 1 140px' }} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment>, inputProps: { min: 0, step: 0.01 } }} />
                      <TextField label="Discount %" name="discountpercent" type="number" value={formik.values.discountpercent} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.discountpercent && !!formik.errors.discountpercent} helperText={(formik.touched.discountpercent && (formik.errors.discountpercent as string)) || ' '} sx={{ ...fieldSx, flex: '1 1 140px' }} InputProps={{ endAdornment: <InputAdornment position="end"><Percent size={14} /></InputAdornment>, inputProps: { min: 0, max: 100, step: 1 } }} />
                    </Box>
                    {price > 0 && (
                      <Box sx={{ background: `linear-gradient(135deg, ${PINK[500]}08, ${PINK[600]}05)`, border: `1px solid ${PINK[500]}28`, borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Box>
                          <Typography fontSize={11} color="text.secondary" mb={0.3}>Offer Price (auto-calculated)</Typography>
                          <Typography fontWeight={800} fontSize={24} color={PINK[600]}>₹{offerPrice.toFixed(2)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                          {saving > 0 && <Chip label={`Save ₹${saving.toFixed(2)}`} size="small" sx={{ bgcolor: 'rgba(76,175,80,0.12)', color: '#2e7d32', fontWeight: 700, fontSize: 12 }} />}
                          {discount > 0 && <Chip label={`${discount}% off`} size="small" sx={{ bgcolor: 'rgba(244,67,54,0.1)', color: '#D32F2F', fontWeight: 700, fontSize: 11 }} />}
                        </Box>
                      </Box>
                    )}
                  </>
                )}
              </Card>

              {/* Classification */}
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
                <SectionHeader icon={<Tag size={16} color="#9C27B0" />} iconBg="rgba(156,39,176,0.1)" title="Classification" />
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2.5 }}>
                  <FormControl sx={{ ...fieldSx, flex: '1 1 180px' }} error={formik.touched.category_id && !!formik.errors.category_id}>
                    <InputLabel>Category *</InputLabel>
                    <Select name="category_id" value={formik.values.category_id} onChange={formik.handleChange} onBlur={formik.handleBlur} label="Category *">
                      <MenuItem value="" disabled>-- Select Category --</MenuItem>
                      {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                    </Select>
                    {formik.touched.category_id && formik.errors.category_id && (
                      <Typography fontSize={11} color="error" mt={0.5} ml={1.75}>{formik.errors.category_id}</Typography>
                    )}
                  </FormControl>
                  <FormControl sx={{ ...fieldSx, flex: '1 1 180px' }}>
                    <InputLabel>Product Type *</InputLabel>
                    <Select name="product_type" value={formik.values.product_type} onChange={formik.handleChange} label="Product Type *"
                      renderValue={(val) => {
                        const t = PRODUCT_TYPES.find((x) => x.value === val);
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: t?.color, flexShrink: 0 }} />
                            <Typography fontSize={14}>{t?.label}</Typography>
                          </Box>
                        );
                      }}
                    >
                      {PRODUCT_TYPES.map((t) => (
                        <MenuItem key={t.value} value={t.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: t.color }} />
                            </Box>
                            <Box>
                              <Typography fontSize={13} fontWeight={600}>{t.label}</Typography>
                              <Typography fontSize={11} color="text.secondary">{t.desc}</Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Divider sx={{ my: 2.5 }} />
                <FormControlLabel
                  control={<Switch checked={formik.values.is_active} onChange={(e) => formik.setFieldValue('is_active', e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: PINK[500] }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: PINK[500] } }} />}
                  label={
                    <Box>
                      <Typography fontSize={14} fontWeight={600}>Active</Typography>
                      <Typography fontSize={12} color="text.secondary">{formik.values.is_active ? 'Product is visible to customers' : 'Product is hidden from customers'}</Typography>
                    </Box>
                  }
                />
              </Card>
            </Box>

            {/* ── Right column: media upload ── */}
            <Box sx={{ width: { xs: '100%', md: 340 }, flexShrink: 0 }}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3, position: { md: 'sticky' }, top: { md: 24 } }}>

                {/* ── IMAGES ── */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: `${PINK[500]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ImageIcon size={14} color={PINK[500]} />
                    </Box>
                    <Typography fontWeight={700} fontSize={14}>Product Images</Typography>
                  </Box>
                  <Typography fontSize={11} color="text.secondary">
                    {imageSlots.filter((s) => s.preview).length} / 4
                  </Typography>
                </Box>

                {mediaError && <Typography fontSize={12} color="error" mb={1.5}>{mediaError}</Typography>}

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2, mb: 2 }}>
                  {imageSlots.map((slot, i) => (
                    <ImageSlotBox key={i} slot={slot} index={i} isFirst={i === 0} onAdd={() => handleSlotClick(i)} onRemove={() => handleRemoveSlot(i)} />
                  ))}
                </Box>

                <Typography fontSize={11} color="text.secondary" mb={2} sx={{ bgcolor: 'action.hover', borderRadius: 1.5, px: 1.5, py: 1 }}>
                  First image is the main thumbnail. PNG, JPG, WEBP · Max 5 MB each.
                  {hasSizes && ' Shared across all size variants.'}
                </Typography>

                <Divider sx={{ mb: 2 }} />

                {/* ── VIDEO ── */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: 'rgba(156,39,176,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Video size={14} color="#9C27B0" />
                    </Box>
                    <Typography fontWeight={700} fontSize={14}>Product Video</Typography>
                    <Chip label="optional" size="small" sx={{ fontSize: 10, height: 18, bgcolor: 'rgba(0,0,0,0.06)' }} />
                  </Box>
                </Box>

                {hasVideo ? (
                  <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', bgcolor: '#000' }}>
                    <Box component="video" src={videoPreview} controls={!videoUploading} sx={{ width: '100%', maxHeight: 160, display: 'block', objectFit: 'contain' }} />
                    <Box sx={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 0.8 }}>
                      <IconButton size="small" disabled={videoUploading} onClick={() => videoInputRef.current?.click()} sx={{ bgcolor: 'rgba(255,255,255,0.88)', '&:hover': { bgcolor: '#fff' }, p: 0.6 }}>
                        <UploadCloud size={14} color={PINK[600]} />
                      </IconButton>
                      <IconButton size="small" disabled={videoUploading} onClick={handleRemoveVideo} sx={{ bgcolor: 'rgba(211,47,47,0.88)', '&:hover': { bgcolor: '#c62828' }, p: 0.6 }}>
                        <X size={14} color="#fff" />
                      </IconButton>
                    </Box>
                    {videoFile && !videoUploading && (
                      <Box sx={{ position: 'absolute', bottom: 6, left: 6, bgcolor: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: 10, px: 1, py: 0.3, borderRadius: 1, maxWidth: 'calc(100% - 70px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {videoFile.name}
                      </Box>
                    )}
                    {videoUploading && (
                      <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, px: 3 }}>
                        <Typography fontSize={12} color="#fff" fontWeight={700}>
                          Uploading video… {videoUploadProgress}%
                        </Typography>
                        <Box sx={{ width: '100%' }}>
                          <LinearProgress
                            variant="determinate"
                            value={videoUploadProgress}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.25)',
                              '& .MuiLinearProgress-bar': { bgcolor: PINK[500] },
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box
                    onClick={() => videoInputRef.current?.click()}
                    sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, py: 3.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: '#9C27B0', bgcolor: 'rgba(156,39,176,0.04)' } }}
                  >
                    <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'rgba(156,39,176,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Play size={22} color="#9C27B0" />
                    </Box>
                    <Typography fontWeight={600} fontSize={13}>Click to upload video</Typography>
                    <Typography fontSize={11} color="text.disabled">MP4, WEBM, MOV · Max 100 MB</Typography>
                  </Box>
                )}
              </Card>
            </Box>
          </Box>

          {/* Submit Footer */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button variant="outlined" onClick={() => navigate('/admin/products')} disabled={submitting} sx={{ fontWeight: 600, borderColor: 'divider', px: 3, minWidth: 110 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submitting || videoUploading} sx={{ fontWeight: 700, px: 4, minWidth: 160, background: `linear-gradient(135deg, ${PINK[600]} 0%, ${PINK[500]} 100%)`, boxShadow: `0 4px 14px ${PINK[500]}50`, '&:hover': { background: `linear-gradient(135deg, ${PINK[600]} 0%, ${PINK[600]} 100%)` } }}>
              {submitting ? <CircularProgress size={20} color="inherit" /> : videoUploading ? `Uploading video… ${videoUploadProgress}%` : isEdit ? 'Update Product' : hasSizes ? `Create ${sizeRows.length} Product${sizeRows.length > 1 ? 's' : ''}` : 'Create Product'}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

// ── Sub-components ───────────────────────────────────────────────────────────

function ImageSlotBox({ slot, index, isFirst, onAdd, onRemove }: { slot: ImageSlot; index: number; isFirst: boolean; onAdd: () => void; onRemove: () => void; }) {
  const PINK500 = '#D81B60';
  if (slot.preview) {
    return (
      <Box sx={{ position: 'relative', borderRadius: 1.5, overflow: 'hidden', aspectRatio: '1', border: '1px solid #e0e0e0' }}>
        <Box component="img" src={slot.preview} alt={`Product image ${index + 1}`} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {isFirst && (
          <Box sx={{ position: 'absolute', top: 4, left: 4, bgcolor: PINK500, color: '#fff', fontSize: 9, fontWeight: 700, px: 0.8, py: 0.2, borderRadius: 0.8, lineHeight: 1.4 }}>MAIN</Box>
        )}
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8, opacity: 0, transition: 'opacity 0.18s', '&:hover': { opacity: 1 } }}>
          <IconButton size="small" onClick={onAdd} sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' }, p: 0.5 }}><UploadCloud size={13} color={PINK500} /></IconButton>
          <IconButton size="small" onClick={onRemove} sx={{ bgcolor: 'rgba(211,47,47,0.9)', '&:hover': { bgcolor: '#c62828' }, p: 0.5 }}><X size={13} color="#fff" /></IconButton>
        </Box>
      </Box>
    );
  }
  return (
    <Box onClick={onAdd} sx={{ aspectRatio: '1', borderRadius: 1.5, border: '2px dashed', borderColor: 'divider', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.6, cursor: 'pointer', transition: 'all 0.18s', '&:hover': { borderColor: PINK500, bgcolor: `${PINK500}06` }, bgcolor: '#fafafa' }}>
      {isFirst ? (
        <><UploadCloud size={22} color="#bdbdbd" /><Typography fontSize={10} color="text.disabled" fontWeight={600}>Main Image</Typography></>
      ) : (
        <><ImageIcon size={18} color="#bdbdbd" /><Typography fontSize={10} color="text.disabled">Photo {index + 1}</Typography></>
      )}
    </Box>
  );
}

function SectionHeader({ icon, iconBg, title }: { icon: React.ReactNode; iconBg: string; title: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </Box>
      <Typography fontWeight={700} fontSize={15}>{title}</Typography>
    </Box>
  );
}
