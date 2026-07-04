import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
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

const PINK = { 600: '#C2185B', 500: '#D81B60' };

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
          position: 'sticky',
          top: 64,
          zIndex: 100,
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
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            {filtered.map((product) => (
              <Card
                key={product.id}
                elevation={0}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: '#fff',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #f0f0f0',
                  transition: 'transform 0.25s, box-shadow 0.25s',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 16px 40px rgba(194,24,91,0.15)',
                  },
                  '&:hover .admin-card-actions': { opacity: 1, transform: 'translateY(0)' },
                  '&:hover .product-img': { transform: 'scale(1.06)' },
                }}
              >
                {/* Image */}
                <Box sx={{ position: 'relative', overflow: 'hidden', height: 200 }}>
                  {product.image ? (
                    <Box
                      component="img"
                      className="product-img"
                      src={`${BASE_URL}${product.image}`}
                      alt={product.title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease',
                      }}
                    />
                  ) : (
                    <Box
                      className="product-img"
                      sx={{
                        width: '100%',
                        height: '100%',
                        bgcolor: '#f5f5f5',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        transition: 'transform 0.4s ease',
                      }}
                    >
                      <Package size={36} color="#bdbdbd" />
                      <Typography fontSize={12} color="text.disabled">
                        No image
                      </Typography>
                    </Box>
                  )}
                  {/* Gradient overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 60%)',
                    }}
                  />
                  {/* Discount badge */}
                  {product.discountpercent > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 800,
                        px: 1,
                        py: 0.3,
                        borderRadius: 1,
                      }}
                    >
                      -{product.discountpercent}%
                    </Box>
                  )}
                  {/* Edit / Delete actions — appear on hover */}
                  <Box
                    className="admin-card-actions"
                    sx={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.8,
                      opacity: 0,
                      transform: 'translateY(8px)',
                      transition: 'opacity 0.2s, transform 0.2s',
                    }}
                  >
                    <Tooltip title="Edit" placement="left">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                        sx={{
                          width: 36,
                          height: 36,
                          background: `linear-gradient(135deg, ${PINK[600]}, ${PINK[500]})`,
                          color: '#fff',
                          boxShadow: '0 2px 8px rgba(194,24,91,0.3)',
                          '&:hover': { background: PINK[600] },
                        }}
                      >
                        <Pencil size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete" placement="left">
                      <IconButton
                        size="small"
                        onClick={() => setDeleteTarget(product)}
                        sx={{
                          width: 36,
                          height: 36,
                          background: 'linear-gradient(135deg, #d32f2f, #f44336)',
                          color: '#fff',
                          boxShadow: '0 2px 8px rgba(211,47,47,0.3)',
                          '&:hover': { background: '#b71c1c' },
                        }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Info */}
                <CardContent sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {/* Badges row */}
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
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
                    <Tooltip title={`Click to ${product.is_active ? 'deactivate' : 'activate'}`}>
                      <Chip
                        label={product.is_active ? 'Active' : 'Inactive'}
                        size="small"
                        onClick={() => handleToggleActive(product)}
                        sx={{
                          fontSize: 10,
                          height: 20,
                          cursor: 'pointer',
                          fontWeight: 600,
                          bgcolor: product.is_active ? 'rgba(76,175,80,0.12)' : 'rgba(0,0,0,0.06)',
                          color: product.is_active ? '#2e7d32' : 'text.disabled',
                          border: '1px solid',
                          borderColor: product.is_active ? 'rgba(76,175,80,0.3)' : 'divider',
                          '&:hover': { opacity: 0.8 },
                        }}
                      />
                    </Tooltip>
                    {product.size && (
                      <Chip
                        label={product.size}
                        size="small"
                        sx={{
                          fontSize: 10,
                          height: 20,
                          fontWeight: 700,
                          bgcolor: 'rgba(0,150,136,0.1)',
                          color: '#00796B',
                          border: '1px solid rgba(0,150,136,0.3)',
                        }}
                      />
                    )}
                  </Box>

                  <Typography
                    fontSize={14}
                    fontWeight={700}
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.4,
                      color: '#1a1a1a',
                    }}
                  >
                    {product.title}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto', pt: 0.5 }}>
                    <Typography fontWeight={800} fontSize={16} sx={{ color: PINK[600] }}>
                      ₹{product.offerprice.toFixed(0)}
                    </Typography>
                    {product.discountpercent > 0 && (
                      <Typography fontSize={12} sx={{ textDecoration: 'line-through', color: '#aaa' }}>
                        ₹{product.price.toFixed(0)}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
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
