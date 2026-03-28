import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { CreditCard as Edit, Trash2, Plus, Package, DollarSign, ShoppingCart } from 'lucide-react';
import { Product, Category } from '../types';
import { productService } from '../services/productService';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';

const productSchema = yup.object({
  name: yup.string().required('Name is required'),
  description: yup.string().required('Description is required'),
  price: yup.number().positive('Price must be positive').required('Price is required'),
  discount_price: yup.number().positive('Discount price must be positive').nullable(),
  category_id: yup.string().required('Category is required'),
  stock: yup.number().integer().min(0, 'Stock cannot be negative').required('Stock is required'),
  images: yup.string().required('At least one image URL is required'),
});

export const Admin = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [products]);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        productService.getProducts(),
        productService.getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      enqueueSnackbar('Failed to load data', { variant: 'error' });
    }
  };

  const calculateStats = () => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const lowStock = products.filter(p => p.stock <= 5).length;
    setStats({ totalProducts, totalValue, lowStock });
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      price: 0,
      discount_price: null as number | null,
      category_id: '',
      stock: 0,
      images: '',
      is_featured: false,
    },
    validationSchema: productSchema,
    onSubmit: async (values) => {
      try {
        const imageArray = values.images.split(',').map(url => url.trim()).filter(url => url);

        const productData = {
          ...values,
          images: imageArray,
          discount_price: values.discount_price || null,
        };

        if (editingProduct) {
          await productService.updateProduct(editingProduct.id, productData);
          enqueueSnackbar('Product updated successfully', { variant: 'success' });
        } else {
          await productService.createProduct(productData);
          enqueueSnackbar('Product created successfully', { variant: 'success' });
        }

        setDialogOpen(false);
        setEditingProduct(null);
        formik.resetForm();
        loadData();
      } catch (error) {
        enqueueSnackbar('Failed to save product', { variant: 'error' });
      }
    },
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    formik.setValues({
      name: product.name,
      description: product.description,
      price: product.price,
      discount_price: product.discount_price || null,
      category_id: product.category_id || '',
      stock: product.stock,
      images: product.images.join(', '),
      is_featured: product.is_featured,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        enqueueSnackbar('Product deleted successfully', { variant: 'success' });
        loadData();
      } catch (error) {
        enqueueSnackbar('Failed to delete product', { variant: 'error' });
      }
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    formik.resetForm();
    setDialogOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" fontWeight={600}>
          Admin Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={handleAddNew}
        >
          Add Product
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Package size={24} color="#FF9A8B" />
                <Typography variant="h6" sx={{ ml: 1 }} fontWeight={600}>
                  Total Products
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {stats.totalProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DollarSign size={24} color="#A8E6CF" />
                <Typography variant="h6" sx={{ ml: 1 }} fontWeight={600}>
                  Total Value
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                ${stats.totalValue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShoppingCart size={24} color="#FFD700" />
                <Typography variant="h6" sx={{ ml: 1 }} fontWeight={600}>
                  Low Stock
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {stats.lowStock}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Featured</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Box
                      component="img"
                      src={product.images[0]}
                      alt={product.name}
                      sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                    />
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category?.name}</TableCell>
                  <TableCell>
                    ${product.discount_price ? (
                      <>
                        <span style={{ textDecoration: 'line-through', marginRight: 8 }}>
                          ${product.price}
                        </span>
                        ${product.discount_price}
                      </>
                    ) : (
                      product.price
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.stock}
                      color={product.stock <= 5 ? 'error' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {product.is_featured ? (
                      <Chip label="Yes" color="primary" size="small" />
                    ) : (
                      <Chip label="No" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleEdit(product)}>
                      <Edit size={18} />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(product.id)}>
                      <Trash2 size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="name"
                  label="Product Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="Description"
                  multiline
                  rows={3}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="price"
                  label="Price"
                  type="number"
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  error={formik.touched.price && Boolean(formik.errors.price)}
                  helperText={formik.touched.price && formik.errors.price}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="discount_price"
                  label="Discount Price (Optional)"
                  type="number"
                  value={formik.values.discount_price || ''}
                  onChange={formik.handleChange}
                  error={formik.touched.discount_price && Boolean(formik.errors.discount_price)}
                  helperText={formik.touched.discount_price && formik.errors.discount_price}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category_id"
                    value={formik.values.category_id}
                    onChange={formik.handleChange}
                    label="Category"
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="stock"
                  label="Stock"
                  type="number"
                  value={formik.values.stock}
                  onChange={formik.handleChange}
                  error={formik.touched.stock && Boolean(formik.errors.stock)}
                  helperText={formik.touched.stock && formik.errors.stock}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="images"
                  label="Image URLs (comma-separated)"
                  value={formik.values.images}
                  onChange={formik.handleChange}
                  error={formik.touched.images && Boolean(formik.errors.images)}
                  helperText={formik.touched.images && formik.errors.images}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Featured</InputLabel>
                  <Select
                    name="is_featured"
                    value={formik.values.is_featured}
                    onChange={formik.handleChange}
                    label="Featured"
                  >
                    <MenuItem value={false as any}>No</MenuItem>
                    <MenuItem value={true as any}>Yes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};
