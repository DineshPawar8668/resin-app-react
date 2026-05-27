import { useEffect, useState } from 'react';
import {
  Box, Typography, CircularProgress, Chip, Divider,
  Select, MenuItem, InputBase,
} from '@mui/material';
import {
  ClipboardList, Search, ChevronRight, Package,
  CheckCircle2, Clock, Truck, XCircle, RefreshCw, ShoppingBag,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { orderService, OrderItem, OrderStatus } from '../services/orderService';

const PINK = { 600: '#C2185B', 500: '#D81B60', 50: '#FFF0F6', 100: '#FCE4EC' };

const STATUS_META: Record<OrderStatus, { label: string; color: string; bg: string; icon: any }> = {
  pending:    { label: 'Pending',    color: '#F57C00', bg: '#FFF3E0', icon: Clock },
  confirmed:  { label: 'Confirmed',  color: '#1976D2', bg: '#E3F2FD', icon: CheckCircle2 },
  processing: { label: 'Processing', color: '#7B1FA2', bg: '#F3E5F5', icon: RefreshCw },
  shipped:    { label: 'Shipped',    color: '#0288D1', bg: '#E1F5FE', icon: Truck },
  delivered:  { label: 'Delivered',  color: '#388E3C', bg: '#E8F5E9', icon: Package },
  cancelled:  { label: 'Cancelled',  color: '#D32F2F', bg: '#FFEBEE', icon: XCircle },
};

const ALL_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const StatusChip = ({ status }: { status: OrderStatus }) => {
  const m = STATUS_META[status] ?? STATUS_META.pending;
  const Icon = m.icon;
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.5,
      background: m.bg, color: m.color,
      px: 1.2, py: 0.4, borderRadius: '20px', fontSize: 12, fontWeight: 700,
    }}>
      <Icon size={11} strokeWidth={2.5} />
      {m.label}
    </Box>
  );
};

export const AdminOrders = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { orders: list, total: t } = await orderService.getAll(1, 100);
      setOrders(list);
      setTotal(t);
    } catch {
      enqueueSnackbar('Failed to load orders', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || o.id.toLowerCase().includes(q)
      || o.customer?.name?.toLowerCase().includes(q)
      || o.customer?.email?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => o.ispayment).reduce((s, o) => s + o.totalprice, 0),
  };

  return (
    <Box sx={{ background: '#f7f7fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{
        background: `linear-gradient(135deg, ${PINK[600]} 0%, ${PINK[500]} 100%)`,
        py: { xs: 3, md: 4 }, px: { xs: 2, md: 4 },
        position: 'relative', overflow: 'hidden',
      }}>
        {[{ s: 200, t: -70, r: -50, op: 0.07 }, { s: 100, t: 15, r: 140, op: 0.05 }].map((c, i) => (
          <Box key={i} sx={{ position: 'absolute', width: c.s, height: c.s, borderRadius: '50%', background: '#fff', opacity: c.op, top: c.t, right: c.r }} />
        ))}
        <Box sx={{ maxWidth: 1200, mx: 'auto', position: 'relative', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ClipboardList size={28} color="#fff" />
          <Box>
            <Typography variant="h5" fontWeight={900} color="#fff">Manage Orders</Typography>
            <Typography fontSize={13} sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {total} total orders
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 1.5, sm: 2, md: 3 }, py: 3 }}>
        {/* Stats row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(4,1fr)' }, gap: 2, mb: 3 }}>
          {[
            { label: 'Total Orders', value: stats.total, color: PINK[600], bg: PINK[50], icon: ClipboardList },
            { label: 'Pending', value: stats.pending, color: '#F57C00', bg: '#FFF3E0', icon: Clock },
            { label: 'Delivered', value: stats.delivered, color: '#388E3C', bg: '#E8F5E9', icon: Package },
            { label: 'Revenue', value: `₹${stats.revenue.toFixed(0)}`, color: '#1976D2', bg: '#E3F2FD', icon: ShoppingBag },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Box key={s.label} sx={{ background: '#fff', borderRadius: '16px', p: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography fontSize={13} color="text.secondary">{s.label}</Typography>
                  <Box sx={{ width: 32, height: 32, borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={15} color={s.color} />
                  </Box>
                </Box>
                <Typography fontWeight={900} fontSize={22} sx={{ color: s.color }}>{s.value}</Typography>
              </Box>
            );
          })}
        </Box>

        {/* Filters bar */}
        <Box sx={{ background: '#fff', borderRadius: '14px', p: 2, mb: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <Box sx={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 1, border: '1.5px solid #eee', borderRadius: 2, px: 1.5, py: 0.8, '&:focus-within': { borderColor: PINK[500] } }}>
            <Search size={15} color="#bbb" />
            <InputBase
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or order ID..."
              sx={{ flex: 1, fontSize: 13 }}
            />
          </Box>

          {/* Status filter */}
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            size="small"
            sx={{ fontSize: 13, minWidth: 140, borderRadius: 2, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#eee' } }}
          >
            <MenuItem value="all" sx={{ fontSize: 13 }}>All Statuses</MenuItem>
            {ALL_STATUSES.map(s => (
              <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>{STATUS_META[s].label}</MenuItem>
            ))}
          </Select>

          <Typography fontSize={13} color="text.secondary" sx={{ ml: 'auto' }}>
            {filtered.length} order{filtered.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {/* Orders list */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: PINK[500] }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ background: '#fff', borderRadius: '16px', py: 8, textAlign: 'center' }}>
            <ClipboardList size={48} color="#ddd" />
            <Typography variant="h6" fontWeight={700} mt={2} mb={1}>No orders found</Typography>
            <Typography fontSize={14} color="text.secondary">
              {search || statusFilter !== 'all' ? 'Try adjusting your filters' : 'No orders have been placed yet'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {filtered.map((order) => (
              <Box
                key={order.id}
                onClick={() => navigate(`/admin/orders/${order.id}`)}
                sx={{
                  background: '#fff', borderRadius: '16px', p: { xs: 2, sm: 2.5 },
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2,
                  transition: 'all 0.18s',
                  '&:hover': { boxShadow: '0 6px 24px rgba(194,24,91,0.1)', transform: 'translateY(-1px)', borderColor: PINK[100] },
                }}
              >
                {/* Order icon */}
                <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: PINK[50], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ClipboardList size={20} color={PINK[600]} />
                </Box>

                {/* Main info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4, flexWrap: 'wrap' }}>
                    <Typography fontWeight={700} fontSize={14}>
                      #{order.id.slice(-8).toUpperCase()}
                    </Typography>
                    <StatusChip status={order.status} />
                    {order.ispayment && (
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, background: '#E8F5E9', color: '#388E3C', px: 1, py: 0.3, borderRadius: '20px', fontSize: 11, fontWeight: 700 }}>
                        <CheckCircle2 size={10} /> Paid
                      </Box>
                    )}
                  </Box>
                  <Typography fontSize={13} color="text.secondary" noWrap>
                    {order.customer?.name ?? 'Unknown'} · {order.customer?.email ?? '—'}
                  </Typography>
                  <Typography fontSize={12} color="text.disabled" mt={0.3}>
                    {order.products.length} product{order.products.length !== 1 ? 's' : ''} ·{' '}
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </Typography>
                </Box>

                {/* Price + arrow */}
                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                  <Typography fontWeight={900} fontSize={16} sx={{ color: PINK[600] }}>
                    ₹{order.totalprice.toFixed(0)}
                  </Typography>
                  <ChevronRight size={18} color="#bbb" />
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};
