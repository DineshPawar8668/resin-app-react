import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Plus, Pencil, Trash2, Tag, ImageOff, UploadCloud, X } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { categoryService, CategoryItem } from '../services/categoryService';

const PINK = { 600: '#F06292', 500: '#F48FB1' };

const validationSchema = Yup.object({
  name: Yup.string().trim().required('Category name is required'),
  description: Yup.string().default(''),
});

export const Categories = () => {
  const { enqueueSnackbar } = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CategoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const fetchCategories = async () => {
    try {
      const list = await categoryService.getAll();
      setCategories(list);
    } catch {
      enqueueSnackbar('Failed to load categories', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const formik = useFormik<{ name: string; description: string }>({
    initialValues: { name: '', description: '' },
    validationSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        const formData = new FormData();
        formData.append('name', values.name.trim());
        formData.append('description', values.description.trim());
        if (imageFile) {
          formData.append('image', imageFile);
        }

        if (editTarget) {
          await categoryService.update(editTarget.id, formData);
          enqueueSnackbar('Category updated successfully', { variant: 'success' });
        } else {
          await categoryService.create(formData);
          enqueueSnackbar('Category created successfully', { variant: 'success' });
        }
        closeForm();
        fetchCategories();
      } catch {
        enqueueSnackbar('Failed to save category', { variant: 'error' });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const openCreate = () => {
    setEditTarget(null);
    setImageFile(null);
    setImagePreview('');
    formik.resetForm();
    setFormOpen(true);
  };

  const openEdit = (cat: CategoryItem) => {
    setEditTarget(cat);
    setImageFile(null);
    setImagePreview(cat.image);
    formik.setValues({ name: cat.name, description: cat.description });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditTarget(null);
    setImageFile(null);
    setImagePreview('');
    formik.resetForm();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      enqueueSnackbar('Only image files are allowed', { variant: 'error' });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    // reset input so same file can be reselected
    e.target.value = '';
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await categoryService.remove(deleteTarget.id);
      enqueueSnackbar('Category deleted successfully', { variant: 'success' });
      setDeleteTarget(null);
      fetchCategories();
    } catch {
      enqueueSnackbar('Failed to delete category', { variant: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (cat: CategoryItem) => {
    try {
      await categoryService.toggleActive(cat.id);
      enqueueSnackbar(
        `Category ${cat.is_active ? 'deactivated' : 'activated'} successfully`,
        { variant: 'success' }
      );
      fetchCategories();
    } catch {
      enqueueSnackbar('Failed to update category status', { variant: 'error' });
    }
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: PINK[500],
    },
    '& .MuiInputLabel-root.Mui-focused': { color: PINK[500] },
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Page Header */}
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
            <Tag size={24} color="#fff" />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#fff" lineHeight={1.2}>
              Category Management
            </Typography>
            <Typography fontSize={13} color="rgba(255,255,255,0.8)" mt={0.3}>
              {categories.length} {categories.length === 1 ? 'category' : 'categories'} total
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={openCreate}
          sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            color: '#fff',
            border: '1.5px solid rgba(255,255,255,0.5)',
            fontWeight: 700,
            px: 2.5,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.32)' },
            backdropFilter: 'blur(4px)',
          }}
        >
          Add Category
        </Button>
      </Box>

      {/* Content */}
      <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 3 }, py: 4 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={12}>
            <CircularProgress sx={{ color: PINK[500] }} />
          </Box>
        ) : categories.length === 0 ? (
          /* Empty State */
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
              <Tag size={36} color={PINK[600]} />
            </Box>
            <Typography fontSize={20} fontWeight={700} color="text.primary" mb={1}>
              No categories yet
            </Typography>
            <Typography fontSize={14} color="text.secondary" mb={4}>
              Create your first category to organise your products
            </Typography>
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={openCreate}
              sx={{
                bgcolor: PINK[500],
                '&:hover': { bgcolor: PINK[600] },
                fontWeight: 700,
                px: 3,
                py: 1.2,
              }}
            >
              Create Category
            </Button>
          </Box>
        ) : (
          /* Category Grid */
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {categories.map((cat) => (
              <Box
                key={cat.id}
                sx={{
                  flex: '1 1 240px',
                  maxWidth: {
                    xs: '100%',
                    sm: 'calc(50% - 12px)',
                    md: 'calc(33.33% - 16px)',
                    lg: 'calc(25% - 18px)',
                  },
                  minWidth: 220,
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
                  {cat.image ? (
                    <CardMedia
                      component="img"
                      height={160}
                      image={cat.image}
                      alt={cat.name}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 160,
                        bgcolor: 'action.hover',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      <ImageOff size={32} color="#bdbdbd" />
                      <Typography fontSize={12} color="text.disabled">
                        No image
                      </Typography>
                    </Box>
                  )}

                  <CardContent sx={{ flex: 1, pb: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 1,
                        mb: 0.75,
                      }}
                    >
                      <Typography fontWeight={700} fontSize={15} sx={{ flex: 1 }}>
                        {cat.name}
                      </Typography>
                      <Tooltip title={`Click to ${cat.is_active ? 'deactivate' : 'activate'}`}>
                        <Chip
                          label={cat.is_active ? 'Active' : 'Inactive'}
                          size="small"
                          onClick={() => handleToggleActive(cat)}
                          sx={{
                            fontSize: 10,
                            height: 22,
                            cursor: 'pointer',
                            fontWeight: 600,
                            bgcolor: cat.is_active ? 'rgba(76,175,80,0.12)' : 'rgba(0,0,0,0.06)',
                            color: cat.is_active ? '#2e7d32' : 'text.disabled',
                            border: '1px solid',
                            borderColor: cat.is_active ? 'rgba(76,175,80,0.3)' : 'divider',
                            '&:hover': { opacity: 0.8 },
                          }}
                        />
                      </Tooltip>
                    </Box>
                    <Typography
                      fontSize={13}
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: 38,
                      }}
                    >
                      {cat.description || 'No description provided'}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'flex-end', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => openEdit(cat)}
                      sx={{ color: PINK[500], '&:hover': { bgcolor: 'rgba(240,98,146,0.08)' } }}
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTarget(cat)}
                      sx={{ color: 'error.main', '&:hover': { bgcolor: 'rgba(211,47,47,0.08)' } }}
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

      {/* Create / Edit Dialog */}
      <Dialog
        open={formOpen}
        onClose={closeForm}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, overflow: 'hidden' } } }}
      >
        {/* Dialog Header */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${PINK[600]} 0%, ${PINK[500]} 100%)`,
            px: 3,
            py: 2.5,
          }}
        >
          <Typography fontWeight={700} fontSize={18} color="#fff">
            {editTarget ? 'Edit Category' : 'Create Category'}
          </Typography>
          <Typography fontSize={12} color="rgba(255,255,255,0.75)" mt={0.3}>
            {editTarget
              ? 'Update the category details below'
              : 'Fill in the details to create a new category'}
          </Typography>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <DialogContent sx={{ pt: 3, pb: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

              {/* Name */}
              <TextField
                label="Category Name *"
                name="name"
                fullWidth
                autoFocus
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && !!formik.errors.name}
                helperText={formik.touched.name && formik.errors.name}
                sx={fieldSx}
              />

              {/* Description */}
              <TextField
                label="Description"
                name="description"
                fullWidth
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && !!formik.errors.description}
                helperText={formik.touched.description && formik.errors.description}
                sx={fieldSx}
              />

              {/* Image Upload */}
              <Box>
                <Typography fontSize={13} fontWeight={600} color="text.secondary" mb={1}>
                  Category Image
                </Typography>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />

                {imagePreview ? (
                  /* Preview with replace/remove controls */
                  <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
                    <Box
                      component="img"
                      src={imagePreview}
                      alt="Preview"
                      sx={{
                        width: '100%',
                        height: 180,
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    {/* Overlay actions */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        bgcolor: 'rgba(0,0,0,0.35)',
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
                        startIcon={<UploadCloud size={15} />}
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.9)',
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
                        startIcon={<X size={15} />}
                        onClick={clearImage}
                        sx={{
                          bgcolor: 'rgba(211,47,47,0.85)',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 12,
                          '&:hover': { bgcolor: 'rgba(211,47,47,1)' },
                        }}
                      >
                        Remove
                      </Button>
                    </Box>
                    {/* File name badge */}
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
                  /* Upload drop zone */
                  <Box
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      py: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1,
                      cursor: 'pointer',
                      transition: 'border-color 0.2s, background 0.2s',
                      '&:hover': {
                        borderColor: PINK[500],
                        bgcolor: 'rgba(240,98,146,0.04)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        bgcolor: 'rgba(240,98,146,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <UploadCloud size={22} color={PINK[500]} />
                    </Box>
                    <Typography fontWeight={600} fontSize={14} color="text.primary">
                      Click to upload image
                    </Typography>
                    <Typography fontSize={12} color="text.disabled">
                      PNG, JPG, JPEG, WEBP supported
                    </Typography>
                  </Box>
                )}
              </Box>

            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
            <Button
              variant="outlined"
              onClick={closeForm}
              disabled={submitting}
              sx={{ fontWeight: 600, borderColor: 'divider' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={submitting}
              sx={{
                fontWeight: 700,
                minWidth: 120,
                bgcolor: PINK[500],
                '&:hover': { bgcolor: PINK[600] },
              }}
            >
              {submitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : editTarget ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
            Delete Category
          </Typography>
          <Typography fontSize={14} color="text.secondary">
            Are you sure you want to delete{' '}
            <Typography component="span" fontWeight={700} color="text.primary" fontSize={14}>
              {deleteTarget?.name}
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
