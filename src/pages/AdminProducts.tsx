import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Filter, Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { categoryService, CategoryItem } from '../services/categoryService';
import { productService } from '../services/productService';
import { ProductItem, ProductType } from '../types';
import { BASE_URL } from '../constant';

const PINK = { 600: '#C2185B', 500: '#E91E8C' };

const TYPE_META: Record<number, { label: string; color: string }> = {
  [ProductType.REGULAR]: { label: 'Regular', color: '#1976D2' },
  [ProductType.FEATURED]: { label: 'Featured', color: '#9C27B0' },
  [ProductType.DEAL_OF_THE_DAY]: { label: 'Deal', color: '#F57C00' },
};

export const AdminProducts = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ProductItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState<number | ''>('');
  const [maxBound, setMaxBound] = useState(10000);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  const fetchProducts = async () => {
    try {
      const list = await productService.getAll();
      setProducts(list);
      if (list.length > 0) {
        const max = Math.ceil(Math.max(...list.map((p) => p.price)) / 100) * 100 || 10000;
        setMaxBound(max);
        setPriceRange([0, max]);
      }
    } catch {
      enqueueSnackbar('Failed to load products', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    categoryService.getAll().then(setCategories).catch(() => { });
  }, []);

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const q = search.toLowerCase();
        if (q && !p.title.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q))
          return false;
        if (selectedCategory && p.category_id !== selectedCategory) return false;
        if (selectedType !== '' && p.product_type !== selectedType) return false;
        if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
        return true;
      }),
    [products, search, selectedCategory, selectedType, priceRange]
  );

  const handleToggleActive = async (product: ProductItem) => {
    try {
      const updated = await productService.toggleActive(product.id);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      enqueueSnackbar(`Product ${updated.is_active ? 'activated' : 'deactivated'}`, {
        variant: 'success',
      });
    } catch {
      enqueueSnackbar('Failed to update product status', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productService.remove(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      enqueueSnackbar('Product deleted', { variant: 'success' });
      setDeleteTarget(null);
    } catch {
      enqueueSnackbar('Failed to delete product', { variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedType('');
    setPriceRange([0, maxBound]);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${PINK[600]} 0%, ${PINK[500]} 100%)`,
          py: { xs: 3, sm: 4 },
          px: { xs: 2, sm: 4 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Package size={24} color="#fff" />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#fff" lineHeight={1.2}>
              Product Management
            </Typography>
            <Typography fontSize={13} color="rgba(255,255,255,0.8)" mt={0.3}>
              {products.length} {products.length === 1 ? 'product' : 'products'} total
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => navigate('/admin/products/create')}
          sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            color: '#fff',
            border: '1.5px solid rgba(255,255,255,0.5)',
            fontWeight: 700,
            px: 2.5,
            backdropFilter: 'blur(4px)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.32)' },
          }}
        >
          Add Product
        </Button>
      </Box>

      <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3 }, py: 3 }}>
        {/* Filter Bar */}
        <Card
          elevation={0}
          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 2.5, mb: 3 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Filter size={15} color={PINK[500]} />
            <Typography fontWeight={700} fontSize={14}>
              Filters
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              placeholder="Search by title or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{ flex: '1 1 200px', minWidth: 180 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={15} />
                  </InputAdornment>
                ),
              }}
            />

            {/* {categories.length > 0 && (
              <FormControl size="small" sx={{ flex: '1 1 160px', minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )} */}

            <FormControl size="small" sx={{ flex: '1 1 160px', minWidth: 150 }}>
              <InputLabel>Product Type</InputLabel>
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as number | '')}
                label="Product Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value={ProductType.REGULAR}>Regular</MenuItem>
                <MenuItem value={ProductType.FEATURED}>Featured</MenuItem>
                <MenuItem value={ProductType.DEAL_OF_THE_DAY}>Deal of the Day</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ flex: '1 1 200px', minWidth: 180 }}>
              <Typography fontSize={12} color="text.secondary" mb={0.5}>
                Price: ₹{priceRange[0].toLocaleString()} – ₹{priceRange[1].toLocaleString()}
              </Typography>
              <Slider
                value={priceRange}
                onChange={(_, v) => setPriceRange(v as [number, number])}
                min={0}
                max={maxBound}
                size="small"
                sx={{ color: PINK[500] }}
              />
            </Box>

            <Button
              variant="outlined"
              size="small"
              onClick={clearFilters}
              sx={{ height: 40, borderColor: 'divider', color: 'text.secondary', flexShrink: 0 }}
            >
              Clear
            </Button>
          </Box>
        </Card>

        {/* Count */}
        {!loading && products.length > 0 && (
          <Typography fontSize={13} color="text.secondary" mb={2}>
            Showing {filtered.length} of {products.length} products
          </Typography>
        )}

        {/* Content */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={12}>
            <CircularProgress sx={{ color: PINK[500] }} />
          </Box>
        ) : products.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 12,
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 4,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <Package size={36} color={PINK[600]} />
            </Box>
            <Typography fontSize={20} fontWeight={700} mb={1}>
              No products yet
            </Typography>
            <Typography fontSize={14} color="text.secondary" mb={4}>
              Create your first product to start selling
            </Typography>
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => navigate('/admin/products/create')}
              sx={{
                bgcolor: PINK[500],
                '&:hover': { bgcolor: PINK[600] },
                fontWeight: 700,
                px: 3,
              }}
            >
              Create Product
            </Button>
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography fontSize={16} color="text.secondary">
              No products match your filters
            </Typography>
            <Button
              size="small"
              onClick={clearFilters}
              sx={{ mt: 1, color: PINK[500], textTransform: 'none' }}
            >
              Clear filters
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {filtered.map((product) => (
              <Box
                key={product.id}
                sx={{
                  flex: '1 1 260px',
                  maxWidth: {
                    xs: '100%',
                    sm: 'calc(50% - 12px)',
                    md: 'calc(33.33% - 16px)',
                    lg: 'calc(25% - 18px)',
                  },
                  minWidth: 240,
                }}
              >
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 28px rgba(194,24,91,0.14)',
                    },
                  }}
                >
                  {product.image ? (
                    <CardMedia
                      component="img"
                      height={180}
                      image={`${BASE_URL}${""}`}
                      alt={product.title}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 180,
                        bgcolor: 'action.hover',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      <Package size={36} color="#bdbdbd" />
                      <Typography fontSize={12} color="text.disabled">
                        No image
                      </Typography>
                    </Box>
                  )}

                  <CardContent sx={{ flex: 1, pb: 1 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                      {/* Product type badge */}
                      <Chip
                        label={TYPE_META[product.product_type]?.label ?? 'Regular'}
                        size="small"
                        sx={{
                          fontSize: 10,
                          height: 20,
                          fontWeight: 700,
                          bgcolor: `${TYPE_META[product.product_type]?.color}18`,
                          color: TYPE_META[product.product_type]?.color,
                          border: '1px solid',
                          borderColor: `${TYPE_META[product.product_type]?.color}40`,
                        }}
                      />
                      {/* Active toggle */}
                      <Tooltip
                        title={`Click to ${product.is_active ? 'deactivate' : 'activate'}`}
                      >
                        <Chip
                          label={product.is_active ? 'Active' : 'Inactive'}
                          size="small"
                          onClick={() => handleToggleActive(product)}
                          sx={{
                            fontSize: 10,
                            height: 20,
                            cursor: 'pointer',
                            fontWeight: 600,
                            bgcolor: product.is_active
                              ? 'rgba(76,175,80,0.12)'
                              : 'rgba(0,0,0,0.06)',
                            color: product.is_active ? '#2e7d32' : 'text.disabled',
                            border: '1px solid',
                            borderColor: product.is_active
                              ? 'rgba(76,175,80,0.3)'
                              : 'divider',
                            '&:hover': { opacity: 0.8 },
                          }}
                        />
                      </Tooltip>
                    </Box>

                    <Typography
                      fontWeight={700}
                      fontSize={14}
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 1,
                      }}
                    >
                      {product.title}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography fontWeight={800} fontSize={16} color={PINK[600]}>
                        ₹{product.offerprice.toFixed(2)}
                      </Typography>
                      {product.discountpercent > 0 && (
                        <>
                          <Typography
                            fontSize={12}
                            color="text.disabled"
                            sx={{ textDecoration: 'line-through' }}
                          >
                            ₹{product.price.toFixed(2)}
                          </Typography>
                          <Chip
                            label={`-${product.discountpercent}%`}
                            size="small"
                            sx={{
                              fontSize: 10,
                              height: 18,
                              fontWeight: 700,
                              bgcolor: 'rgba(244,67,54,0.1)',
                              color: '#D32F2F',
                            }}
                          />
                        </>
                      )}
                    </Box>
                  </CardContent>

                  <CardActions
                    sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'flex-end', gap: 0.5 }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                      sx={{
                        color: PINK[500],
                        '&:hover': { bgcolor: 'rgba(233,30,140,0.08)' },
                      }}
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTarget(product)}
                      sx={{
                        color: 'error.main',
                        '&:hover': { bgcolor: 'rgba(211,47,47,0.08)' },
                      }}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <Box sx={{ px: 3, pt: 3, pb: 1 }}>
          <Typography fontWeight={700} fontSize={17} mb={1}>
            Delete Product
          </Typography>
          <Typography fontSize={14} color="text.secondary">
            Are you sure you want to delete{' '}
            <Typography
              component="span"
              fontWeight={700}
              color="text.primary"
              fontSize={14}
            >
              {deleteTarget?.title}
            </Typography>
            ? This action cannot be undone.
          </Typography>
        </Box>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
            sx={{ fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
            sx={{
              fontWeight: 700,
              minWidth: 100,
              bgcolor: 'error.main',
              '&:hover': { bgcolor: 'error.dark' },
            }}
          >
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
