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
  Tag,
  UploadCloud,
  X,
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
  {
    value: ProductType.REGULAR,
    label: 'Regular',
    desc: 'Standard product listing',
    color: '#1976D2',
    bg: 'rgba(25,118,210,0.08)',
  },
  {
    value: ProductType.FEATURED,
    label: 'Featured',
    desc: 'Highlighted on homepage',
    color: '#9C27B0',
    bg: 'rgba(156,39,176,0.08)',
  },
  {
    value: ProductType.DEAL_OF_THE_DAY,
    label: 'Deal of the Day',
    desc: 'Special daily deal with extra visibility',
    color: '#F57C00',
    bg: 'rgba(245,124,0,0.08)',
  },
];

const validationSchema = Yup.object({
  title: Yup.string().trim().required('Product title is required'),
  description: Yup.string(),
  price: Yup.number()
    .typeError('Enter a valid price')
    .required('Price is required')
    .min(0.01, 'Price must be greater than 0'),
  discountpercent: Yup.number().min(0, 'Min 0').max(100, 'Max 100'),
  product_type: Yup.number().required(),
  category_id: Yup.string(),
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
}

const fieldSx = {
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: PINK[500],
  },
  '& .MuiInputLabel-root.Mui-focused': { color: PINK[500] },
};

export const AdminProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [pageLoading, setPageLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const formik = useFormik<FormValues>({
    initialValues: {
      title: '',
      description: '',
      price: '',
      discountpercent: 0,
      product_type: ProductType.REGULAR,
      category_id: '',
      is_active: true,
    },
    validationSchema,
    onSubmit: async (values) => {
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
        if (imageFile) fd.append('image', imageFile);

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
      productService
        .getById(id)
        .then((p) => {
          formik.setValues({
            title: p.title,
            description: p.description,
            price: p.price,
            discountpercent: p.discountpercent,
            product_type: p.product_type,
            category_id: p.category_id ?? '',
            is_active: p.is_active,
          });
          if (p.image) setImagePreview(p.image);
        })
        .catch(() => {
          enqueueSnackbar('Failed to load product', { variant: 'error' });
          navigate('/admin/products');
        })
        .finally(() => setPageLoading(false));
    }
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      enqueueSnackbar('Only image files are allowed', { variant: 'error' });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const price = Number(formik.values.price) || 0;
  const discount = Number(formik.values.discountpercent) || 0;
  const offerPrice = parseFloat((price - (price * discount) / 100).toFixed(2));
  const saving = price > 0 ? price - offerPrice : 0;

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
      <Box
        sx={{
          background: `linear-gradient(135deg, ${PINK[600]} 0%, ${PINK[500]} 100%)`,
          py: { xs: 2.5, sm: 3 },
          px: { xs: 2, sm: 4 },
        }}
      >
        {/* Breadcrumb */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
          <Typography
            fontSize={12}
            color="rgba(255,255,255,0.75)"
            sx={{ cursor: 'pointer', '&:hover': { color: '#fff' } }}
            onClick={() => navigate('/admin/products')}
          >
            Products
          </Typography>
          <ChevronRight size={12} color="rgba(255,255,255,0.6)" />
          <Typography fontSize={12} color="#fff">
            {isEdit ? 'Edit Product' : 'New Product'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => navigate('/admin/products')}
            sx={{
              color: '#fff',
              bgcolor: 'rgba(255,255,255,0.15)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
              p: 1,
            }}
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Package size={20} color="#fff" />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#fff" lineHeight={1.2}>
              {isEdit ? 'Edit Product' : 'Create Product'}
            </Typography>
            <Typography fontSize={12} color="rgba(255,255,255,0.8)">
              {isEdit
                ? 'Update the product details below'
                : 'Fill in the details to create a new product'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Form Body */}
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, sm: 3 }, py: 4 }}>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
            {/* ── Left column: form fields ── */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Basic Info */}
              <Card
                elevation={0}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}
              >
                <SectionHeader icon={<Package size={16} color={PINK[500]} />} iconBg={`${PINK[500]}18`} title="Basic Information" />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 2.5 }}>
                  <TextField
                    label="Product Title *"
                    name="title"
                    fullWidth
                    autoFocus
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.title && !!formik.errors.title}
                    helperText={formik.touched.title && formik.errors.title}
                    sx={fieldSx}
                  />
                  <TextField
                    label="Description"
                    name="description"
                    fullWidth
                    multiline
                    rows={4}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    placeholder="Describe your product in detail…"
                    sx={fieldSx}
                  />
                </Box>
              </Card>

              {/* Pricing */}
              <Card
                elevation={0}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}
              >
                <SectionHeader
                  icon={<DollarSign size={16} color="#1976D2" />}
                  iconBg="rgba(25,118,210,0.1)"
                  title="Pricing"
                />
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2.5, mb: 2.5 }}>
                  <TextField
                    label="Original Price *"
                    name="price"
                    type="number"
                    value={formik.values.price}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.price && !!formik.errors.price}
                    helperText={
                      (formik.touched.price && (formik.errors.price as string)) || ' '
                    }
                    sx={{ ...fieldSx, flex: '1 1 140px' }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">₹</InputAdornment>
                      ),
                      inputProps: { min: 0, step: 0.01 },
                    }}
                  />
                  <TextField
                    label="Discount %"
                    name="discountpercent"
                    type="number"
                    value={formik.values.discountpercent}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.discountpercent && !!formik.errors.discountpercent}
                    helperText={
                      (formik.touched.discountpercent &&
                        (formik.errors.discountpercent as string)) ||
                      ' '
                    }
                    sx={{ ...fieldSx, flex: '1 1 140px' }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Percent size={14} />
                        </InputAdornment>
                      ),
                      inputProps: { min: 0, max: 100, step: 1 },
                    }}
                  />
                </Box>

                {/* Offer price preview */}
                {price > 0 && (
                  <Box
                    sx={{
                      background: `linear-gradient(135deg, ${PINK[500]}08, ${PINK[600]}05)`,
                      border: `1px solid ${PINK[500]}28`,
                      borderRadius: 2,
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    <Box>
                      <Typography fontSize={11} color="text.secondary" mb={0.3}>
                        Offer Price (auto-calculated by server)
                      </Typography>
                      <Typography fontWeight={800} fontSize={24} color={PINK[600]}>
                        ₹{offerPrice.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                      {saving > 0 && (
                        <Chip
                          label={`Save ₹${saving.toFixed(2)}`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(76,175,80,0.12)',
                            color: '#2e7d32',
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        />
                      )}
                      {discount > 0 && (
                        <Chip
                          label={`${discount}% off`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(244,67,54,0.1)',
                            color: '#D32F2F',
                            fontWeight: 700,
                            fontSize: 11,
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                )}
              </Card>

              {/* Classification */}
              <Card
                elevation={0}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}
              >
                <SectionHeader
                  icon={<Tag size={16} color="#9C27B0" />}
                  iconBg="rgba(156,39,176,0.1)"
                  title="Classification"
                />

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2.5 }}>
                  {categories.length > 0 && (
                    <FormControl sx={{ ...fieldSx, flex: '1 1 180px' }}>
                      <InputLabel>Category</InputLabel>
                      <Select
                        name="category_id"
                        value={formik.values.category_id}
                        onChange={formik.handleChange}
                        label="Category"
                      >
                        <MenuItem value="">-- None --</MenuItem>
                        {categories.map((c) => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  <FormControl sx={{ ...fieldSx, flex: '1 1 180px' }}>
                    <InputLabel>Product Type *</InputLabel>
                    <Select
                      name="product_type"
                      value={formik.values.product_type}
                      onChange={formik.handleChange}
                      label="Product Type *"
                      renderValue={(val) => {
                        const t = PRODUCT_TYPES.find((x) => x.value === val);
                        return (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: t?.color,
                                flexShrink: 0,
                              }}
                            />
                            <Typography fontSize={14}>{t?.label}</Typography>
                          </Box>
                        );
                      }}
                    >
                      {PRODUCT_TYPES.map((t) => (
                        <MenuItem key={t.value} value={t.value}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              width: '100%',
                            }}
                          >
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 1.5,
                                bgcolor: t.bg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  bgcolor: t.color,
                                }}
                              />
                            </Box>
                            <Box>
                              <Typography fontSize={13} fontWeight={600}>
                                {t.label}
                              </Typography>
                              <Typography fontSize={11} color="text.secondary">
                                {t.desc}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Divider sx={{ my: 2.5 }} />

                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.is_active}
                      onChange={(e) => formik.setFieldValue('is_active', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: PINK[500] },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          bgcolor: PINK[500],
                        },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography fontSize={14} fontWeight={600}>
                        Active
                      </Typography>
                      <Typography fontSize={12} color="text.secondary">
                        {formik.values.is_active
                          ? 'Product is visible to customers'
                          : 'Product is hidden from customers'}
                      </Typography>
                    </Box>
                  }
                />
              </Card>
            </Box>

            {/* ── Right column: image upload ── */}
            <Box sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0 }}>
              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  p: 3,
                  position: { md: 'sticky' },
                  top: { md: 24 },
                }}
              >
                <Typography fontWeight={700} fontSize={15} mb={2}>
                  Product Image
                </Typography>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />

                {imagePreview ? (
                  <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
                    <Box
                      component="img"
                      src={imagePreview}
                      alt="Preview"
                      sx={{
                        width: '100%',
                        height: 260,
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        bgcolor: 'rgba(0,0,0,0.42)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1.5,
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        '&:hover': { opacity: 1 },
                      }}
                    >
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<UploadCloud size={14} />}
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.92)',
                          color: PINK[600],
                          fontWeight: 700,
                          fontSize: 12,
                          '&:hover': { bgcolor: '#fff' },
                        }}
                      >
                        Replace
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<X size={14} />}
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                        }}
                        sx={{
                          bgcolor: 'rgba(211,47,47,0.88)',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        Remove
                      </Button>
                    </Box>
                    {imageFile && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          left: 8,
                          bgcolor: 'rgba(0,0,0,0.6)',
                          color: '#fff',
                          fontSize: 11,
                          px: 1,
                          py: 0.4,
                          borderRadius: 1,
                          maxWidth: 'calc(100% - 16px)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {imageFile.name}
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      py: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1.5,
                      cursor: 'pointer',
                      transition: 'border-color 0.2s, background 0.2s',
                      '&:hover': {
                        borderColor: PINK[500],
                        bgcolor: `${PINK[500]}06`,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: `${PINK[500]}12`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <UploadCloud size={28} color={PINK[500]} />
                    </Box>
                    <Typography fontWeight={600} fontSize={14}>
                      Click to upload image
                    </Typography>
                    <Typography fontSize={12} color="text.disabled">
                      PNG, JPG, JPEG, WEBP
                    </Typography>
                  </Box>
                )}

                {/* Tips */}
                <Box
                  sx={{
                    mt: 2,
                    p: 1.5,
                    bgcolor: 'action.hover',
                    borderRadius: 2,
                  }}
                >
                  <Typography fontSize={11} color="text.secondary" lineHeight={1.6}>
                    Recommended: square image, at least 600×600px. Max 5MB.
                  </Typography>
                </Box>
              </Card>
            </Box>
          </Box>

          {/* Submit Footer */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
              mt: 4,
              pt: 3,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/products')}
              disabled={submitting}
              sx={{ fontWeight: 600, borderColor: 'divider', px: 3, minWidth: 110 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                fontWeight: 700,
                px: 4,
                minWidth: 160,
                background: `linear-gradient(135deg, ${PINK[600]} 0%, ${PINK[500]} 100%)`,
                boxShadow: `0 4px 14px ${PINK[500]}50`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${PINK[600]} 0%, ${PINK[600]} 100%)`,
                },
              }}
            >
              {submitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : isEdit ? (
                'Update Product'
              ) : (
                'Create Product'
              )}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

function SectionHeader({
  icon,
  iconBg,
  title,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1.5,
          bgcolor: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Typography fontWeight={700} fontSize={15}>
        {title}
      </Typography>
    </Box>
  );
}
