import { useEffect, useMemo, useState } from 'react';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiDownload,
  FiEye,
  FiMapPin,
  FiPackage,
  FiRefreshCw,
  FiSearch,
  FiTruck,
  FiX,
  FiXCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { orderService } from '../services/orderService';
import DeliveryAssignmentModal from '../../delivery/components/DeliveryAssignmentModal';
import { useDelivery } from '../../delivery/hooks/useDelivery';

const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

const statusMeta = {
  PENDING: { label: 'New', tone: 'bg-amber-100 text-amber-700 border-amber-200', next: [{ status: 'CONFIRMED', label: 'Accept Order' }, { status: 'CANCELLED', label: 'Reject', danger: true }] },
  CONFIRMED: { label: 'Accepted', tone: 'bg-blue-100 text-blue-700 border-blue-200', next: [{ status: 'PREPARING', label: 'Start Preparing' }, { status: 'CANCELLED', label: 'Cancel', danger: true }] },
  PREPARING: { label: 'Preparing', tone: 'bg-orange-100 text-orange-700 border-orange-200', next: [{ status: 'READY_FOR_PICKUP', label: 'Mark Ready' }] },
  READY_FOR_PICKUP: { label: 'Ready', tone: 'bg-purple-100 text-purple-700 border-purple-200', next: [] },
  OUT_FOR_DELIVERY: { label: 'Out', tone: 'bg-indigo-100 text-indigo-700 border-indigo-200', next: [{ status: 'DELIVERED', label: 'Mark Delivered' }] },
  DELIVERED: { label: 'Delivered', tone: 'bg-green-100 text-green-700 border-green-200', next: [] },
  CANCELLED: { label: 'Cancelled', tone: 'bg-red-100 text-red-700 border-red-200', next: [] },
  REFUNDED: { label: 'Refunded', tone: 'bg-slate-100 text-slate-700 border-slate-200', next: [] },
};

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));
const formatDateTime = (value) => value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '--';
const itemCount = (order) => order.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;
const invoiceNumber = (order) => `INV-${order.orderNumber || order.id}`;

export default function OwnerOrderManagementPage() {
  const { assign } = useDelivery();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ number: 0, size: 20, totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [restaurantFilter, setRestaurantFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [assignOrder, setAssignOrder] = useState(null);

  const loadOrders = async (page = pagination.number, size = pagination.size) => {
    setLoading(true);
    try {
      const response = await orderService.getOwnerOrders(page, size);
      const pageData = response.data?.data || {};
      setOrders(pageData.content || []);
      setPagination({
        number: pageData.number || 0,
        size: pageData.size || size,
        totalPages: pageData.totalPages || 0,
        totalElements: pageData.totalElements || 0,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Owner orders load nahi ho pa rahe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(0, 20);
  }, []);

  const restaurants = useMemo(() => {
    const map = new Map();
    orders.forEach((order) => {
      if (order.restaurant?.id) map.set(order.restaurant.id, order.restaurant.name);
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return orders.filter((order) => {
      const statusMatch = activeStatus === 'ALL' || order.status === activeStatus;
      const restaurantMatch = restaurantFilter === 'ALL' || String(order.restaurant?.id) === restaurantFilter;
      const searchMatch = !keyword
        || order.orderNumber?.toLowerCase().includes(keyword)
        || order.user?.firstName?.toLowerCase().includes(keyword)
        || order.user?.lastName?.toLowerCase().includes(keyword)
        || order.restaurant?.name?.toLowerCase().includes(keyword);
      return statusMatch && restaurantMatch && searchMatch;
    });
  }, [orders, activeStatus, restaurantFilter, search]);

  const stats = useMemo(() => ({
    total: orders.length,
    newOrders: orders.filter((order) => order.status === 'PENDING').length,
    preparing: orders.filter((order) => ['CONFIRMED', 'PREPARING'].includes(order.status)).length,
    ready: orders.filter((order) => order.status === 'READY_FOR_PICKUP').length,
    revenue: orders.filter((order) => order.status !== 'CANCELLED').reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
    payout: orders.filter((order) => order.status !== 'CANCELLED').reduce((sum, order) => sum + Number(order.restaurantPayout || 0), 0),
  }), [orders]);

  const changeStatus = async (order, nextStatus) => {
    let cancellationReason = null;
    if (nextStatus === 'CANCELLED') {
      cancellationReason = window.prompt('Cancellation/rejection reason enter karein');
      if (!cancellationReason) return;
    }

    const confirmMessage = `${order.orderNumber} ko ${statusMeta[nextStatus]?.label || nextStatus} mark karna hai?`;
    if (!window.confirm(confirmMessage)) return;

    setActionId(order.id);
    try {
      const response = await orderService.updateOrderStatus(order.id, nextStatus, cancellationReason);
      const updatedOrder = response.data?.data;
      setOrders((current) => current.map((item) => item.id === order.id ? updatedOrder : item));
      setSelectedOrder((current) => current?.id === order.id ? updatedOrder : current);
      toast.success('Order status updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Order status update failed');
    } finally {
      setActionId(null);
    }
  };

  const assignRider = async (orderId, partnerId) => {
    setActionId(orderId);
    try {
      await assign(orderId, partnerId).unwrap();
      setAssignOrder(null);
      await loadOrders();
      toast.success('Delivery partner assigned. Rider ke dashboard par job pending dikhegi.');
    } catch (error) {
      toast.error(error?.message || 'Delivery partner assign nahi ho pa raha');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-orange-500">Restaurant owner workspace</p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-slate-900"><FiPackage className="text-orange-500" /> Order Management</h1>
            <p className="mt-1 text-sm text-slate-500">Accept, prepare, and dispatch orders from all your restaurants.</p>
          </div>
          <button onClick={() => loadOrders()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60">
            <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh Orders
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
          <StatCard label="Current Page" value={stats.total} icon={FiPackage} tone="orange" />
          <StatCard label="New Orders" value={stats.newOrders} icon={FiAlertCircle} tone="amber" />
          <StatCard label="In Kitchen" value={stats.preparing} icon={FiClock} tone="blue" />
          <StatCard label="Ready" value={stats.ready} icon={FiCheckCircle} tone="purple" />
          <StatCard label="Owner Payout" value={formatCurrency(stats.payout || stats.revenue)} icon={FiTruck} tone="green" />
        </div>

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 flex-1">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order number, customer, restaurant..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100" />
            </div>
            <select value={restaurantFilter} onChange={(event) => setRestaurantFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100">
              <option value="ALL">All restaurants</option>
              {restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>)}
            </select>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {statuses.map((status) => (
              <button key={status} onClick={() => setActiveStatus(status)} className={`whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-semibold transition ${activeStatus === status ? 'border-orange-300 bg-orange-500 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                {status === 'ALL' ? 'All' : statusMeta[status]?.label || status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-slate-500 shadow-sm"><FiRefreshCw className="mr-2 animate-spin" /> Loading owner orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-orange-200 bg-white p-12 text-center shadow-sm">
            <FiPackage className="mx-auto mb-3 h-10 w-10 text-orange-500" />
            <h3 className="text-lg font-bold text-slate-900">No orders found</h3>
            <p className="mt-1 text-sm text-slate-500">Filters reset karein ya naye customer orders ka wait karein.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredOrders.map((order) => <OwnerOrderCard key={order.id} order={order} actionId={actionId} onView={setSelectedOrder} onChangeStatus={changeStatus} onAssignRider={setAssignOrder} />)}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="text-sm text-slate-500">Showing page {pagination.number + 1} of {Math.max(pagination.totalPages, 1)} ({pagination.totalElements} total)</p>
          <div className="flex gap-2">
            <button disabled={loading || pagination.number <= 0} onClick={() => loadOrders(pagination.number - 1, pagination.size)} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"><FiChevronLeft /> Prev</button>
            <button disabled={loading || pagination.number + 1 >= pagination.totalPages} onClick={() => loadOrders(pagination.number + 1, pagination.size)} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">Next <FiChevronRight /></button>
          </div>
        </div>
      </div>

      {selectedOrder && <OrderDetailModal order={selectedOrder} actionId={actionId} onClose={() => setSelectedOrder(null)} onChangeStatus={changeStatus} onAssignRider={setAssignOrder} />}
      <DeliveryAssignmentModal
        isOpen={Boolean(assignOrder)}
        onClose={() => setAssignOrder(null)}
        orderId={assignOrder?.id}
        onAssign={assignRider}
      />
    </div>
  );
}

function OwnerOrderCard({ order, actionId, onView, onChangeStatus, onAssignRider }) {
  const meta = statusMeta[order.status] || statusMeta.PENDING;
  const hasAssignedRider = Boolean(order.deliveryInfo?.deliveryPartnerId);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-200 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{order.restaurant?.name || 'Restaurant'}</p>
          <h3 className="mt-1 font-bold text-slate-900">#{order.orderNumber}</h3>
          <p className="mt-1 text-sm text-slate-500">{formatDateTime(order.createdAt)}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${meta.tone}`}>{meta.label}</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-3 text-sm">
        <Metric label="Items" value={itemCount(order)} />
        <Metric label="Total" value={formatCurrency(order.totalAmount)} />
        <Metric label="Payout" value={formatCurrency(order.restaurantPayout || order.totalAmount)} />
      </div>
      <div className="mt-4 space-y-2">
        {order.items?.slice(0, 3).map((item) => <div key={item.id} className="flex justify-between text-sm"><span className="text-slate-600">{item.quantity}x {item.itemName}</span><span className="font-medium text-slate-800">{formatCurrency(item.subtotal)}</span></div>)}
      </div>
      {order.deliveryAddress && <p className="mt-4 flex items-start gap-2 text-sm text-slate-500"><FiMapPin className="mt-0.5 shrink-0" /> {order.deliveryAddress.streetAddress}, {order.deliveryAddress.city}</p>}
      <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <button onClick={() => onView(order)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><FiEye /> Details</button>
        <button onClick={() => downloadInvoice(order)} className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100"><FiDownload /> Invoice</button>
        {order.status === 'READY_FOR_PICKUP' && (
          hasAssignedRider ? (
            <span className="inline-flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-sm font-bold text-green-700"><FiTruck /> Rider Assigned</span>
          ) : (
            <button onClick={() => onAssignRider(order)} disabled={actionId === order.id} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60">
              {actionId === order.id ? <FiRefreshCw className="animate-spin" /> : <FiTruck />} Assign Rider
            </button>
          )
        )}
        {meta.next.map((next) => <ActionButton key={next.status} order={order} next={next} loading={actionId === order.id} onClick={() => onChangeStatus(order, next.status)} />)}
      </div>
    </div>
  );
}

function ActionButton({ next, loading, onClick }) {
  return <button onClick={onClick} disabled={loading} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-white disabled:opacity-60 ${next.danger ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'}`}>{loading ? <FiRefreshCw className="animate-spin" /> : <FiCheckCircle />} {next.label}</button>;
}

function OrderDetailModal({ order, actionId, onClose, onChangeStatus, onAssignRider }) {
  const meta = statusMeta[order.status] || statusMeta.PENDING;
  const hasAssignedRider = Boolean(order.deliveryInfo?.deliveryPartnerId);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-md">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-orange-100 bg-gradient-to-r from-orange-50 via-white to-rose-50 px-5 py-4">
          <div><p className="text-xs font-bold uppercase tracking-wide text-orange-500">Order details</p><h2 className="mt-1 text-xl font-bold text-slate-900">#{order.orderNumber}</h2><p className="mt-1 text-sm text-slate-500">{order.restaurant?.name} - {formatDateTime(order.createdAt)}</p></div>
          <div className="flex items-center gap-2">
            <button onClick={() => downloadInvoice(order)} className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm font-bold text-orange-600 shadow-sm hover:bg-orange-50"><FiDownload /> Invoice PDF</button>
            <button onClick={onClose} className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm hover:text-orange-600"><FiX /></button>
          </div>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">
          <div className="mb-4 flex flex-wrap items-center gap-2"><span className={`rounded-full border px-3 py-1 text-xs font-bold ${meta.tone}`}>{meta.label}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{order.paymentStatus}</span></div>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoPanel title="Customer"><p>{order.user?.firstName} {order.user?.lastName}</p><p className="text-slate-500">{order.user?.email}</p></InfoPanel>
            <InfoPanel title="Delivery Address"><p>{order.deliveryAddress?.streetAddress}</p><p className="text-slate-500">{order.deliveryAddress?.city}, {order.deliveryAddress?.state}</p></InfoPanel>
          </div>
          {hasAssignedRider && (
            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <h3 className="mb-2 font-bold text-green-900">Assigned Rider</h3>
              <p>{order.deliveryInfo.deliveryPartnerName}</p>
              <p className="text-green-700">{order.deliveryInfo.deliveryPartnerPhone}</p>
              <p className="mt-1 text-xs uppercase tracking-wide">Assignment: {order.deliveryInfo.deliveryStatus}</p>
            </div>
          )}
          <div className="mt-4 rounded-2xl border border-slate-200 p-4"><h3 className="mb-3 font-bold text-slate-900">Items</h3>{order.items?.map((item) => <div key={item.id} className="flex justify-between border-b border-slate-100 py-2 text-sm last:border-0"><span>{item.quantity}x {item.itemName}</span><span className="font-semibold">{formatCurrency(item.subtotal)}</span></div>)}</div>
          <div className="mt-4 rounded-2xl border border-slate-200 p-4"><h3 className="mb-3 font-bold text-slate-900">Bill Summary</h3><BillRow label="Subtotal" value={order.subtotal} /><BillRow label="Tax" value={order.tax} /><BillRow label="Delivery" value={order.deliveryFee} /><BillRow label="Discount" value={order.discount} /><BillRow label="Platform Commission" value={order.platformCommission} /><div className="mt-2 flex justify-between border-t border-slate-100 pt-3 font-bold"><span>Owner Payout</span><span className="text-orange-600">{formatCurrency(order.restaurantPayout || order.totalAmount)}</span></div></div>
          {order.specialInstructions && <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><strong>Instructions:</strong> {order.specialInstructions}</div>}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-slate-100 p-4">
          {order.status === 'READY_FOR_PICKUP' && !hasAssignedRider && (
            <button onClick={() => onAssignRider(order)} disabled={actionId === order.id} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60">
              {actionId === order.id ? <FiRefreshCw className="animate-spin" /> : <FiTruck />} Assign Rider
            </button>
          )}
          {meta.next.map((next) => <ActionButton key={next.status} next={next} loading={actionId === order.id} onClick={() => onChangeStatus(order, next.status)} />)}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone }) {
  const colors = { orange: 'bg-orange-50 text-orange-600', amber: 'bg-amber-50 text-amber-600', blue: 'bg-blue-50 text-blue-600', purple: 'bg-purple-50 text-purple-600', green: 'bg-green-50 text-green-600' };
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div><span className={`rounded-2xl p-3 ${colors[tone]}`}><Icon /></span></div></div>;
}
function Metric({ label, value }) { return <div><p className="text-xs text-slate-400">{label}</p><p className="mt-1 font-bold text-slate-900">{value}</p></div>; }
function InfoPanel({ title, children }) { return <div className="rounded-2xl border border-slate-200 p-4"><h3 className="mb-2 font-bold text-slate-900">{title}</h3><div className="text-sm text-slate-700">{children}</div></div>; }
function BillRow({ label, value }) { return <div className="flex justify-between py-1 text-sm text-slate-600"><span>{label}</span><span>{formatCurrency(value)}</span></div>; }

function downloadInvoice(order) {
  const printWindow = window.open('', '_blank', 'width=920,height=760');
  if (!printWindow) {
    toast.error('Popup blocked hai. Browser me popups allow karke invoice download karein.');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(buildInvoiceHtml(order));
  printWindow.document.close();
  printWindow.focus();
  printWindow.onload = () => {
    printWindow.print();
  };
}

function buildInvoiceHtml(order) {
  const restaurant = order.restaurant || {};
  const customer = order.user || {};
  const address = order.deliveryAddress || {};
  const items = order.items || [];
  const customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Customer';
  const deliveryAddress = [
    address.receiverName,
    address.streetAddress,
    address.apartmentNumber,
    address.landmark,
    address.city,
    address.state,
    address.zipCode,
    address.country,
  ].filter(Boolean).join(', ');
  const commissionPercent = Number(order.commissionRate || 0) * 100;

  return `
<!doctype html>
<html>
<head>
  <title>${escapeHtml(invoiceNumber(order))}</title>
  <style>
    * { box-sizing: border-box; }
    @page { size: A4 portrait; margin: 8mm; }
    html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { margin: 0; background: #f8fafc; color: #0f172a; font-family: "Segoe UI", Arial, Helvetica, sans-serif; font-size: 12px; font-weight: 400; text-rendering: geometricPrecision; }
    .page { width: 194mm; min-height: 281mm; margin: 8px auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .top { display: flex; justify-content: space-between; gap: 14px; padding: 14px 18px; background: linear-gradient(135deg, #fff7ed, #fff, #fff1f2); border-bottom: 1px solid #fed7aa; }
    .brand { display: flex; align-items: center; gap: 8px; }
    .logo { width: 36px; height: 36px; border-radius: 10px; background: #ff5a00; color: #fff; display: grid; place-items: center; font-weight: 800; font-size: 14px; }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: 22px; letter-spacing: 0; color: #0f172a; font-weight: 800; }
    h2 { font-size: 16px; margin-bottom: 4px; color: #0f172a; font-weight: 800; }
    h3 { font-size: 10.5px; color: #475569; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 5px; font-weight: 800; }
    .muted { color: #334155; font-size: 11px; line-height: 1.38; }
    .invoice-meta { text-align: right; min-width: 170px; }
    .badge { display: inline-block; margin-top: 5px; padding: 4px 8px; border-radius: 999px; background: #ecfdf5; color: #047857; font-size: 10px; font-weight: 700; }
    .section { padding: 10px 18px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .box { border: 1px solid #e5e7eb; border-radius: 10px; padding: 9px; background: #fff; min-height: 58px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 7px 8px; background: #f1f5f9; color: #334155; font-size: 10.5px; text-transform: uppercase; font-weight: 800; }
    td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; vertical-align: top; line-height: 1.28; color: #111827; }
    .right { text-align: right; }
    .summary { margin-left: auto; width: 310px; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
    .row { display: flex; justify-content: space-between; gap: 12px; padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #1e293b; }
    .row strong { color: #0f172a; }
    .row.total { background: #fff7ed; color: #c2410c; font-size: 14px; font-weight: 800; }
    .row.payout { background: #f0fdf4; color: #15803d; font-weight: 800; }
    .footer { padding: 10px 18px; border-top: 1px solid #e5e7eb; color: #64748b; font-size: 10px; display: flex; justify-content: space-between; gap: 12px; }
    @media print {
      body { background: #fff; }
      .page { width: 194mm; min-height: auto; margin: 0; border: none; border-radius: 0; max-width: none; }
      .top, .section, .footer { break-inside: avoid; page-break-inside: avoid; }
      tr { break-inside: avoid; page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <main class="page">
    <section class="top">
      <div>
        <div class="brand"><div class="logo">OF</div><div><h1>Restaurant Invoice</h1><p class="muted">Online Food Ordering System</p></div></div>
        <p class="muted" style="margin-top:8px;">${escapeHtml(restaurant.name || 'Restaurant')}<br>${escapeHtml(restaurant.address || 'Restaurant address not available')}</p>
        <p class="muted">Phone: ${escapeHtml(restaurant.contactPhone || 'N/A')} | Email: ${escapeHtml(restaurant.contactEmail || 'N/A')}</p>
      </div>
      <div class="invoice-meta">
        <h2>${escapeHtml(invoiceNumber(order))}</h2>
        <p class="muted">Order #${escapeHtml(order.orderNumber || order.id)}</p>
        <p class="muted">Date: ${escapeHtml(formatDateTime(order.createdAt))}</p>
        <span class="badge">${escapeHtml(order.status || 'ORDER')}</span>
      </div>
    </section>

    <section class="section grid">
      <div class="box">
        <h3>Billed To</h3>
        <p><strong>${escapeHtml(customerName)}</strong></p>
        <p class="muted">${escapeHtml(customer.email || 'Email not available')}</p>
        <p class="muted">${escapeHtml(customer.phoneNumber || address.phoneNumber || 'Phone not available')}</p>
      </div>
      <div class="box">
        <h3>Delivery Address</h3>
        <p class="muted">${escapeHtml(deliveryAddress || 'Address not available')}</p>
      </div>
      <div class="box">
        <h3>Restaurant Compliance</h3>
        <p class="muted">GST: ${escapeHtml(restaurant.gstNumber || 'N/A')}</p>
        <p class="muted">FSSAI: ${escapeHtml(restaurant.fssaiLicenseNumber || 'N/A')}</p>
      </div>
      <div class="box">
        <h3>Payment</h3>
        <p class="muted">Method: ${escapeHtml(order.paymentMethod || 'N/A')}</p>
        <p class="muted">Status: ${escapeHtml(order.paymentStatus || 'N/A')}</p>
      </div>
    </section>

    <section class="section">
      <h3>Items Ordered</h3>
      <table>
        <thead><tr><th>Item</th><th class="right">Qty</th><th class="right">Unit</th><th class="right">Amount</th></tr></thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td>${escapeHtml(item.itemName || 'Menu item')}</td>
              <td class="right">${escapeHtml(item.quantity || 0)}</td>
              <td class="right">${escapeHtml(formatCurrency(item.unitPrice))}</td>
              <td class="right">${escapeHtml(formatCurrency(item.subtotal))}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>

    <section class="section">
      <div class="summary">
        <div class="row"><span>Subtotal</span><strong>${escapeHtml(formatCurrency(order.subtotal))}</strong></div>
        <div class="row"><span>GST/Tax</span><strong>${escapeHtml(formatCurrency(order.tax))}</strong></div>
        <div class="row"><span>Delivery Fee</span><strong>${escapeHtml(formatCurrency(order.deliveryFee))}</strong></div>
        <div class="row"><span>Discount</span><strong>-${escapeHtml(formatCurrency(order.discount))}</strong></div>
        <div class="row total"><span>Customer Paid</span><span>${escapeHtml(formatCurrency(order.totalAmount))}</span></div>
        <div class="row"><span>Platform Commission (${commissionPercent.toFixed(0)}%)</span><strong>${escapeHtml(formatCurrency(order.platformCommission))}</strong></div>
        <div class="row payout"><span>Restaurant Payout</span><span>${escapeHtml(formatCurrency(order.restaurantPayout || order.totalAmount))}</span></div>
      </div>
    </section>

    <section class="footer">
      <span>Generated by Online Food Ordering System</span>
      <span>This is a computer-generated invoice.</span>
    </section>
  </main>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

